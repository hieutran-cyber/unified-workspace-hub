"use client";

import { Building2, Globe, Mail, Phone, MapPin, Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useOrganizationDetail, useUpdateOrganization, useCreateOrganization } from "@/hooks/api/use-organizations";
import { toast } from "sonner";

interface OrganizationFormProps {
  id?: string;
  onClose: () => void;
}

export function OrganizationForm({ id, onClose }: OrganizationFormProps) {
  const isEdit = !!id;
  const { data: organization, isLoading } = useOrganizationDetail(id);
  const updateOrg = useUpdateOrganization();
  const createOrg = useCreateOrganization();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (organization) {
      setName(organization.name || "");
      setSlug(organization.slug || "");
      // Giả sử có thêm các field này trong tương lai
      setEmail(organization.email || "");
      setPhone(organization.phone || "");
      setAddress(organization.address || "");
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name,
      slug,
      email,
      phone,
      address,
    };

    try {
      if (isEdit) {
        await updateOrg.mutateAsync({ id: id!, data: payload });
        toast.success("Cập nhật tổ chức thành công");
      } else {
        await createOrg.mutateAsync(payload);
        toast.success("Tạo tổ chức thành công");
      }
      onClose();
    } catch (error) {
      // Error handled by apiClient toast
    }
  };

  const isPending = updateOrg.isPending || createOrg.isPending;

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-6">
        <div className="grid gap-4">
          <label className="text-sm font-semibold text-foreground">Basic Information</label>
          <div className="grid gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Organization Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  required
                  placeholder="Example: KiNEX Group"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-all shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Slug (URL Identifier)
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  required
                  placeholder="Example: kinex-group"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-all shadow-sm"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={isEdit}
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Will be used as: sub-domain.kinex.com
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <label className="text-sm font-semibold text-foreground">Contact & Address</label>
          <div className="grid gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="admin@company.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="+84..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm shadow-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Headquarters
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  placeholder="Full address..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm shadow-sm resize-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-12 rounded-xl border border-border bg-card hover:bg-muted font-bold text-sm transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Save Changes" : "Create Organization"}
        </button>
      </div>
    </form>
  );
}
