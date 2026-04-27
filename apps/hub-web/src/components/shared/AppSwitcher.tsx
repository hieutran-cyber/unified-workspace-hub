"use client";

import {
  LayoutGrid,
  Bed,
  Users,
  CircleDollarSign,
  LayoutDashboard,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

// Icon mapping based on application type
const ICON_MAP: Record<string, any> = {
  hub: LayoutDashboard,
  pms: Bed,
  pos: Users,
  odoo: CircleDollarSign,
  analytics: CircleDollarSign, // Fallback to dollar for now or BarChart if available
};

export function AppSwitcher() {
  const { allowedApps } = useAuth();

  return (
    <div className="relative group">
      <button
        className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground transition-all active:scale-95"
        title="App Switcher"
      >
        <LayoutGrid className="h-[18px] w-[18px]" />
      </button>

      {/* App Switcher Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-80 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-4 px-2">
          Your Applications
        </div>
        <div className="grid grid-cols-2 gap-2">
          {allowedApps?.map((app: any) => {
            const Icon = ICON_MAP[app.slug] || ICON_MAP[app.type] || HelpCircle;

            return (
              <a
                key={app.id}
                href={app.access ? app.baseUrl : "#"}
                className={cn(
                  "p-4 rounded-xl border transition-all group/item flex flex-col items-center text-center gap-2",
                  app.slug === "hub"
                    ? "bg-primary/5 border-primary/10"
                    : !app.access
                      ? "opacity-40 grayscale cursor-not-allowed border-transparent bg-muted/50"
                      : "bg-muted/30 border-transparent hover:border-primary/20 hover:bg-primary/5",
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg grid place-items-center transition-all",
                    app.access
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <div
                    className={cn(
                      "text-[11px] font-black leading-tight",
                      app.access ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {app.name}
                  </div>
                  <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-tighter">
                    {app.slug === "hub" ? (
                      <span className="text-primary font-black">HUB</span>
                    ) : !app.access ? (
                      "No Access"
                    ) : (
                      "Available"
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center px-1">
          <span className="text-[10px] text-muted-foreground italic">Powered by KiNEX SSO</span>
          <button className="text-[10px] text-primary font-bold hover:underline">
            Manage Apps
          </button>
        </div>
      </div>
    </div>
  );
}
