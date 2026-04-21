import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus, Link2, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/properties")({
  head: () => ({ meta: [{ title: "Tài sản — KiNEX Workspace" }] }),
  component: Properties,
});

const properties = [
  {
    name: "Kinex Sài Gòn",
    addr: "123 Nguyễn Huệ, Q.1, TP.HCM",
    mappings: [
      { app: "Odoo", id: "company_12", status: "linked" },
      { app: "PMS", id: "hotel_SGN01", status: "linked" },
      { app: "POS", id: "outlet_7", status: "linked" },
    ],
  },
  {
    name: "Kinex Hà Nội",
    addr: "45 Lý Thái Tổ, Hoàn Kiếm, Hà Nội",
    mappings: [
      { app: "Odoo", id: "company_13", status: "linked" },
      { app: "PMS", id: "hotel_HAN01", status: "linked" },
      { app: "POS", id: "—", status: "unlinked" },
    ],
  },
  {
    name: "Kinex Đà Nẵng",
    addr: "88 Bạch Đằng, Hải Châu, Đà Nẵng",
    mappings: [
      { app: "Odoo", id: "company_14", status: "syncing" },
      { app: "PMS", id: "hotel_DAD01", status: "linked" },
      { app: "POS", id: "outlet_9", status: "linked" },
    ],
  },
];

function Badge({ s }: { s: string }) {
  if (s === "linked") return (
    <span className="inline-flex items-center gap-1 text-[11px] text-success font-medium">
      <CheckCircle2 className="h-3 w-3" /> Đã liên kết
    </span>
  );
  if (s === "syncing") return (
    <span className="inline-flex items-center gap-1 text-[11px] text-warning-foreground font-medium">
      <span className="h-2 w-2 rounded-full bg-warning animate-pulse" /> Đang đồng bộ
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-destructive font-medium">
      <AlertCircle className="h-3 w-3" /> Chưa liên kết
    </span>
  );
}

function Properties() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tài sản (Properties)</h1>
          <p className="text-muted-foreground text-sm mt-1">Cây phân cấp chung — hệ thống tự "dịch" sang ngôn ngữ từng ứng dụng.</p>
        </div>
        <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90">
          <Plus className="h-4 w-4" /> Thêm Property
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 p-5 rounded-xl border border-border bg-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Cây tổ chức</div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 font-semibold py-1.5">
              <ChevronRight className="h-4 w-4 rotate-90" />
              <Building2 className="h-4 w-4 text-primary" /> KiNEX Group
            </div>
            <div className="ml-5 space-y-1">
              <div className="flex items-center gap-2 py-1.5 text-muted-foreground">
                <ChevronRight className="h-4 w-4 rotate-90" /> Miền Nam
              </div>
              <div className="ml-5 space-y-1">
                <div className="px-2 py-1.5 rounded-md bg-primary-soft text-accent-foreground font-medium">Kinex Sài Gòn</div>
              </div>
              <div className="flex items-center gap-2 py-1.5 text-muted-foreground">
                <ChevronRight className="h-4 w-4 rotate-90" /> Miền Bắc
              </div>
              <div className="ml-5 space-y-1">
                <div className="px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer">Kinex Hà Nội</div>
              </div>
              <div className="flex items-center gap-2 py-1.5 text-muted-foreground">
                <ChevronRight className="h-4 w-4 rotate-90" /> Miền Trung
              </div>
              <div className="ml-5 space-y-1">
                <div className="px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer">Kinex Đà Nẵng</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {properties.map((p) => (
            <div key={p.name} className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary-soft grid place-items-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.addr}</div>
                  </div>
                </div>
                <button className="h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted inline-flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" /> Quản lý mapping
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {p.mappings.map((m) => (
                  <div key={m.app} className="p-3 rounded-lg bg-muted/40 border border-border">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold">{m.app}</span>
                      <Badge s={m.status} />
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground truncate">{m.id}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
