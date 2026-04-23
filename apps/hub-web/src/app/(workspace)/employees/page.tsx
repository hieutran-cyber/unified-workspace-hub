"use client";

import { Mail, Plus, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EmployeeFilters } from "@/components/employees/EmployeeFilters";
import { useUsers } from "@/hooks/api/use-users";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  status: string;
  category: string;
  type: string;
  roles: {
    role: {
      name: string;
    };
  }[];
}

export default function EmployeesPage() {
  // 1. Fetch live employee data from the API
  const { data: rawData, isLoading } = useUsers();

  const users = Array.isArray(rawData) ? (rawData as User[]) : [];

  // Log dữ liệu để kiểm tra trong Console trình duyệt
  if (!isLoading) {
    console.log("Dữ liệu nhân viên nhận được:", users);
  }

  // Tiện ích lấy chữ cái đầu của tên làm Avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Personnel List ({users.length})
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Employee data from KiNEX Hub Backend — Syncing Keycloak & Odoo.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="h-10 px-4 rounded-xl border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted text-foreground font-medium transition-colors">
            <Download className="h-4 w-4" /> Export Excel
          </button>
          <Link
            href="?panel=employee&action=create"
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Employee
          </Link>
        </div>
      </div>

      <EmployeeFilters />

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/30">
              <tr>
                <th className="text-left font-semibold px-5 py-4 min-w-[250px]">Name & Email</th>
                <th className="text-left font-semibold px-5 py-4">Category</th>
                <th className="text-left font-semibold px-5 py-4">Role</th>
                <th className="text-left font-semibold px-5 py-4">Employment</th>
                <th className="text-left font-semibold px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {(users || []).map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-muted/10 transition-colors group cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <Link href={`?panel=employee&id=${emp.id}`} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-soft text-accent-foreground flex items-center justify-center font-bold text-xs ring-2 ring-background relative">
                        {emp.avatarUrl ? (
                          <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(emp.name || "UN")
                        )}
                        <div
                          className={cn(
                            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                            emp.status === "active"
                              ? "bg-success"
                              : emp.status === "away"
                                ? "bg-warning"
                                : "bg-muted-foreground",
                          )}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {emp.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" /> {emp.email}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit",
                        emp.category === "Office"
                          ? "bg-primary/10 text-primary"
                          : "bg-purple-500/10 text-purple-600",
                      )}
                    >
                      {emp.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground font-medium">
                    {emp.roles[0]?.role.name || "N/A"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        emp.type === "Full-time"
                          ? "bg-muted text-foreground"
                          : "bg-warning/10 text-warning-foreground",
                      )}
                    >
                      {emp.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          emp.status === "active"
                            ? "bg-success"
                            : emp.status === "away"
                              ? "bg-warning"
                              : "bg-muted-foreground",
                        )}
                      />
                      <span className="text-xs font-medium capitalize text-muted-foreground">
                        {emp.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
