"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function PopupSigninPage() {
  useEffect(() => {
    // Automatically trigger the Keycloak sign-in flow.
    // We point back to /auth-callback so the popup can close itself after success.
    const callbackUrl = `${window.location.origin}/auth-callback`;
    signIn("keycloak", { callbackUrl });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="h-8 w-8 rounded-full border-4 border-primary/10 border-t-primary animate-spin mx-auto" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Đang kết nối tới Keycloak...
        </p>
      </div>
    </div>
  );
}
