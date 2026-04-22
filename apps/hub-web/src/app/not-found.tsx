"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full glass-container p-12 text-center space-y-8 animate-in zoom-in duration-500">
        <div className="relative">
          <h1 className="text-9xl font-black text-primary/10 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Page Not Found</h2>
          </div>
        </div>

        <p className="text-muted-foreground text-lg">
          The page you're looking for doesn't exist or has been moved to a new workspace.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/launcher"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Back to Launcher
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
