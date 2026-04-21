import { createFileRoute } from "@tanstack/react-router";
import { Plus, Filter, MoreHorizontal, CheckCircle2, XCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/_app/employees")({
  head: () => ({ meta: [{ title: "Nhân viên — KiNEX Workspace" }] }),
  component: Employees,
});

const employees = [
  { name: "Nguyễn Văn An", email: "an.nguyen@kinex.vn", role: "Kế toán", property: "Kinex Sài Gòn", odoo: "active", pms: "none", pos: "none", status: "active" },
  { name: "Trần Thị Bình", email: "binh.tran@kinex.vn", role: "Giám đốc vùng", property: "Tất cả", odoo: "active", pms: "active", pos: "active", status: "active" },
  { name: "Lê Minh Cường", email: "cuong.le@kinex.vn", role: "Lễ tân", property: "Kinex Hà Nội", odoo: "none", pms: "active", pos: "active", status: "active" },
  { name: "Phạm Thu Dung", email: "dung.pham@kinex.vn", role: "Kế toán", property: "Kinex Đà Nẵng", odoo: "pending", pms: "none", pos: "none", status: "active" },
  { name: "Hoàng Văn Em", email: "em.hoang@kinex.vn", role: "Quản lý POS", property: "Kinex Sài Gòn", odoo: "none", pms: "none", pos: "active", status: "disabled" },
];

function Dot({ s }: { s: string }) {
  if (s === "active") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (s === "pending") return <Clock className="h-4 w-4 text-warning-foreground" />;
  if (s === "disabled") return <XCircle className="h-4 w-4 text-destructive" />;
  return <span className="inline-block h-4 w-4 rounded-full bg-muted" />;
}

function Employees() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nhân viên</h1>
          <p className="text-muted-foreground text-sm mt-1">Quản lý hồ sơ nhân sự & trạng thái provisioning trên các ứng dụng con.</p>
        </div>
        <div className="flex gap-2">
          <button className="h-9 px-3 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted">
            <Filter className="h-4 w-4" /> Lọc
          </button>
          <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90">
            <Plus className="h-4 w-4" /> Thêm nhân viên
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l: "Tổng nhân viên", v: "142" },
          { l: "Đang hoạt động", v: "138", tone: "text-success" },
          { l: "Đang chờ cấp quyền", v: "3", tone: "text-warning-foreground" },
          { l: "Vô hiệu hoá", v: "1", tone: "text-destructive" },
        ].map((x) => (
          <div key={x.l} className="p-4 rounded-xl border border-border bg-card">
            <div className="text-xs text-muted-foreground">{x.l}</div>
            <div className={`text-xl font-semibold mt-1 ${x.tone || ""}`}>{x.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-5 py-3">Nhân viên</th>
                <th className="text-left font-medium px-5 py-3">Vai trò</th>
                <th className="text-left font-medium px-5 py-3">Tài sản</th>
                <th className="text-center font-medium px-3 py-3">Odoo</th>
                <th className="text-center font-medium px-3 py-3">PMS</th>
                <th className="text-center font-medium px-3 py-3">POS</th>
                <th className="text-left font-medium px-5 py-3">Trạng thái</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-[oklch(0.45_0.18_260)] grid place-items-center text-primary-foreground text-xs font-semibold">
                        {e.name.split(" ").pop()?.[0]}
                      </div>
                      <div>
                        <div className="font-medium">{e.name}</div>
                        <div className="text-xs text-muted-foreground">{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-md bg-primary-soft text-accent-foreground text-xs font-medium">{e.role}</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{e.property}</td>
                  <td className="px-3 py-3 text-center"><div className="inline-flex"><Dot s={e.odoo} /></div></td>
                  <td className="px-3 py-3 text-center"><div className="inline-flex"><Dot s={e.pms} /></div></td>
                  <td className="px-3 py-3 text-center"><div className="inline-flex"><Dot s={e.pos} /></div></td>
                  <td className="px-5 py-3">
                    {e.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Vô hiệu
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3"><button className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-muted-foreground flex items-center gap-4">
        <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Đã kích hoạt</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-warning-foreground" /> Đang provisioning</span>
        <span className="inline-flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5 text-destructive" /> Vô hiệu / Lỗi</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-muted" /> Không có quyền</span>
      </div>
    </div>
  );
}
