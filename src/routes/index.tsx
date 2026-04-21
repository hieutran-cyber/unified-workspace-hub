import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KiNEX Workspace — Đăng nhập SSO" },
      { name: "description", content: "Cổng đăng nhập tập trung cho hệ sinh thái KiNEX: Odoo, PMS, POS." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary via-primary to-[oklch(0.4_0.15_265)] text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur grid place-items-center font-bold">K</div>
          <div className="text-lg font-semibold tracking-tight">KiNEX Ecosystem</div>
        </div>
        <div className="relative space-y-6 max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Một workspace.<br />Mọi ứng dụng.
          </h1>
          <p className="text-primary-foreground/80 text-base leading-relaxed">
            Đăng nhập một lần để truy cập Odoo, PMS, POS và toàn bộ hệ sinh thái KiNEX — không còn mật khẩu rải rác, không còn phân quyền phân mảnh.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {["Odoo", "PMS", "POS"].map((a) => (
              <div key={a} className="h-14 rounded-xl bg-white/10 backdrop-blur border border-white/10 grid place-items-center text-sm font-medium">
                {a}
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-primary-foreground/60">© 2025 KiNEX · Single Sign-On powered by Keycloak</div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary grid place-items-center text-primary-foreground font-bold">K</div>
            <span className="font-semibold">KiNEX Workspace</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Chào mừng trở lại</h2>
            <p className="text-sm text-muted-foreground mt-1">Đăng nhập bằng tài khoản SSO để tiếp tục</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email công ty</label>
              <input
                type="email"
                defaultValue="admin@kinex.vn"
                className="w-full h-11 px-3 rounded-lg border border-input bg-card focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mật khẩu</label>
                <a className="text-xs text-primary hover:underline cursor-pointer">Quên mật khẩu?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  defaultValue="••••••••••"
                  className="w-full h-11 pl-9 pr-3 rounded-lg border border-input bg-card focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm"
                />
              </div>
            </div>

            <Link
              to="/launcher"
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              Đăng nhập <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">hoặc</span></div>
            </div>

            <button type="button" className="w-full h-11 rounded-lg border border-input bg-card font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted transition">
              <ShieldCheck className="h-4 w-4 text-primary" /> Tiếp tục với Keycloak SSO
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Cần hỗ trợ? Liên hệ <span className="text-primary">it@kinex.vn</span>
          </p>
        </div>
      </div>
    </div>
  );
}
