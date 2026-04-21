import { Link, useLocation, Outlet } from "@tanstack/react-router";
import { LayoutGrid, Users, ShieldCheck, Building2, Settings, Bell, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/launcher", label: "App Launcher", icon: LayoutGrid },
  { to: "/employees", label: "Nhân viên", icon: Users },
  { to: "/roles", label: "Phân quyền", icon: ShieldCheck },
  { to: "/properties", label: "Tài sản", icon: Building2 },
];

export function WorkspaceLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center text-primary-foreground font-bold text-sm">K</div>
          <div>
            <div className="text-sm font-semibold leading-tight">KiNEX</div>
            <div className="text-[11px] text-muted-foreground">Workspace</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-primary-soft text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">
            <Settings className="h-4 w-4" /> Cài đặt
          </Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Tìm nhân viên, ứng dụng, tài sản..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted border border-transparent focus:border-ring focus:bg-card outline-none text-sm"
            />
          </div>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent-foreground grid place-items-center text-primary-foreground text-xs font-semibold">AD</div>
            <div className="text-sm">
              <div className="font-medium leading-tight">Admin</div>
              <div className="text-[11px] text-muted-foreground">admin@kinex.vn</div>
            </div>
            <Link to="/" className="ml-2 h-9 w-9 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
