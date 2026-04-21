import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus, Save, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/roles")({
  head: () => ({ meta: [{ title: "Role-App Matrix — KiNEX Workspace" }] }),
  component: Roles,
});

const apps = ["Odoo", "PMS", "POS", "Analytics"];
const roles = [
  { name: "Giám đốc vùng", desc: "Toàn quyền vùng phụ trách", perms: ["Accounting Admin", "Manager", "Manager", "Viewer"], count: 4 },
  { name: "Kế toán", desc: "Hạch toán, báo cáo tài chính", perms: ["Accountant", null, null, "Viewer"], count: 12 },
  { name: "Lễ tân", desc: "Check-in/out, thu ngân quầy lễ tân", perms: [null, "Receptionist", "Cashier", null], count: 28 },
  { name: "Quản lý POS", desc: "Vận hành điểm bán hàng", perms: [null, null, "Manager", null], count: 8 },
  { name: "Housekeeping", desc: "Buồng phòng, dọn dẹp", perms: [null, "Housekeeper", null, null], count: 35 },
];

function Roles() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ma trận Vai trò × Ứng dụng</h1>
          <p className="text-muted-foreground text-sm mt-1">Cấu hình một lần — hệ thống tự động provisioning sang Odoo, PMS, POS.</p>
        </div>
        <div className="flex gap-2">
          <button className="h-9 px-3 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted">
            <Plus className="h-4 w-4" /> Tạo vai trò
          </button>
          <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90">
            <Save className="h-4 w-4" /> Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-5 py-3 min-w-[240px]">Vai trò</th>
                <th className="text-left font-medium px-5 py-3">Nhân sự</th>
                {apps.map((a) => (
                  <th key={a} className="text-center font-medium px-4 py-3 min-w-[140px]">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.name} className="border-t border-border hover:bg-muted/20">
                  <td className="px-5 py-4">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{r.count} người</span>
                  </td>
                  {r.perms.map((p, i) => (
                    <td key={i} className="px-4 py-4 text-center">
                      {p ? (
                        <div className="inline-flex flex-col items-center gap-1">
                          <div className="h-7 w-7 rounded-lg bg-success/10 grid place-items-center">
                            <Check className="h-4 w-4 text-success" />
                          </div>
                          <span className="text-[11px] text-muted-foreground">{p}</span>
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-lg bg-muted/60 grid place-items-center mx-auto">
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Luồng tự động</div>
          <ol className="space-y-2.5 text-sm">
            {[
              "Admin chọn vai trò → hệ thống xác định các app được cấp",
              "Tạo tài khoản tương ứng ở Odoo / PMS / POS",
              "Lưu mapping ID vào bảng UserAppMapping",
              "Người dùng truy cập Zero-Login qua Keycloak SSO",
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="h-5 w-5 rounded-full bg-primary-soft text-accent-foreground text-[11px] font-semibold grid place-items-center shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="p-5 rounded-xl border border-border bg-gradient-to-br from-primary-soft to-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Trạng thái đồng bộ</div>
          <div className="text-3xl font-semibold">99.2%</div>
          <div className="text-sm text-muted-foreground mt-1">2 job đang retry · BullMQ + Redis</div>
          <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[99%] bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
