"use client";

import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">ACCESS DENIED</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {error === "Configuration" 
              ? "The system is not configured correctly. Please contact the administrator."
              : "Your account has not been granted access to this Workspace or has been temporarily locked."}
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 text-[11px] text-left space-y-2">
          <p className="font-bold uppercase tracking-widest opacity-50">Instructions:</p>
          <ul className="list-disc list-inside space-y-1 opacity-80">
            <li>Ensure you are logged in with your company email.</li>
            <li>Contact HR to request access.</li>
            <li>Try logging out and logging back in.</li>
          </ul>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
      
      <p className="mt-8 text-[10px] text-muted-foreground uppercase tracking-widest font-medium opacity-30">
        KiNEX Unified Workspace &copy; 2026
      </p>
    </div>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AccessDeniedContent />
    </Suspense>
  );
}
