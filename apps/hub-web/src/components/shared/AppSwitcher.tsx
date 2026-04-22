"use client";

import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const apps = [
  { name: "Odoo", color: "bg-[oklch(0.7_0.15_290)]", label: "ERP", href: "#" },
  { name: "PMS", color: "bg-[oklch(0.65_0.15_200)]", label: "Hotel", href: "http://localhost:3005" },
  { name: "POS", color: "bg-[oklch(0.7_0.16_145)]", label: "Sales", href: "#" },
  { name: "Analytics", color: "bg-[oklch(0.72_0.15_50)]", label: "BI", href: "#" },
];

export function AppSwitcher() {
  return (
    <div className="relative group">
      <button
        className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground transition-all active:scale-95"
        title="Chuyển đổi ứng dụng"
      >
        <LayoutGrid className="h-[18px] w-[18px]" />
      </button>

      {/* App Switcher Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-72 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4 px-2 tracking-widest">
          Ứng dụng của bạn
        </div>
        <div className="grid grid-cols-3 gap-y-6 gap-x-2">
          {apps.map((app) => (
            <a
              key={app.name}
              href={app.href}
              className="flex flex-col items-center gap-2 group/item transition-transform active:scale-90 text-center no-underline"
            >
              <div
                className={cn(
                  "h-12 w-12 rounded-xl grid place-items-center text-white font-bold text-lg shadow-sm group-hover/item:shadow-lg group-hover/item:-translate-y-1 transition-all mx-auto",
                  app.color,
                )}
              >
                {app.name[0]}
              </div>
              <span className="text-[11px] font-medium text-foreground">{app.name}</span>
            </a>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center px-1">
          <span className="text-[10px] text-muted-foreground italic">Powered by KiNEX SSO</span>
          <button className="text-[10px] text-primary font-bold hover:underline">
            Tất cả ứng dụng
          </button>
        </div>
      </div>
    </div>
  );
}
