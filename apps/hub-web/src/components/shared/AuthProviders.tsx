"use client";

import { Providers as KeycloakProviders } from "./Providers";

const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "keycloak";

export function AuthProviders({ children }: { children: React.ReactNode }) {
  if (provider === "clerk") {
    // Lazy import để dự án vẫn build được khi chưa cài @clerk/nextjs
    const { ClerkProviders } = require("./ClerkProviders");
    return <ClerkProviders>{children}</ClerkProviders>;
  }
  return <KeycloakProviders>{children}</KeycloakProviders>;
}
