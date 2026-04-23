"use client";

import { useOrganization, MOCK_ORGANIZATIONS } from "@/hooks/use-organization";
import { 
  Building2, 
  Globe, 
  ShieldCheck, 
  Plus,
  ArrowRight,
  ExternalLink,
  Users
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ManageOrgPage() {
  const { currentOrg } = useOrganization();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header section */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            Organization Management
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Manage legal entities and corporate structures within the KiNEX ecosystem.
          </p>
        </div>
        <Link
          href="?panel=organization&action=create"
          className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" /> Add Organization
        </Link>
      </div>

      {/* Grid view of organizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {MOCK_ORGANIZATIONS.map((org) => (
          <div 
            key={org.id} 
            className={cn(
              "group relative bg-card border rounded-3xl p-6 transition-all hover:shadow-xl hover:shadow-primary/5",
              currentOrg?.id === org.id ? "border-primary/50 ring-1 ring-primary/20" : "border-border/50"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary-soft text-accent-foreground flex items-center justify-center text-2xl font-bold shadow-inner">
                  {org.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {org.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-1">
                    <Globe className="h-3 w-3" /> {org.slug}.kinex.com
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`?panel=organization&id=${org.id}`}
                  className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                  title="Edit"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border/50 pt-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Properties</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-lg font-black">{org.id === "1" ? "12" : "3"}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Members</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-lg font-black">{org.id === "1" ? "1.2k" : "86"}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Roles</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-lg font-black">24</span>
                </div>
              </div>
            </div>

            {currentOrg?.id === org.id && (
              <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-tighter">
                Current Session
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex items-center gap-8 relative overflow-hidden">
        <div className="space-y-2 flex-1 relative z-10">
          <h2 className="text-xl font-bold text-primary">Multi-Organization Architecture</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Workspace Hub allows you to manage multiple legal entities in a single interface. 
            Each organization can have its own properties, personnel, and permissions, ensuring absolute data isolation.
          </p>
        </div>
        <div className="hidden md:block opacity-10 rotate-12">
          <Building2 className="h-32 w-32 text-primary" />
        </div>
      </div>
    </div>
  );
}
