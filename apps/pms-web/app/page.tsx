"use client";

import {
  LayoutDashboard,
  Calendar,
  Users,
  Bed,
  LogOut,
  ExternalLink,
  TrendingUp,
  CircleDollarSign,
  ArrowUpRight,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { signOut, signIn } from "next-auth/react";
import { useAuth } from "../hooks/use-auth";
import { useClerk, useOrganizationList } from "@clerk/nextjs";

const KINEX_ORG_ID = "org_3CmwDxbcwYqKaKNrz2H86AjxIKq";

// Icon mapping based on application type
const ICON_MAP: Record<string, any> = {
  hub: LayoutDashboard,
  pms: Bed,
  pos: Users,
  odoo: CircleDollarSign,
  analytics: TrendingUp,
};

export default function Dashboard() {
  const { user, token, isAuthenticated, isLoading, provider, allowedApps } = useAuth();
  const { signOut: clerkSignOut, openSignIn } = useClerk();
  const { isLoaded: isOrgLoaded, setActive } = useOrganizationList();
  const [stats, setStats] = useState<any>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Auto-switch to KiNEX Org if in Clerk and not already active
  useEffect(() => {
    if (provider === "clerk" && isAuthenticated && isOrgLoaded && setActive && !isUnauthorized) {
      setActive({ organization: KINEX_ORG_ID }).catch((err) => {
        console.error("Access denied to organization:", err);
        setIsUnauthorized(true);
      });
    }
  }, [isAuthenticated, isOrgLoaded, provider, setActive, isUnauthorized]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (provider === "clerk") {
        openSignIn();
      } else {
        signIn("keycloak");
      }
    }
  }, [isLoading, isAuthenticated, provider, openSignIn]);

  useEffect(() => {
    if (token && !isUnauthorized) {
      fetch("http://localhost:3006/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (res.status === 401 || res.status === 403) {
            setIsUnauthorized(true);
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data) setStats(data);
        });
    }
  }, [token, isUnauthorized]);

  const handleLogout = async () => {
    if (provider === "clerk") {
      await clerkSignOut();
      window.location.href = "/";
    } else {
      signOut({ callbackUrl: "/" });
    }
  };

  if (isUnauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-100 text-center">
          <div className="h-20 w-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogOut className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Truy cập bị từ chối</h2>
          <p className="text-slate-500 mb-8">
            Tài khoản của bạn không có quyền truy cập vào hệ thống PMS của <strong>KiNEX</strong>.
            Vui lòng liên hệ quản trị viên hoặc quay lại Hub.
          </p>
          <div className="space-y-3">
            <a
              href="http://localhost:3000"
              className="block w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Quay lại Hub
            </a>
            <button
              onClick={handleLogout}
              className="block w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-medium animate-pulse">
            Đang đồng bộ phiên đăng nhập từ Hub...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <span className="font-black text-xl tracking-tighter">KiNEX PMS</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="bg-indigo-50 text-indigo-700 p-3 rounded-xl flex items-center gap-3 font-bold text-sm">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </div>
          <div className="text-slate-500 p-3 rounded-xl flex items-center gap-3 font-medium text-sm hover:bg-slate-50 transition-colors">
            <Calendar className="h-4 w-4" /> Reservations
          </div>
          <div className="text-slate-500 p-3 rounded-xl flex items-center gap-3 font-medium text-sm hover:bg-slate-50 transition-colors">
            <Bed className="h-4 w-4" /> Rooms & Floor
          </div>
          <div className="text-slate-500 p-3 rounded-xl flex items-center gap-3 font-medium text-sm hover:bg-slate-50 transition-colors">
            <Users className="h-4 w-4" /> Guests
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <a
            href={process.env.NEXT_PUBLIC_HUB_URL}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center gap-2">Back to Hub</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <button className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
                <LayoutDashboard className="h-6 w-6" />
              </button>

              {/* App Switcher Dropdown */}
              <div className="absolute top-14 left-0 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform origin-top-left scale-95 group-hover:scale-100">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">
                  Hệ sinh thái KiNEX
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {allowedApps?.map((app: any) => {
                    const Icon = ICON_MAP[app.slug] || ICON_MAP[app.type] || HelpCircle;
                    const isActive = app.slug === "pms";

                    return (
                      <a
                        key={app.id}
                        href={app.access ? app.baseUrl : "#"}
                        className={`p-4 rounded-2xl border transition-all group/app ${
                          isActive
                            ? "bg-indigo-50 border-indigo-100 cursor-default"
                            : !app.access
                              ? "bg-slate-50 border-transparent opacity-50 cursor-not-allowed"
                              : "bg-slate-50 border-transparent hover:border-indigo-100 hover:bg-indigo-50"
                        }`}
                      >
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 shadow-lg ${
                            app.access
                              ? "bg-indigo-600 text-white shadow-indigo-100"
                              : "bg-slate-200 text-slate-400 shadow-none"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div
                          className={`font-bold text-sm ${app.access ? "text-slate-900" : "text-slate-400"}`}
                        >
                          {app.name}
                        </div>
                        <div className="text-[10px] font-medium">
                          {isActive ? (
                            <span className="text-indigo-600 font-black uppercase tracking-tighter">
                              Đang mở
                            </span>
                          ) : !app.access ? (
                            <span className="text-slate-400">Chưa được cấp quyền</span>
                          ) : (
                            <span className="text-slate-500">Truy cập ngay</span>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none">
                Dashboard
              </h1>
              <p className="text-slate-500 text-xs mt-1">Hệ thống quản lý khách sạn thông minh</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-black text-slate-900 leading-none">{user?.name}</div>
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                Online
              </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-500 font-black overflow-hidden ring-1 ring-slate-100">
              {user?.id ? (
                <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                  {user.name?.charAt(0)}
                </div>
              ) : (
                "?"
              )}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Reservations"
            value={stats?.totalReservations || "--"}
            icon={<Calendar className="h-5 w-5" />}
            color="bg-indigo-500"
            trend="+12%"
          />
          <StatCard
            title="Available Rooms"
            value={stats?.availableRooms || "--"}
            icon={<Bed className="h-5 w-5" />}
            color="bg-emerald-500"
            trend="Stable"
          />
          <StatCard
            title="Occupied Rooms"
            value={stats?.occupiedRooms || "--"}
            icon={<Users className="h-5 w-5" />}
            color="bg-orange-500"
            trend="+5%"
          />
          <StatCard
            title="Revenue (VND)"
            value={stats?.revenueToday?.toLocaleString() || "--"}
            icon={<CircleDollarSign className="h-5 w-5" />}
            color="bg-blue-600"
            trend="+24%"
          />
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg">Recent Activity</h3>
            <button className="text-indigo-600 text-xs font-bold flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
              <tr>
                <th className="px-6 py-4">Guest Name</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentActivity?.map((act: any) => (
                <tr
                  key={act.id}
                  className="text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-900">{act.guest}</td>
                  <td className="px-6 py-4">{act.room}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                        act.action === "Check-in"
                          ? "bg-emerald-100 text-emerald-700"
                          : act.action === "Check-out"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {act.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{act.time}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-1.5 w-1.5 bg-slate-300 rounded-full inline-block ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`h-12 w-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200`}
        >
          {icon}
        </div>
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
          {trend}
        </span>
      </div>
      <div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
          {title}
        </div>
      </div>
    </div>
  );
}
