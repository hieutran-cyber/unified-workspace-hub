"use client";

import { useOrganization } from "@/hooks/use-organization";
import { Building2, ChevronsUpDown, Check, PlusCircle, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

export function OrgSwitcher() {
  const { currentOrg, allOrgs, selectOrg, defaultOrgId, setDefaultOrg } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  if (!currentOrg) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-left group"
      >
        <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center text-primary">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="flex flex-col min-w-[80px]">
          <span className="text-xs font-semibold leading-none text-foreground">
            {currentOrg.name}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {currentOrg.slug}
          </span>
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Organizations
            </div>
            <div className="max-h-[300px] overflow-auto px-1">
              {allOrgs.map((org) => (
                <div
                  key={org.id}
                  className={cn(
                    "group/item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                    currentOrg.id === org.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={async () => {
                    await selectOrg(org.id);
                    queryClient.invalidateQueries();
                    setIsOpen(false);
                  }}
                >
                  <Building2 className="h-4 w-4" />
                  <span className="flex-1 text-left">{org.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (defaultOrgId === org.id) {
                        setDefaultOrg(null);
                      } else {
                        setDefaultOrg(org.id);
                      }
                    }}
                    className={cn(
                      "p-1.5 rounded-md hover:bg-background/50 transition-colors opacity-0 group-hover/item:opacity-100",
                      defaultOrgId === org.id && "opacity-100 text-amber-500",
                    )}
                    title={defaultOrgId === org.id ? "Remove default" : "Set as default"}
                  >
                    <Star
                      className={cn("h-3.5 w-3.5", defaultOrgId === org.id && "fill-current")}
                    />
                  </button>
                  {currentOrg.id === org.id && <Check className="h-3.5 w-3.5" />}
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-border px-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <PlusCircle className="h-4 w-4" />
                Create New Organization
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
