"use client";

import { Check, Minus, Save, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRoles } from "@/hooks/api/use-roles";
import { useApplications } from "@/hooks/api/use-apps";
import { HasPermission } from "@/components/shared/HasPermission";

interface App {
  id: string;
  name: string;
}

interface Mapping {
  appId: string;
  appRoleName: string;
  app?: {
    name: string;
  };
}

interface Role {
  id: string;
  name: string;
  description: string;
  mappings: Mapping[];
  _count: { users: number };
}

export default function RolesPage() {
  // 1. Fetch Roles & Apps using custom hooks
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: apps, isLoading: appsLoading } = useApplications();

  if (rolesLoading || appsLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Role × Application Matrix
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Live data from KiNEX Hub Backend — Centralized configuration for the entire system.
          </p>
        </div>
        <div className="flex gap-2">
          <HasPermission name="hub:roles:manage">
            <Link
              href="?panel=role&action=create"
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> Add Role
            </Link>
          </HasPermission>
          <button className="h-9 px-4 rounded-lg bg-background border border-border text-foreground text-sm font-semibold flex items-center gap-2 hover:bg-muted transition-colors">
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/30">
              <tr>
                <th className="text-left font-semibold px-5 py-3 min-w-[240px]">Role</th>
                <th className="text-left font-semibold px-5 py-3">Personnel</th>
                {(apps || []).map((a) => (
                  <th
                    key={a.id}
                    className="text-center font-semibold px-4 py-3 min-w-[140px] border-l border-border/20"
                  >
                    {a.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {(roles || []).map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors group cursor-pointer">
                  <td className="px-5 py-4">
                    <Link href={`?panel=role&id=${r.id}`}>
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {r.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{r.description}</div>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-mono bg-muted text-foreground px-2 py-0.5 rounded font-bold">
                      {r._count.users} users
                    </span>
                  </td>
                  {(apps || []).map((app) => {
                    const mapping = r.mappings.find((m) => m.appId === app.id);
                    const perm = mapping?.appRoleName;

                    return (
                      <td key={app.id} className="px-4 py-4 text-center border-l border-border/10">
                        {perm ? (
                          <div className="inline-flex flex-col items-center gap-1 group">
                            <div className="h-7 w-7 rounded-lg bg-success/10 grid place-items-center mb-1 group-hover:scale-110 transition-transform">
                              <Check className="h-4 w-4 text-success" />
                            </div>
                            <span className="text-[11px] text-muted-foreground font-medium">
                              {perm}
                            </span>
                          </div>
                        ) : (
                          <div className="h-7 w-7 rounded-lg bg-muted/60 grid place-items-center mx-auto opacity-50">
                            <Minus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
          <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">
            Activities (Real-time)
          </div>
          <ol className="space-y-4 text-sm">
            {[
              "Database ready with PostgreSQL",
              "User synchronization from Keycloak active",
              "Permission matrix reading from CentralRole table",
              "Provisioning system (BullMQ) standby",
            ].map((t, i) => (
              <li key={i} className="flex gap-4">
                <span className="h-6 w-6 rounded-full bg-primary-soft text-accent-foreground text-[11px] font-bold grid place-items-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed font-medium">{t}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="p-6 rounded-xl border border-border bg-gradient-to-br from-primary-soft/50 to-card shadow-sm flex flex-col justify-center">
          <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
            System Status
          </div>
          <div className="text-4xl font-bold tracking-tight text-success">ONLINE</div>
          <div className="text-sm text-muted-foreground mt-2 font-medium">
            Backend (NestJS) · Database (Postgres) · Redis (Alive)
          </div>
          <div className="mt-6 h-2.5 rounded-full bg-muted overflow-hidden ring-1 ring-border">
            <div className="h-full w-full bg-success shadow-[0_0_8px_rgba(var(--success),0.5)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
