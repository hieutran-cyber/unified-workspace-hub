import { NextAuthOptions, DefaultSession } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

async function refreshAccessToken(token: any) {
  try {
    console.log("📡 [NextAuth] Calling Keycloak to refresh token...");
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_ID || "workspace-hub",
        client_secret: process.env.KEYCLOAK_SECRET || "kinex-hub-secret-2026",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error("❌ [NextAuth] Keycloak refresh failed:", refreshedTokens);
      throw refreshedTokens;
    }

    console.log("✅ [NextAuth] Token refreshed successfully");
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fallback to old refresh token
    };
  } catch (error) {
    console.error("❌ [NextAuth] RefreshAccessTokenError:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || "workspace-hub",
      clientSecret: process.env.KEYCLOAK_SECRET || "kinex-hub-secret-2026",
      issuer: process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/KiNEX",
    }),
  ],
  pages: {
    signIn: "/",
    error: "/auth/access-denied",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "keycloak") {
        const userEmail = user.email || (profile as any)?.email;
        if (!userEmail) return false;

        try {
          const res = await fetch("http://localhost:3001/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              name: user.name || (profile as any)?.name,
              sub: account.providerAccountId,
            }),
          });

          if (!res.ok) return "/auth/access-denied";
        } catch (error) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account && user) {
        console.log(
          "🔑 [NextAuth] Initial sign-in, setting token expires at:",
          (account.expires_at || 0) * 1000,
        );
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: (account.expires_at || 0) * 1000,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          user,
          permissions: (profile as any)?.hub_permissions || [],
        };
      }

      // Return previous token if the access token has not expired yet (with 30s buffer)
      const now = Date.now();
      const expiresAt = token.accessTokenExpires as number;
      if (now < expiresAt - 30 * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      console.log("🔄 [NextAuth] Access token expired or near expiry, refreshing...");
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.user as any)?.id || token.sub;
        session.user.permissions = (token.permissions as string[]) || [];
        session.accessToken = token.accessToken as string;
        session.idToken = token.idToken as string;
        session.error = token.error as string;
      }
      return session;
    },
  },
};

// Extend types
declare module "next-auth" {
  interface Session {
    error?: string;
    accessToken?: string;
    idToken?: string;
    user: {
      id: string;
      permissions: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    permissions?: string[];
    error?: string;
  }
}
