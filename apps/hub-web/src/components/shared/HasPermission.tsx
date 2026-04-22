"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React from "react";

interface HasPermissionProps {
  name: string | string[];
  operator?: "AND" | "OR";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HasPermission({
  name,
  operator = "AND",
  children,
  fallback = null,
}: HasPermissionProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  let allowed = false;

  if (Array.isArray(name)) {
    if (operator === "AND") {
      allowed = hasAllPermissions(name);
    } else {
      allowed = hasAnyPermission(name);
    }
  } else {
    allowed = hasPermission(name);
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
