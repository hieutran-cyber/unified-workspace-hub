"use client";

import { useOrganization } from "@/hooks/use-organization";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Star } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "clerk";

function ClerkAuthLogic({ onReady }: { onReady: () => void }) {
  const { isSystemReady, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSystemReady) {
      if (!isAuthenticated) {
        router.push("/");
      } else {
        onReady();
      }
    }
  }, [isSystemReady, isAuthenticated, router, onReady]);

  return null;
}

function NextAuthLogic({ onReady }: { onReady: () => void }) {
  const { isSystemReady, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSystemReady) {
      if (!isAuthenticated) {
        router.push("/");
      } else {
        onReady();
      }
    }
  }, [isSystemReady, isAuthenticated, router, onReady]);

  return null;
}

function SelectOrgContent() {
  const {
    allOrgs,
    selectOrg,
    currentOrg,
    defaultOrgId,
    setDefaultOrg,
    isLoading: hookLoading,
  } = useOrganization();
  const { dbUserNotFound, user, isLoading: authLoading } = useAuth();
  const { signOut: clerkSignOut } = useClerkAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSwitching = searchParams.get("switch") === "true";

  const [isReady, setIsReady] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  // Auto-redirect to default if not in "switch" mode
  useEffect(() => {
    if (
      isReady &&
      !hookLoading &&
      defaultOrgId &&
      !isSwitching &&
      !isSelecting &&
      !dbUserNotFound
    ) {
      const hasDefault = allOrgs.find((o) => o.id === defaultOrgId);
      if (hasDefault) {
        handleSelect(defaultOrgId);
      }
    }
  }, [isReady, hookLoading, defaultOrgId, isSwitching, allOrgs, dbUserNotFound]);

  const handleSelect = async (id: string) => {
    console.log("🖱️ Selecting organization:", id);
    setIsSelecting(true);
    try {
      await selectOrg(id);
      console.log("✅ Organization set active, navigating to launcher...");
      router.push("/launcher");
    } catch (err) {
      console.error("❌ Selection error:", err);
      setIsSelecting(false);
    }
  };

  const handleAccessDeniedSignOut = async () => {
    if (provider === "clerk") {
      await clerkSignOut();
      window.location.href = "/";
    } else {
      signOut({ callbackUrl: "/" });
    }
  };

  const toggleDefault = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (defaultOrgId === id) {
      setDefaultOrg(null);
    } else {
      setDefaultOrg(id);
    }
  };

  if (dbUserNotFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="h-20 w-20 bg-destructive/10 rounded-full mx-auto flex items-center justify-center text-destructive mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Tài khoản <span className="font-semibold text-foreground">{user?.email}</span> chưa
              được cấp quyền truy cập vào hệ thống.
            </p>
            <p className="text-sm text-muted-foreground">
              Vui lòng liên hệ với quản trị viên để được cấp quyền trước khi sử dụng.
            </p>
          </div>
          <button
            onClick={handleAccessDeniedSignOut}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {provider === "clerk" ? (
        <ClerkAuthLogic onReady={() => setIsReady(true)} />
      ) : (
        <NextAuthLogic onReady={() => setIsReady(true)} />
      )}

      {!isReady || (allOrgs.length === 0 && hookLoading) || isSelecting ? (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          {isSelecting && (
            <p className="text-sm text-muted-foreground animate-pulse">Switching organization...</p>
          )}
          {!isSelecting && (
            <p className="text-sm text-muted-foreground">Identifying your workspace...</p>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
          <div className="text-center">
            <div className="h-16 w-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-primary-foreground text-3xl font-bold mb-6 shadow-lg shadow-primary/20">
              K
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Please select an organization to continue</p>
          </div>

          <div className="grid gap-4">
            {allOrgs.map((org) => (
              <div
                key={org.id}
                className="group relative flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer overflow-hidden"
                onClick={() => handleSelect(org.id)}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{org.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {org.slug}
                  </p>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                  <button
                    onClick={(e) => toggleDefault(e, org.id)}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      defaultOrgId === org.id
                        ? "bg-amber-100 text-amber-600"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                    title={defaultOrgId === org.id ? "Remove default" : "Set as default"}
                  >
                    <Star className={cn("h-4 w-4", defaultOrgId === org.id && "fill-current")} />
                  </button>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t see your organization?{" "}
            <span className="text-primary hover:underline cursor-pointer">
              Contact Administrator
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default function SelectOrgPage() {
  return (
    <Suspense fallback={null}>
      <SelectOrgContent />
    </Suspense>
  );
}
