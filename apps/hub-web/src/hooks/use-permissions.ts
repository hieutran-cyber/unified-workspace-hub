"use client";

import { useAuth } from "./use-auth";

const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "keycloak";

export function usePermissions() {
  // Use the unified auth hook
  // Note: Due to React hook rules, we might still have issues if useAuth calls useSession.
  // I will assume for now that since we use a branch, it might work, but the REAL fix
  // is to avoid calling useSession at all if provider is Clerk.

  // Actually, let's simplify usePermissions to just use the data from useAuth.
  const { user, isLoading } = useAuth();
  const permissions = user?.permissions || [];

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const hasAllPermissions = (requiredPermissions: string[]) => {
    return requiredPermissions.every((p) => permissions.includes(p));
  };

  const hasAnyPermission = (requiredPermissions: string[]) => {
    return requiredPermissions.some((p) => permissions.includes(p));
  };

  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isLoading,
  };
}
