"use client";

import { useEffect } from "react";

export default function AuthCallbackPage() {
  useEffect(() => {
    // This page is rendered inside the popup after successful authentication.
    // It signals the parent window to refresh and then closes itself.
    if (window.opener) {
      // We don't strictly need postMessage if the parent is polling useSession,
      // but it's good practice.
      try {
        window.opener.postMessage("auth-success", window.location.origin);
      } catch (e) {
        console.error("Failed to notify parent window", e);
      }
      window.close();
    } else {
      // If accessed directly, redirect to home
      window.location.href = "/";
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="h-8 w-8 rounded-full border-4 border-primary/10 border-t-primary animate-spin mx-auto" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Đang hoàn tất xác thực...
        </p>
      </div>
    </div>
  );
}
