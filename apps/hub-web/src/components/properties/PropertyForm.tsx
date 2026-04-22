"use client";

import { useState, useEffect } from "react";
import { FormField, inputClasses } from "@/components/shared/FormField";
import { toast } from "sonner";
import { Loader2, Save, Info, Building2, MapPin, Hash } from "lucide-react";
import { useSaveProperty, useProperty } from "@/hooks/api/use-properties";

interface PropertyFormProps {
  id?: string;
  onClose: () => void;
}

export function PropertyForm({ id, onClose }: PropertyFormProps) {
  const isEdit = !!id;
  const { data: property, isLoading } = useProperty(id);
  const saveProperty = useSaveProperty();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (property) {
      setName(property.name || "");
      setCode(property.code || "");
      setAddress(property.address || "");
    }
  }, [property]);

  const handleSave = async () => {
    if (!name || !code) {
      toast.error("Vui lòng điền đầy đủ Tên và Mã cơ sở");
      return;
    }
    setIsSaving(true);

    try {
      await saveProperty.mutateAsync({
        id,
        name,
        code,
        address,
      });
      toast.success(isEdit ? "Cập nhật thành công" : "Tạo mới thành công");
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

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <FormField label="Tên cơ sở (Property Name)">
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className={`${inputClasses} pl-10`}
              placeholder="VD: KiNEX Hotel & Spa"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </FormField>

        <FormField label="Mã định danh (Code)">
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className={`${inputClasses} pl-10`}
              placeholder="VD: KH001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isEdit}
            />
          </div>
        </FormField>

        <FormField label="Địa chỉ">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className={`${inputClasses} pl-10`}
              placeholder="Địa chỉ chi tiết..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </FormField>

        {isEdit && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
              <Info className="h-3.5 w-3.5" /> ID Mapping hệ thống vệ tinh
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
                <div className="text-[8px] font-black uppercase text-muted-foreground mb-1">Odoo ID</div>
                <div className="text-xs font-bold text-foreground">{property?.odooId || "-"}</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
                <div className="text-[8px] font-black uppercase text-muted-foreground mb-1">PMS ID</div>
                <div className="text-xs font-bold text-foreground">{property?.pmsId || "-"}</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
                <div className="text-[8px] font-black uppercase text-muted-foreground mb-1">POS ID</div>
                <div className="text-xs font-bold text-foreground">{property?.posId || "-"}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Lưu ý:</strong> Mã định danh (Code) sẽ được sử dụng để đồng bộ dữ liệu giữa các hệ thống Odoo, PMS và POS. Không nên thay đổi mã này sau khi đã tạo.
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
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Cập nhật & Đồng bộ" : "Tạo Property"}
        </button>
      </div>
    </div>
  );
}
