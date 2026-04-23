"use client";

import { useOrganization } from "@/hooks/use-organization";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SelectOrgPage() {
  const { allOrgs, selectOrg } = useOrganization();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleSelect = (id: string) => {
    selectOrg(id);
    router.push("/launcher");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="h-16 w-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-primary-foreground text-3xl font-bold mb-6 shadow-lg shadow-primary/20">
            K
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Please select an organization to continue</p>
        </div>

        <div className="grid gap-4">
          {allOrgs.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelect(org.id)}
              className="group relative flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-left overflow-hidden"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{org.name}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{org.slug}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />

              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t see your organization?{" "}
          <span className="text-primary hover:underline cursor-pointer">Contact Administrator</span>
        </p>
      </div>
    </div>
  );
}
