import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, CheckCircle2, Clock, Building2, Users, Activity } from "lucide-react";

export const Route = createFileRoute("/_app/launcher")({
  head: () => ({ meta: [{ title: "App Launcher — KiNEX Workspace" }] }),
  component: Launcher,
});

const apps = [
  { name: "Odoo ERP", desc: "Kế toán, nhân sự, mua hàng", color: "from-[oklch(0.7_0.15_290)] to-[oklch(0.55_0.2_300)]", status: "active", role: "Accounting Admin" },
  { name: "PMS", desc: "Quản lý khách sạn & đặt phòng", color: "from-[oklch(0.65_0.15_200)] to-[oklch(0.5_0.18_220)]", status: "active", role: "Manager" },
  { name: "POS", desc: "Bán hàng & thanh toán tại quầy", color: "from-[oklch(0.7_0.16_145)] to-[oklch(0.55_0.18_160)]", status: "active", role: "Manager" },
  { name: "Analytics", desc: "Báo cáo & BI tập trung", color: "from-[oklch(0.72_0.15_50)] to-[oklch(0.58_0.18_40)]", status: "pending", role: "Viewer" },
];

const stats = [
  { label: "Ứng dụng đã kích hoạt", value: "3 / 4", icon: Activity, tone: "text-primary" },
  { label: "Tài sản liên kết", value: "12", icon: Building2, tone: "text-primary" },
  { label: "Đồng nghiệp online", value: "47", icon: Users, tone: "text-primary" },
];

function Launcher() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Xin chào, Admin 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">Chọn ứng dụng để tiếp tục — đã đăng nhập tự động (Zero-Login).</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.tone}`} />
            </div>
            <div className="text-2xl font-semibold mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ứng dụng của bạn</h2>
          <span className="text-xs text-muted-foreground">Vai trò: Giám đốc vùng</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {apps.map((app) => (
            <button
              key={app.name}
              className="group text-left p-5 rounded-xl border border-border bg-card hover:shadow-lg hover:border-ring/40 transition-all relative overflow-hidden"
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${app.color} grid place-items-center text-white font-bold text-lg shadow-sm`}>
                {app.name[0]}
              </div>
              <div className="mt-4">
                <div className="font-semibold text-sm flex items-center gap-2">
                  {app.name}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{app.desc}</div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{app.role}</span>
                {app.status === "active" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-success">
                    <CheckCircle2 className="h-3 w-3" /> Sẵn sàng
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-warning-foreground">
                    <Clock className="h-3 w-3" /> Đang cấp
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-xl border border-border bg-card">
        <h3 className="text-sm font-semibold mb-4">Hoạt động gần đây</h3>
        <div className="space-y-3 text-sm">
          {[
            { t: "2 phút trước", a: "Nguyễn Văn An", e: "đã được gán vai trò Kế toán, kích hoạt Odoo" },
            { t: "15 phút trước", a: "Trần Thị Bình", e: "đổi vai trò Lễ tân → Giám đốc vùng, cấp thêm PMS + POS" },
            { t: "1 giờ trước", a: "Property 'Kinex Sài Gòn'", e: "đã đồng bộ thành công xuống Odoo & PMS" },
          ].map((x, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <div><span className="font-medium">{x.a}</span> <span className="text-muted-foreground">{x.e}</span></div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{x.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
