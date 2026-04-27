"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "keycloak";

export function AuthProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  let content = (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );

  if (provider === "clerk") {
    const { ClerkProviders } = require("./ClerkProviders");
    return <ClerkProviders>{content}</ClerkProviders>;
  }

  return content;
}
