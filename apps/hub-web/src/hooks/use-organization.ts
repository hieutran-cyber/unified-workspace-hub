"use client";

import { useState, useEffect, useMemo } from "react";
import { useOrganizationList, useOrganization as useClerkOrg } from "@clerk/nextjs";
import { useAuth } from "./use-auth";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "clerk";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  clerkOrgId?: string;
}

export function useOrganization() {
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const { token, isAuthenticated, orgId } = useAuth();

  // Clerk hooks
  const {
    userMemberships,
    isLoaded: listLoaded,
    setActive,
  } = useOrganizationList({
    userMemberships: provider === "clerk" ? true : undefined,
  });

  const { organization: activeOrg, isLoaded: orgLoaded } = useClerkOrg();

  // Get profile data which now includes defaultOrganizationId
  // We use useAuth's profile data implicitly through an internal query if needed,
  // but to keep it simple and avoid circular deps, let's fetch it or pass it.
  // Actually useAuth is fine to use here.
  const { profile } = useAuth() as any; // Cast for simplicity in this scratchpad

  useEffect(() => {
    if (provider === "clerk") {
      if (listLoaded) {
        const orgs = userMemberships.data.map((mem) => ({
          id: mem.organization.id,
          name: mem.organization.name,
          slug: mem.organization.slug || "",
          clerkOrgId: mem.organization.id,
        }));
        setAllOrgs(orgs);
        setInternalLoading(false);
      }
    } else {
      const MOCK_ORGANIZATIONS: Organization[] = [
        { id: "1", name: "KiNEX", slug: "kinex" },
        { id: "2", name: "Malasia Org", slug: "malasia-org" },
      ];
      setAllOrgs(MOCK_ORGANIZATIONS);
      setInternalLoading(false);
    }
  }, [listLoaded, userMemberships.data]);

  // Derived current org from Clerk's active organization
  const currentOrg = useMemo(() => {
    if (provider === "clerk") {
      if (!activeOrg) return null;
      return {
        id: activeOrg.id,
        name: activeOrg.name,
        slug: activeOrg.slug || "",
        clerkOrgId: activeOrg.id,
      };
    }
    return allOrgs[0] || null;
  }, [activeOrg, allOrgs]);

  const queryClient = useQueryClient();
  const [localDefaultId, setLocalDefaultId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocalDefaultId(localStorage.getItem("default_org_id"));
    }
  }, []);

  const defaultOrgId = localDefaultId || profile?.database?.defaultOrganizationId;

  const setDefaultOrg = async (orgId: string | null) => {
    if (!isAuthenticated || !token) return;

    // Optimistic update for immediate UI feedback
    setLocalDefaultId(orgId);

    try {
      // 1. Update in DB
      await apiClient("/users/me/default-org", {
        method: "PUT",
        token,
        body: { orgId },
      });

      // 2. Keep it in localStorage
      if (orgId) {
        localStorage.setItem("default_org_id", orgId);
      } else {
        localStorage.removeItem("default_org_id");
      }

      // 3. Update cache manually to avoid full re-fetch and re-render
      queryClient.setQueryData(["me", token, orgId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          database: {
            ...oldData.database,
            defaultOrganizationId: orgId,
          },
        };
      });
    } catch (err) {
      console.error("Failed to set default org:", err);
      // Rollback on error
      setLocalDefaultId(profile?.database?.defaultOrganizationId || null);
    }
  };

  const selectOrg = async (orgId: string) => {
    if (provider === "clerk" && setActive) {
      await setActive({ organization: orgId });
    }
  };

  const isLoading = provider === "clerk" ? !listLoaded || !orgLoaded : internalLoading;

  return {
    currentOrg,
    selectOrg,
    setDefaultOrg,
    allOrgs,
    defaultOrgId,
    isLoading,
  };
}
