"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

export function UserProfile() {
  return (
    <div className="flex items-center gap-3 pl-3 border-l border-border ml-2">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent-foreground grid place-items-center text-primary-foreground text-xs font-semibold">
        AD
      </div>
      <div className="text-sm hidden sm:block leading-none text-left">
        <div className="font-medium text-foreground">Admin</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">admin@kinex.vn</div>
      </div>
      <Link
        href="/"
        className="ml-2 h-9 w-9 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground transition-all active:scale-95"
        title="Đăng xuất"
      >
        <LogOut className="h-4 w-4" />
      </Link>
    </div>
  );
}
