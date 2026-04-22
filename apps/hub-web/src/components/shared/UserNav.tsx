"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserNav() {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    // If we have an idToken, perform a federated logout from Keycloak
    if (session?.idToken) {
      const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER || "http://localhost:8080/realms/KiNEX";
      const logoutUrl = `${issuer}/protocol/openid-connect/logout?id_token_hint=${session.idToken}&post_logout_redirect_uri=${window.location.origin}`;

      await signOut({ redirect: false });
      window.location.href = logoutUrl;
    } else {
      // Normal sign out if no token
      await signOut({ callbackUrl: "/" });
    }
  };

  if (status === "loading") {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }

  if (!session) {
    return (
      <button
        onClick={handleLogout}
        className="h-10 w-10 rounded-xl bg-muted/50 text-muted-foreground flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-all active:scale-95"
        title="Đăng xuất"
      >
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 pl-3 border-l border-border/50 ml-3">
      <div className="text-right hidden sm:block">
        <div className="text-sm font-bold text-foreground leading-none">{session.user?.name}</div>
        <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-black">
          Member
        </div>
      </div>

      <div className="relative group">
        <button className="h-10 w-10 rounded-full bg-primary-soft text-accent-foreground flex items-center justify-center font-bold text-xs ring-2 ring-background hover:ring-primary/20 transition-all">
          {session.user?.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
        </button>

        {/* Simple Popover */}
        <div className="absolute right-0 top-full mt-3 w-48 bg-card border border-border shadow-2xl rounded-2xl p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings className="h-4 w-4" /> Cài đặt
          </button>
          <div className="h-px bg-border/50 my-1" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
