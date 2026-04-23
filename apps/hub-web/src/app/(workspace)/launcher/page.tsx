"use client";

import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Users,
  Activity,
  Loader2,
  LayoutGrid,
  Bed,
  ShoppingCart,
  BarChart3,
  LucideIcon,
} from "lucide-react";
import { useApplications } from "@/hooks/api/use-apps";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Active Applications", value: "3 / 4", icon: Activity, tone: "text-primary" },
  { label: "Colleagues Online", value: "47", icon: Users, tone: "text-primary" },
];

const APP_CONFIG: Record<string, { icon: LucideIcon; color: string }> = {
  "Odoo ERP": {
    icon: LayoutGrid,
    color: "from-violet-500 to-purple-600 shadow-purple-500/20",
  },
  PMS: {
    icon: Bed,
    color: "from-blue-500 to-indigo-600 shadow-blue-500/20",
  },
  POS: {
    icon: ShoppingCart,
    color: "from-emerald-400 to-teal-600 shadow-emerald-500/20",
  },
  Analytics: {
    icon: BarChart3,
    color: "from-orange-400 to-amber-600 shadow-orange-500/20",
  },
};

export default function LauncherPage() {
  const { data: apps, isLoading } = useApplications();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back, Admin 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select an application to continue — automatic sign-on enabled (Zero-Login).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.tone}`} />
            </div>
            <div className="text-2xl font-semibold mt-2 text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Your Applications
          </h2>
          <span className="text-xs text-muted-foreground">Role: Regional Director</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(apps || []).map((app) => (
            <button
              key={app.id}
              className="group text-left p-5 rounded-xl border border-border bg-card hover:shadow-lg hover:border-ring/40 transition-all relative overflow-hidden active:scale-[0.98]"
            >
              <div
                className={cn(
                  "h-12 w-12 rounded-xl bg-gradient-to-br grid place-items-center text-white shadow-lg group-hover:scale-105 transition-transform",
                  APP_CONFIG[app.name]?.color || "from-gray-400 to-gray-600",
                )}
              >
                {(() => {
                  const Icon = APP_CONFIG[app.name]?.icon || LayoutGrid;
                  return <Icon className="h-6 w-6 stroke-[2.5]" />;
                })()}
              </div>
              <div className="mt-4">
                <div className="font-semibold text-sm flex items-center gap-2 text-foreground">
                  {app.name}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{app.description}</div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-medium">Access</span>
                {app.status === "active" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-success font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-warning-foreground font-semibold">
                    <Clock className="h-3 w-3" /> Provisioning
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card">
        <h3 className="text-sm font-semibold mb-4 text-foreground">Recent Activity</h3>
        <div className="space-y-3 text-sm">
          {[
            {
              t: "2 minutes ago",
              a: "Nguyen Van An",
              e: "was assigned Accountant role, Odoo activated",
            },
            {
              t: "15 minutes ago",
              a: "Tran Thi Binh",
              e: "changed role Receptionist → Regional Director, granted PMS + POS",
            },
            {
              t: "1 hour ago",
              a: "System",
              e: "successfully synchronized personnel data to Odoo & PMS",
            },
          ].map((x, i) => (
            <div
              key={i}
              className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
            >
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-foreground">
                  <span className="font-semibold">{x.a}</span>{" "}
                  <span className="text-muted-foreground">{x.e}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 font-medium">{x.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
