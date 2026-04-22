'use client';

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SidePanel } from "@/components/shared/SidePanel";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { RoleForm } from "@/components/roles/RoleForm";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { useCallback, useMemo } from "react";

export function ManagementController() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const panel = searchParams.get("panel");
  const id = searchParams.get("id");
  const action = searchParams.get("action");

  const isOpen = !!panel;

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("panel");
    params.delete("id");
    params.delete("action");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const config = useMemo(() => {
    if (panel === "employee") {
      return {
        title: action === "create" ? "Thêm nhân viên mới" : "Chỉnh sửa nhân viên",
        subtitle: action === "create" ? "Tạo định danh mới trên hệ thống KiNEX" : `Mã nhân viên: ${id}`,
        component: <EmployeeForm id={id || undefined} onClose={handleClose} />
      };
    }
    if (panel === "role") {
      return {
        title: action === "create" ? "Tạo vai trò mới" : "Chỉnh sửa vai trò",
        subtitle: action === "create" ? "Định nghĩa quyền hạn truy cập cho toàn hệ thống" : `Vai trò: ${id}`,
        component: <RoleForm id={id || undefined} onClose={handleClose} />
      };
    }
    if (panel === "property") {
      return {
        title: action === "create" ? "Thêm Property mới" : "Chỉnh sửa Property",
        subtitle: action === "create" ? "Đăng ký cơ sở kinh doanh vào hệ thống Hub" : `Property ID: ${id}`,
        component: <PropertyForm id={id || undefined} onClose={handleClose} />
      };
    }
    return null;
  }, [panel, id, action, handleClose]);

  if (!config) return null;

  return (
    <SidePanel 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={config.title}
      subtitle={config.subtitle}
    >
      {config.component}
    </SidePanel>
  );
}
