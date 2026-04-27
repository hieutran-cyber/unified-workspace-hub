"use client";

import { signOut as nextAuthSignOut } from "next-auth/react";
import { useClerk } from "@clerk/nextjs";
import { LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function UserNav() {
  const { user, isAuthenticated, isLoading, provider } = useAuth();
  const { signOut: clerkSignOut } = useClerk();

  const handleLogout = async () => {
    // Xóa organization khỏi localStorage khi đăng xuất
    localStorage.removeItem("current_org_id");

    if (provider === "clerk") {
      await clerkSignOut();
      window.location.href = "/";
    } else {
      // Logic Keycloak hiện tại (bạn có thể giữ nguyên idToken logic nếu cần)
      await nextAuthSignOut({ callbackUrl: "/" });
    }
  };

  if (isLoading) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={handleLogout}
        className="h-10 w-10 rounded-xl bg-muted/50 text-muted-foreground flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-all active:scale-95"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 pl-3 border-l border-border/50 ml-3">
      <div className="text-right hidden sm:block">
        <div className="text-sm font-bold text-foreground leading-none">{user.name}</div>
        <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-black">
          Member
        </div>
      </div>

      <div className="relative group">
        <button className="h-10 w-10 rounded-full bg-primary-soft text-accent-foreground flex items-center justify-center font-bold text-xs ring-2 ring-background hover:ring-primary/20 transition-all">
          {user.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
        </button>

        {/* Simple Popover */}
        <div className="absolute right-0 top-full mt-3 w-48 bg-card border border-border shadow-2xl rounded-2xl p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings className="h-4 w-4" /> Settings
          </button>
          <div className="h-px bg-border/50 my-1" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
