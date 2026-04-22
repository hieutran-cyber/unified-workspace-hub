import { useSession } from "next-auth/react";

export function usePermissions() {
  const { data: session, status } = useSession();

  const permissions = session?.user?.permissions || [];

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
    isLoading: !session && status === "loading",
  };
}
