"use client";

import { Building2, Globe, Mail, Phone, MapPin } from "lucide-react";

interface OrganizationFormProps {
  id?: string;
  onClose: () => void;
}

export function OrganizationForm({ id, onClose }: OrganizationFormProps) {
  const isCreate = !id;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-6">
        <div className="grid gap-4">
          <label className="text-sm font-semibold text-foreground">Basic Information</label>
          <div className="grid gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Organization Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Example: KiNEX Group"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-all shadow-sm"
                  defaultValue={id === "1" ? "KiNEX" : id === "2" ? "Malasia Org" : ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Slug (URL Identifier)
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Example: kinex-group"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-all shadow-sm"
                  defaultValue={id === "1" ? "kinex" : id === "2" ? "malasia-org" : ""}
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Will be used as: sub-domain.kinex.com
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <label className="text-sm font-semibold text-foreground">Contact & Address</label>
          <div className="grid gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="admin@company.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="+84..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Headquarters
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  placeholder="Full address..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm shadow-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onClose}
          className="flex-1 h-12 rounded-xl border border-border bg-card hover:bg-muted font-bold text-sm transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {isCreate ? "Create Organization" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
