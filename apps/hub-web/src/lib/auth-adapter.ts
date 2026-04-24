"use client";

/**
 * Adapter cho phép code UI dùng chung interface, không phụ thuộc vào provider cụ thể.
 * Bật provider bằng NEXT_PUBLIC_AUTH_PROVIDER = "keycloak" | "clerk" (default: keycloak).
 */
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

export type AuthProviderName = "keycloak" | "clerk";

export const AUTH_PROVIDER: AuthProviderName =
  (process.env.NEXT_PUBLIC_AUTH_PROVIDER as AuthProviderName) || "keycloak";

export const isClerk = () => AUTH_PROVIDER === "clerk";

export function useAuthSession() {
  if (isClerk()) {
    // Lazy-require để tránh lỗi khi chưa cài @clerk/nextjs
    const { useUser, useAuth } = require("@clerk/nextjs");
    const { isSignedIn, user, isLoaded } = useUser();
    const { signOut } = useAuth();
    return {
      status: !isLoaded ? "loading" : isSignedIn ? "authenticated" : "unauthenticated",
      user: user
        ? {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName,
            image: user.imageUrl,
          }
        : null,
      signOut: () => signOut({ redirectUrl: "/" }),
    };
  }
  const { data, status } = useSession();
  return {
    status,
    user: data?.user || null,
    signOut: () => nextAuthSignOut({ callbackUrl: "/" }),
  };
}

export function signInWithProvider() {
  if (isClerk()) {
    if (typeof window !== "undefined") window.location.href = "/sign-in";
    return;
  }
  nextAuthSignIn("keycloak");
}

/** Lấy access token gắn vào header khi gọi API. */
export async function getAccessToken(): Promise<string | null> {
  if (isClerk()) {
    if (typeof window === "undefined") return null;
    const w = window as any;
    if (w.Clerk?.session) {
      return w.Clerk.session.getToken({ template: "hub-api" });
    }
    return null;
  }
  // Keycloak: token đã được NextAuth bỏ vào session.accessToken — callers đọc từ useSession().
  return null;
}
