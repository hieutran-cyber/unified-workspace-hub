import { NextResponse, type NextRequest } from "next/server";

const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "keycloak";

export default function middleware(req: NextRequest) {
  if (provider !== "clerk") return NextResponse.next();
  // Lazy dùng clerkMiddleware
  const { clerkMiddleware, createRouteMatcher } = require("@clerk/nextjs/server");
  const isPublic = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
  ]);
  return clerkMiddleware((auth: any, r: NextRequest) => {
    if (!isPublic(r)) auth().protect();
  })(req, { waitUntil: () => {} } as any);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
