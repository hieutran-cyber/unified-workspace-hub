"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, ShieldCheck, Settings, Bell, Search, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppSwitcher } from "@/components/shared/AppSwitcher";
import { UserNav } from "@/components/shared/UserNav";
import { ManagementController } from "@/components/shared/ManagementController";
import { Suspense } from "react";

const nav = [
  { href: "/launcher", label: "App Launcher", icon: LayoutGrid },
  { href: "/properties", label: "Cơ sở (Properties)", icon: Building2, permission: "hub:properties:view" },
  { href: "/employees", label: "Nhân viên", icon: Users, permission: "hub:users:view" },
  { href: "/roles", label: "Phân quyền", icon: ShieldCheck, permission: "hub:roles:view" },
];

import { usePermissions } from "@/hooks/use-permissions";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

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
        <nav className="flex-1 p-3 space-y-1">
          {nav
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
        </nav>
        <div className="p-3 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
          >
            <Settings className="h-4 w-4" /> Cài đặt
          </Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Tìm nhân viên, ứng dụng..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted border border-transparent focus:border-ring focus:bg-card outline-none text-sm"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
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
