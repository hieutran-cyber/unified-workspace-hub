"use client";

import { Plus, Download, Building2, MapPin, Search, Hash } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useProperties } from "@/hooks/api/use-properties";
import { useState } from "react";

export default function PropertiesPage() {
  const { data: rawData, isLoading } = useProperties();
  const [searchTerm, setSearchTerm] = useState("");

  const properties = Array.isArray(rawData) ? rawData : [];
  
  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Danh sách Cơ sở ({properties.length})
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý các khách sạn, nhà hàng và cơ sở kinh doanh trong hệ sinh thái KiNEX.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="h-10 px-4 rounded-xl border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted text-foreground font-medium transition-colors">
            <Download className="h-4 w-4" /> Xuất Excel
          </button>
          <Link
            href="?panel=property&action=create"
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Thêm Property
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc mã cơ sở..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/50 border border-transparent focus:border-primary/30 outline-none text-sm transition-all"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/30">
              <tr>
                <th className="text-left font-semibold px-5 py-4 min-w-[250px]">Cơ sở & Địa chỉ</th>
                <th className="text-left font-semibold px-5 py-4">Mã Code</th>
                <th className="text-left font-semibold px-5 py-4">Trạng thái Sync</th>
                <th className="text-left font-semibold px-5 py-4 text-right">Hệ thống ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredProperties.map((prop) => (
                <tr
                  key={prop.id}
                  className="hover:bg-muted/10 transition-colors group cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <Link href={`?panel=property&id=${prop.id}`} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary-soft text-accent-foreground flex items-center justify-center font-bold text-xs ring-2 ring-background relative">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {prop.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {prop.address || "Chưa có địa chỉ"}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold bg-muted px-2 py-0.5 rounded w-fit uppercase">
                      <Hash className="h-3 w-3" /> {prop.code}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      <div 
                        className={cn("h-2 w-8 rounded-full", prop.odooId ? "bg-success" : "bg-muted")} 
                        title={`Odoo: ${prop.odooId || "Chưa sync"}`} 
                      />
                      <div 
                        className={cn("h-2 w-8 rounded-full", prop.pmsId ? "bg-success" : "bg-muted")} 
                        title={`PMS: ${prop.pmsId || "Chưa sync"}`} 
                      />
                      <div 
                        className={cn("h-2 w-8 rounded-full", prop.posId ? "bg-success" : "bg-muted")} 
                        title={`POS: ${prop.posId || "Chưa sync"}`} 
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 font-medium">
                      Odoo • PMS • POS
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="space-y-1">
                      {prop.odooId && <div className="text-[10px] text-muted-foreground">Odoo: {prop.odooId}</div>}
                      {prop.pmsId && <div className="text-[10px] text-muted-foreground">PMS: {prop.pmsId}</div>}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProperties.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-20 text-center text-muted-foreground italic">
                    {isLoading ? "Đang tải dữ liệu..." : "Không tìm thấy cơ sở nào."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
