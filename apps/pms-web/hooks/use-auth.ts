"use client";

import { useSession } from "next-auth/react";
import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";
import { useMemo, useState, useEffect } from "react";

const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "clerk";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  permissions: string[];
}

export function useAuth() {
  // 1. Always call NextAuth hooks
  const { data: session, status } = useSession();
  const nextAuthToken = session?.accessToken as string | null;

  // 2. Always call Clerk hooks
  const clerkAuth = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const [clerkToken, setClerkToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (clerkAuth.isSignedIn) {
      clerkAuth.getToken({ template: "hub-api" }).then(setClerkToken);
    } else {
      setClerkToken(null);
    }
  }, [clerkAuth.isSignedIn, clerkAuth.orgId, clerkAuth.getToken]);

  // 3. Determine active token and status
  const activeToken = provider === "clerk" ? clerkToken : nextAuthToken;
  const isAuthenticated = provider === "clerk" ? clerkAuth.isSignedIn : status === "authenticated";
  const isAuthLoading = provider === "clerk" ? !clerkAuth.isLoaded : status === "loading";

  // 4. Fetch profile from Hub API (to get allowedApps and permissions)
  useEffect(() => {
    if (activeToken && isAuthenticated) {
      fetch("http://localhost:3001/users/me", {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setProfile(data);
          }
        })
        .catch(console.error);
    } else {
      setProfile(null);
    }
  }, [activeToken, isAuthenticated]);

  // 5. Build user object
  const user = useMemo(() => {
    if (provider === "clerk") {
      if (!clerkUser) return null;
      return {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        name: clerkUser.fullName || "",
        permissions: profile?.permissions || (clerkUser.publicMetadata?.permissions as string[]) || [],
      };
    } else {
      if (!session?.user) return null;
      return {
        id: (session.user as any).id,
        email: session.user.email || "",
        name: session.user.name || "",
        permissions: profile?.permissions || (session.user as any).permissions || [],
      };
    }
  }, [clerkUser, session, profile]);

  return {
    user,
    token: activeToken,
    isAuthenticated: !!isAuthenticated,
    isLoading: isAuthLoading,
    provider: provider as "clerk" | "keycloak",
    allowedApps: profile?.allowedApps || [],
  };
}
