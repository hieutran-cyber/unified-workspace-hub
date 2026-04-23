'use client';

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SidePanel } from "@/components/shared/SidePanel";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { RoleForm } from "@/components/roles/RoleForm";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { OrganizationForm } from "@/components/organizations/OrganizationForm";
import { useCallback, useMemo } from "react";

export function ManagementController() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const panel = searchParams.get("panel");
  const id = searchParams.get("id");
  const action = searchParams.get("action");

  const isOpen = !!panel;

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("panel");
    params.delete("id");
    params.delete("action");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const config = useMemo(() => {
    if (panel === "employee") {
      return {
        title: action === "create" ? "Add New Employee" : "Edit Employee",
        subtitle: action === "create" ? "Create a new identity on KiNEX Hub" : `Employee ID: ${id}`,
        component: <EmployeeForm id={id || undefined} onClose={handleClose} />
      };
    }
    if (panel === "role") {
      return {
        title: action === "create" ? "Create New Role" : "Edit Role",
        subtitle: action === "create" ? "Define access permissions for the system" : `Role: ${id}`,
        component: <RoleForm id={id || undefined} onClose={handleClose} />
      };
    }
    if (panel === "property") {
      return {
        title: action === "create" ? "Add New Property" : "Edit Property",
        subtitle: action === "create" ? "Register a business location to Hub" : `Property ID: ${id}`,
        component: <PropertyForm id={id || undefined} onClose={handleClose} />
      };
    }
    if (panel === "organization") {
      return {
        title: action === "create" ? "Create New Organization" : "Edit Organization",
        subtitle: action === "create" ? "Set up new corporate structure" : `Org ID: ${id}`,
        component: <OrganizationForm id={id || undefined} onClose={handleClose} />
      };
    }
    return null;
  }, [panel, id, action, handleClose]);

  if (!config) return null;

  return (
    <SidePanel 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={config.title}
      subtitle={config.subtitle}
    >
      {config.component}
    </SidePanel>
  );
}
