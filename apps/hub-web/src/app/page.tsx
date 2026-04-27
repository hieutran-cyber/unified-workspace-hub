"use client";

import { signIn, useSession } from "next-auth/react";
import { useAuth } from "@clerk/nextjs";
import { ShieldCheck, AlertCircle, RefreshCcw } from "lucide-react";
import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "keycloak";

function ClerkAuthLogic({ onAuth }: { onAuth: (isSignedIn: boolean) => void }) {
  const { isLoaded, isSignedIn } = useAuth();
  useEffect(() => {
    if (isLoaded) onAuth(isSignedIn ?? false);
  }, [isLoaded, isSignedIn, onAuth]);
  return null;
}

function NextAuthLogic({ onAuth }: { onAuth: (status: string) => void }) {
  const { status } = useSession();
  useEffect(() => {
    onAuth(status);
  }, [status, onAuth]);
  return null;
}

function LandingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const navigationTriggered = useRef(false);

  const handleClerkAuth = (isSignedIn: boolean) => {
    if (navigationTriggered.current) return;
    if (isSignedIn) {
      navigationTriggered.current = true;
      localStorage.removeItem("current_org_id");
      router.push("/select-org");
    } else {
      navigationTriggered.current = true;
      router.push("/sign-in");
    }
  };

  const handleNextAuth = (status: string) => {
    if (navigationTriggered.current) return;
    if (status === "authenticated") {
      navigationTriggered.current = true;
      localStorage.removeItem("current_org_id");
      router.push("/select-org");
    } else if (status === "unauthenticated" && !error) {
      navigationTriggered.current = true;
      const timeout = setTimeout(() => {
        signIn("keycloak");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  };

  const handleRetry = () => {
    if (provider === "clerk") {
      router.push("/sign-in");
    } else {
      signIn("keycloak");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden font-sans">
      {/* Auth Logic Injection */}
      {provider === "clerk" ? (
        <ClerkAuthLogic onAuth={handleClerkAuth} />
      ) : (
        <NextAuthLogic onAuth={handleNextAuth} />
      )}

      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[oklch(0.4_0.15_265/0.1)] blur-[120px] rounded-full animate-pulse [animation-delay:1s]" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative">
          <div
            className={`h-24 w-24 rounded-[2.5rem] ${error ? "bg-destructive" : "bg-primary"} shadow-2xl ${error ? "shadow-destructive/30" : "shadow-primary/30"} grid place-items-center text-primary-foreground font-black text-4xl ring-8 ${error ? "ring-destructive/10" : "ring-primary/10"} ${!error && "animate-bounce"}`}
          >
            K
          </div>
          {!error && (
            <div className="absolute -inset-4 border-2 border-primary/20 rounded-[3rem] animate-ping [animation-duration:3s]" />
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            KiNEX <span className={error ? "text-destructive" : "text-primary"}>Workspace</span>
          </h1>

          <div className="flex flex-col items-center gap-4">
            {error ? (
              <div className="space-y-6 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 px-4 py-3 bg-destructive/10 rounded-2xl border border-destructive/20 max-w-sm">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <p className="text-xs font-bold text-destructive text-left leading-relaxed">
                    Authentication system connection error. Please check your{" "}
                    {provider === "clerk" ? "Clerk" : "Keycloak"} configuration or try again later.
                  </p>
                </div>
                <button
                  onClick={handleRetry}
                  className="mx-auto flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  <RefreshCcw className="h-4 w-4" /> Try Again
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border/50">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Connecting to {provider === "clerk" ? "Clerk" : "Keycloak"} system...
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 pt-12 grayscale opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`h-4 w-4 ${error ? "text-destructive" : "text-primary"}`} />
            <span className="text-[10px] uppercase font-black tracking-tighter">
              Unified Identity
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="text-[10px] uppercase font-black tracking-tighter italic">
            Enterprise SSO Service
          </div>
        </div>
      </div>

      <footer className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-[11px] text-muted-foreground font-medium opacity-50 uppercase tracking-widest leading-loose">
          © 2026 KiNEX Ecosystem • Secure Gateway
          <br />
          Powered by{" "}
          {provider === "clerk" ? "Clerk Cloud Identity" : "Keycloak Distributed Identity"}
        </p>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LandingPageContent />
    </Suspense>
  );
}
