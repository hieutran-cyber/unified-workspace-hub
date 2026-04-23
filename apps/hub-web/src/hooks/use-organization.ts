"use client";

import { useState, useEffect } from "react";

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export const MOCK_ORGANIZATIONS: Organization[] = [
  { id: "1", name: "KiNEX", slug: "kinex" },
  { id: "2", name: "Malasia Org", slug: "malasia-org" },
];

export function useOrganization() {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedOrgId = localStorage.getItem("current_org_id");
    if (savedOrgId) {
      const org = MOCK_ORGANIZATIONS.find((o) => o.id === savedOrgId);
      if (org) {
        setCurrentOrg(org);
      }
    }
    setIsLoading(false);
  }, []);

  const selectOrg = (orgId: string) => {
    const org = MOCK_ORGANIZATIONS.find((o) => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem("current_org_id", orgId);
    }
  };

  return {
    currentOrg,
    selectOrg,
    allOrgs: MOCK_ORGANIZATIONS,
    isLoading,
  };
}
