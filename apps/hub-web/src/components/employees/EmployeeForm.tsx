"use client";

import { FormField, inputClasses } from "@/components/shared/FormField";
import { Select } from "@/components/shared/Select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Check, Info, ShieldCheck } from "lucide-react";
import { useRoles } from "@/hooks/api/use-roles";
import { useUser, useUpdateUser, useUpdateUserRoles, useCreateUser } from "@/hooks/api/use-users";

interface EmployeeFormProps {
  id?: string;
  onClose: () => void;
}

export function EmployeeForm({ id, onClose }: EmployeeFormProps) {
  const isEdit = !!id;

  // 1. API Hooks
  const { data: rolesData } = useRoles();
  const { data: employee, isLoading } = useUser(id);
  const updateUser = useUpdateUser();
  const updateRoles = useUpdateUserRoles();
  const createUser = useCreateUser();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [category, setCategory] = useState("Office");
  const [type, setType] = useState("Full-time");
  const [isSaving, setIsSaving] = useState(false);

  // Sync data when loaded
  useEffect(() => {
    if (employee) {
      setName(employee.name || "");
      setEmail(employee.email || "");
      setCategory(employee.category || "Office");
      setType(employee.type || "Full-time");
      if (employee.roles?.[0]?.roleId) {
        setRoleId(employee.roles[0].roleId);
      }
    }
  }, [employee]);

  const handleSave = async () => {
    if (!name || !email || !roleId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setIsSaving(true);

    try {
      if (isEdit) {
        // Update general info
        await updateUser.mutateAsync({
          id: id!,
          data: { name, category, type },
        });
        // Update roles
        await updateRoles.mutateAsync({
          id: id!,
          roleIds: [roleId],
        });
        toast.success("Đã cập nhật nhân viên và đồng bộ quyền");
      } else {
        // Create new user
        await createUser.mutateAsync({
          name,
          email,
          category,
          type,
          roleIds: [roleId],
        });
        toast.success("Đã tạo nhân viên mới và cấp quyền");
      }
      onClose();
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Derived data for App Access Preview
  const selectedRoleData = rolesData?.find((r) => r.id === roleId);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <FormField label="Họ và Tên">
          <input
            className={inputClasses}
            placeholder="Nguyễn Văn A"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>

        <FormField label="Email Công ty">
          <input
            className={inputClasses}
            type="email"
            placeholder="email@kinex.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isEdit}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Loại nhân sự">
            <Select
              value={category}
              options={[
                { value: "Office", label: "Office / Phòng ban" },
                { value: "Hotel", label: "Nhân sự Khách sạn" },
              ]}
              onChange={(val) => setCategory(val)}
              placeholder="Chọn nhóm..."
            />
          </FormField>
          <FormField label="Hình thức">
            <Select
              value={type}
              options={[
                { value: "Full-time", label: "Toàn thời gian" },
                { value: "Part-time", label: "Bán thời gian" },
              ]}
              onChange={(val) => setType(val)}
              placeholder="Chọn hình thức..."
            />
          </FormField>
        </div>

        <FormField label="Vai trò chính">
          <Select
            value={roleId}
            onChange={(val) => setRoleId(val)}
            options={(rolesData || []).map((r) => ({ value: r.id, label: r.name }))}
            placeholder="Chọn vai trò..."
          />
        </FormField>

        <div className="pt-4 border-t border-border">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
            <ShieldCheck className="h-3.5 w-3.5" /> Quyền truy cập Ứng dụng (Tự động cấp)
          </h3>
          <div className="p-4 rounded-2xl border border-border bg-card/30 flex flex-wrap gap-2">
            {category === "Hotel" ? (
              <div className="flex items-center gap-3 text-muted-foreground/60 w-full animate-in fade-in duration-500">
                <Info className="h-4 w-4" />
                <p className="text-xs italic font-medium">
                  Nhân sự khách sạn sẽ được cấp quyền trực tiếp tại hệ thống PMS/POS địa phương.
                </p>
              </div>
            ) : !roleId ? (
              <p className="text-xs text-muted-foreground italic">
                Vui lòng chọn vai trò để xem các ứng dụng sẽ được cấp quyền...
              </p>
            ) : (
              (() => {
                const mappings = selectedRoleData?.mappings || [];
                return mappings.length > 0 ? (
                  mappings.map((m: any) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 animate-in zoom-in duration-300"
                    >
                      <Check className="h-3 w-3 text-success" />
                      <span className="text-xs font-bold text-foreground">
                        {m.app?.name || "App"} ({m.appRoleName || m.appGroups?.join(", ")})
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Vai trò này chưa có cấu hình Mapping ứng dụng.
                  </p>
                );
              })()
            )}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Lưu ý:</strong> Khi bạn nhấn "Cập nhật", hệ thống sẽ tự động gọi API tới các ứng
          dụng con để tạo/khóa tài khoản tương ứng. Quá trình này diễn ra ngay lập tức.
        </p>
      </div>

      <div className="pt-8 flex gap-3 sticky bottom-0 bg-background/80 backdrop-blur-sm -mx-8 px-8 pb-8">
        <button
          onClick={onClose}
          className="flex-1 h-12 rounded-xl bg-muted text-foreground font-bold hover:bg-muted/80 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Cập nhật & Đồng bộ" : "Tạo & Cấp quyền"}
        </button>
      </div>
    </div>
  );
}
