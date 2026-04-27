"use client";

import { useSession } from "next-auth/react";
import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "keycloak";

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

  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetched,
    fetchStatus,
  } = useQuery({
    queryKey: ["me", activeToken, clerkAuth.orgId],
    queryFn: () => apiClient("/users/me", { token: activeToken }),
    enabled: !!activeToken && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // 5. Build user object
    const user = useMemo(() => {
    if (provider === "clerk") {
      if (!clerkUser) return null;
      return {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        name: clerkUser.fullName || "",
        permissions: profile?.permissions || [],
      };
    } else {
      if (!session?.user) return null;
      return {
        id: (session.user as any).id,
        email: session.user.email || "",
        name: session.user.name || "",
        permissions: profile?.permissions || [],
      };
    }
  }, [clerkUser, session, profile]);

  const isDataReady = isFetched;

  return {
    user,
    token: activeToken,
    orgId: clerkAuth.orgId,
    isAuthenticated: !!isAuthenticated,
    isSystemReady: !isAuthLoading,
    isProfileLoading: isAuthenticated && !isDataReady,
    isLoading: isAuthLoading || (isAuthenticated && !isDataReady),
    provider: provider as "clerk" | "keycloak",
    allowedApps: profile?.allowedApps || [],
    profile,
    dbUserNotFound: isAuthenticated && isDataReady && !profile?.id,
  };
}
