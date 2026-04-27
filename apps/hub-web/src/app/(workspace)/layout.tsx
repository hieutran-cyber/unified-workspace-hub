"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, ShieldCheck, Settings, Bell, Search, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppSwitcher } from "@/components/shared/AppSwitcher";
import { UserNav } from "@/components/shared/UserNav";
import { ManagementController } from "@/components/shared/ManagementController";
import { OrgSwitcher } from "@/components/shared/OrgSwitcher";
import { Suspense, useEffect } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";

const operationalNav = [
  { href: "/launcher", label: "App Launcher", icon: LayoutGrid },
  {
    href: "/properties",
    label: "Properties",
    icon: Building2,
    permission: "hub:properties:view",
  },
  { href: "/employees", label: "Employees", icon: Users, permission: "hub:users:view" },
  { href: "/roles", label: "Permissions", icon: ShieldCheck, permission: "hub:roles:view" },
];

const systemNav = [
  {
    href: "/manage-org",
    label: "Organization Management",
    icon: Building2,
    permission: "hub:org:manage",
  },
];

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const { currentOrg, isLoading: orgLoading } = useOrganization();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !orgLoading && !currentOrg && pathname !== "/select-org") {
      router.push("/select-org");
    }
  }, [currentOrg, orgLoading, router, pathname, isAuthenticated]);

  if (authLoading || (isAuthenticated && orgLoading)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const canRender = currentOrg || pathname === "/select-org";

  if (!canRender && isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex w-full bg-background font-sans">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center text-primary-foreground font-bold text-sm">
            K
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight text-foreground">KiNEX</div>
            <div className="text-[11px] text-muted-foreground">Workspace</div>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-4 px-3 space-y-8">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              Operations
            </div>
            {operationalNav
              .filter((item) => !item.permission || hasPermission(item.permission))
              .map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      active
                        ? "bg-primary-soft text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
          </div>

          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              System
            </div>
            {systemNav
              .filter((item) => !item.permission || hasPermission(item.permission))
              .map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      active
                        ? "bg-primary-soft text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
          </div>
        </div>

        <div className="p-3 border-t border-border mt-auto">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
          >
            <Settings className="h-4 w-4" /> General Settings
          </Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search employees, apps..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted border border-transparent focus:border-ring focus:bg-card outline-none text-sm"
            />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <OrgSwitcher />
            <div className="h-6 w-px bg-border mx-1" />
            <AppSwitcher />
            <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground mr-1">
              <Bell className="h-4 w-4" />
            </button>
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <Suspense fallback={null}>
        <ManagementController />
      </Suspense>
    </div>
  );
}
