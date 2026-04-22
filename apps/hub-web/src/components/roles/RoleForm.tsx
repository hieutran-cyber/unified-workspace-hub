"use client";

import { FormField, inputClasses } from "@/components/shared/FormField";
import { Select } from "@/components/shared/Select";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { ShieldAlert, Info, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRole, useSaveRole } from "@/hooks/api/use-roles";

interface RoleFormProps {
  id?: string;
  onClose: () => void;
}

export function RoleForm({ id, onClose }: RoleFormProps) {
  const isEdit = !!id;
  const apps = ["Odoo", "PMS", "POS"];

  // 1. API Hooks
  const { data: role, isLoading } = useRole(id);
  const saveRole = useSaveRole(id);

  // Mock data for options
  const MOCK_GROUPS = [
    { value: "accountant", label: "Accounting / Billing" },
    { value: "sales_manager", label: "Accounting / Bookeeper" },
    { value: "inventory_user", label: "Accounting / Readonly" },
    { value: "admin", label: "Accounting / Accountant" },
  ];

  const MOCK_COMPANIES = [
    { value: "kinex_sg", label: "KiNEX One" },
    { value: "kinex_dl", label: "KiNEX Two" },
    { value: "kinex_hn", label: "KiNEX Three" },
  ];

  const MOCK_DEPARTMENTS = [
    { value: "hr", label: "Human Resources" },
    { value: "it", label: "IT Department" },
    { value: "accounting", label: "Accounting" },
    { value: "sales", label: "Sales" },
    { value: "marketing", label: "Marketing" },
  ];
  const MOCK_COMPANIES_PMS = [
    { value: "kinex_sg", label: "KiNEX PMS 1" },
    { value: "kinex_dl", label: "KiNEX PMS 2" },
    { value: "kinex_hn", label: "KiNEX PMS 3" },
  ];

  const MOCK_APP_ROLES = [
    { value: "receptionist", label: "Receptionist / Lễ tân" },
    { value: "manager", label: "Manager / Quản lý" },
    { value: "cashier", label: "Cashier / Thu ngân" },
    { value: "housekeeper", label: "Housekeeper / Buồng phòng" },
  ];

  const MOCK_PROPERTIES: Record<string, { value: string; label: string }[]> = {
    kinex_sg: [
      { value: "sg_hotel_1", label: "KiNEX Hotel Saigon Central" },
      { value: "sg_hotel_2", label: "KiNEX Resort Beachfront" },
      { value: "sg_hotel_3", label: "KiNEX Suites Landmark" },
    ],
    kinex_dl: [
      { value: "dl_hotel_1", label: "KiNEX Dalat Palace" },
      { value: "dl_hotel_2", label: "KiNEX Valley View" },
      { value: "dl_hotel_3", label: "KiNEX Pine Hill" },
    ],
    kinex_hn: [
      { value: "hn_hotel_1", label: "KiNEX Hanoi Old Quarter" },
      { value: "hn_hotel_2", label: "KiNEX West Lake" },
      { value: "hn_hotel_3", label: "KiNEX Opera House" },
    ],
  };

  const MOCK_OUTLETS: Record<string, { value: string; label: string }[]> = {
    sg_hotel_1: [
      { value: "sg1_restaurant", label: "The Grand Dining" },
      { value: "sg1_bar", label: "Sky Lounge" },
      { value: "sg1_spa", label: "Zen Spa" },
    ],
    sg_hotel_2: [
      { value: "sg2_pool", label: "Poolside Grill" },
      { value: "sg2_cafe", label: "Ocean Coffee" },
      { value: "sg2_gym", label: "Fit Center" },
    ],
    // ... Thêm cho các khách sạn khác tương tự để demo
  };

  // Tạo thêm dữ liệu outlet cho demo phong phú
  [
    "sg_hotel_3",
    "dl_hotel_1",
    "dl_hotel_2",
    "dl_hotel_3",
    "hn_hotel_1",
    "hn_hotel_2",
    "hn_hotel_3",
  ].forEach((id) => {
    MOCK_OUTLETS[id] = [
      { value: `${id}_rs`, label: `Restaurant ${id.split("_")[1]}` },
      { value: `${id}_br`, label: `Bar ${id.split("_")[1]}` },
      { value: `${id}_lf`, label: `Leaf Cafe ${id.split("_")[1]}` },
    ];
  });

  const HUB_PERMISSIONS = [
    {
      id: "hub:users:view",
      label: "Xem danh sách nhân viên",
      description: "Cho phép xem thông tin nhân viên",
    },
    {
      id: "hub:users:manage",
      label: "Quản lý nhân viên",
      description: "Tạo, sửa, xóa và phân quyền nhân viên",
    },
    {
      id: "hub:roles:view",
      label: "Xem danh sách vai trò",
      description: "Xem ma trận Role-App Matrix",
    },
    {
      id: "hub:roles:manage",
      label: "Quản lý vai trò",
      description: "Định nghĩa và chỉnh sửa mapping vai trò",
    },
    {
      id: "hub:apps:view",
      label: "Xem danh sách ứng dụng",
      description: "Xem các ứng dụng trong hệ sinh thái",
    },
    {
      id: "hub:apps:manage",
      label: "Quản lý ứng dụng",
      description: "Cấu hình kết nối các ứng dụng",
    },
    {
      id: "hub:properties:view",
      label: "Xem danh sách cơ sở",
      description: "Cho phép xem danh sách các Property",
    },
    {
      id: "hub:properties:manage",
      label: "Quản lý cơ sở",
      description: "Tạo, sửa và đồng bộ Property liên hệ thống",
    },
    {
      id: "hub:access",
      label: "Truy cập Workspace",
      description: "Quyền tối thiểu để đăng nhập vào hệ thống Hub",
    },
  ];

  // State to track active apps for this role
  const [activeApps, setActiveApps] = useState<Record<string, boolean>>({
    Odoo: isEdit,
    PMS: false,
    POS: false,
  });

  const [selectedHubPerms, setSelectedHubPerms] = useState<string[]>([]);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  // Detailed app configurations
  const [appConfigs, setAppConfigs] = useState<Record<string, any>>({
    Odoo: { groups: [], company: "", department: "" },
    PMS: { role: "", company: "", properties: [], outlets: [] },
    POS: { role: "", company: "", properties: [], outlets: [] },
  });

  // Fetch real data for edit mode
  useEffect(() => {
    if (role) {
      setRoleName(role.name || "");
      setRoleDesc(role.description || "");

      // Map permissions
      const permIds = role.permissions?.map((p: any) => p.permission.name) || [];
      setSelectedHubPerms(permIds);

      // Map app configs
      const newActiveApps = { Odoo: false, PMS: false, POS: false };
      const newConfigs = { ...appConfigs };

      role.mappings?.forEach((m: any) => {
        const appName = m.app.name === "Odoo ERP" ? "Odoo" : m.app.name;
        if (appName in newActiveApps) {
          (newActiveApps as any)[appName] = true;
          newConfigs[appName] = {
            role: m.appRoleName || "",
            groups: m.appGroups || [],
            company: m.appCompanies?.[0] || "",
            properties: m.appProperties || [],
            outlets: m.appOutlets || [],
            department: m.appDepartments?.[0] || "",
          };
        }
      });

      setActiveApps(newActiveApps);
      setAppConfigs(newConfigs);
    }
  }, [role]);

  const toggleApp = (app: string) => {
    setActiveApps((prev) => ({ ...prev, [app]: !prev[app] }));
  };

  const toggleHubPerm = (permId: string) => {
    setSelectedHubPerms((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId],
    );
  };

  const toggleOdooGroup = (group: string) => {
    setAppConfigs((prev) => {
      const currentGroups = prev.Odoo.groups || [];
      const newGroups = currentGroups.includes(group)
        ? currentGroups.filter((g: string) => g !== group)
        : [...currentGroups, group];
      return {
        ...prev,
        Odoo: { ...prev.Odoo, groups: newGroups },
      };
    });
  };

  const updateConfig = (app: string, field: string, value: any) => {
    setAppConfigs((prev) => {
      const newConfig = { ...prev[app], [field]: value };

      // Nếu đổi company, reset properties và outlets
      if (field === "company") {
        newConfig.properties = [];
        newConfig.outlets = [];
      }
      // Nếu đổi properties, reset outlets
      if (field === "properties") {
        newConfig.outlets = [];
      }

      return {
        ...prev,
        [app]: newConfig,
      };
    });
  };

  const handleSubmit = async () => {
    const payload = {
      name: roleName,
      description: roleDesc,
      permissionIds: selectedHubPerms,
      mappings: Object.entries(activeApps)
        .filter(([_, isActive]) => isActive)
        .map(([app]) => {
          const appIdMap: Record<string, string> = { Odoo: "1", PMS: "2", POS: "3" };
          const config = appConfigs[app];
          return {
            appId: appIdMap[app],
            appRoleName: app === "Odoo" ? "" : config.role,
            appGroups: app === "Odoo" ? config.groups : [],
            appProperties: config.properties || [],
            appOutlets: config.outlets || [],
            appDepartments: app === "Odoo" && config.department ? [config.department] : [],
            appCompanies: [config.company].filter(Boolean),
          };
        }),
    };

    try {
      await saveRole.mutateAsync(payload);
      alert(isEdit ? "Đã cập nhật vai trò!" : "Đã tạo vai trò mới!");
      onClose();
    } catch (error) {
      console.error("❌ Submit failed:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <FormField label="Tên vai trò">
          <input
            className={inputClasses}
            placeholder="vd: Giám đốc vùng, Kế toán..."
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </FormField>

        <FormField label="Mô tả nhiệm vụ">
          <textarea
            className={cn(inputClasses, "h-20 py-3 resize-none")}
            placeholder="Mô tả ngắn gọn về phạm vi công việc..."
            value={roleDesc}
            onChange={(e) => setRoleDesc(e.target.value)}
          />
        </FormField>

        <div className="pt-4 border-t border-border">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
            <ShieldAlert className="h-3.5 w-3.5" /> Quyền hạn Hub (Internal Permissions)
          </h3>
          <FormField label="Danh sách quyền hạn">
            <MultiSelect
              value={selectedHubPerms}
              options={HUB_PERMISSIONS.map((p) => ({ value: p.id, label: p.label }))}
              onChange={setSelectedHubPerms}
              placeholder="Chọn các quyền hạn trên Hub..."
            />
          </FormField>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
            <ShieldAlert className="h-3.5 w-3.5" /> Mapping Quyền hạn hệ thống (Role-App Matrix)
          </h3>

          <div className="space-y-4">
            {apps.map((app) => {
              const isActive = activeApps[app];
              return (
                <div
                  key={app}
                  className={cn(
                    "p-4 rounded-2xl border transition-all duration-300",
                    isActive ? "border-primary/30 bg-primary/5" : "border-border bg-card/30",
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => toggleApp(app)}
                        className={cn(
                          "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
                          isActive ? "bg-primary" : "bg-muted",
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                            isActive ? "left-6" : "left-1",
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-bold transition-colors",
                          isActive ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {app}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {app === "Odoo" ? (
                        <>
                          <div className="grid grid-cols-1 gap-4">
                            <FormField label="Odoo Groups" className="!mb-0">
                              <MultiSelect
                                value={appConfigs.Odoo.groups || []}
                                options={MOCK_GROUPS}
                                onChange={(val) =>
                                  setAppConfigs((prev) => ({
                                    ...prev,
                                    Odoo: { ...prev.Odoo, groups: val },
                                  }))
                                }
                                placeholder="Chọn các nhóm quyền..."
                              />
                            </FormField>
                            <FormField label="Company" className="!mb-0">
                              <Select
                                className="h-10 text-xs"
                                value={appConfigs.Odoo.company}
                                options={MOCK_COMPANIES}
                                onChange={(val) => updateConfig("Odoo", "company", val)}
                                placeholder="Chọn công ty..."
                              />
                            </FormField>
                            <FormField label="Department" className="!mb-0">
                              <Select
                                className="h-10 text-xs"
                                value={appConfigs.Odoo.department}
                                options={MOCK_DEPARTMENTS}
                                onChange={(val) =>
                                  setAppConfigs((prev) => ({
                                    ...prev,
                                    Odoo: { ...prev.Odoo, department: val },
                                  }))
                                }
                                placeholder="Chọn phòng ban..."
                              />
                            </FormField>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-2 gap-3">
                            <FormField label={`${app} Role`} className="!mb-0">
                              <Select
                                className="h-10 text-xs"
                                value={appConfigs[app].role}
                                options={MOCK_APP_ROLES}
                                onChange={(val) => updateConfig(app, "role", val)}
                                placeholder={`Chọn vai trò ${app}...`}
                              />
                            </FormField>
                            <FormField label="Company" className="!mb-0">
                              <Select
                                className="h-10 text-xs"
                                value={appConfigs[app].company}
                                options={MOCK_COMPANIES_PMS}
                                onChange={(val) => updateConfig(app, "company", val)}
                                placeholder="Chọn công ty..."
                              />
                            </FormField>
                          </div>

                          {appConfigs[app].company && (
                            <FormField label="Properties (Cơ sở)" className="!mb-0">
                              <MultiSelect
                                value={appConfigs[app].properties || []}
                                options={MOCK_PROPERTIES[appConfigs[app].company] || []}
                                onChange={(val) => updateConfig(app, "properties", val)}
                                placeholder="Chọn các khách sạn/cơ sở..."
                              />
                            </FormField>
                          )}

                          {appConfigs[app].properties?.length > 0 && (
                            <FormField label="Outlets (Điểm bán)" className="!mb-0">
                              <MultiSelect
                                value={appConfigs[app].outlets || []}
                                options={appConfigs[app].properties.flatMap(
                                  (pId: string) => MOCK_OUTLETS[pId] || [],
                                )}
                                onChange={(val) => updateConfig(app, "outlets", val)}
                                placeholder="Chọn các điểm bán/nhà hàng..."
                              />
                            </FormField>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Lưu ý:</strong> Cấu hình này định nghĩa quyền hạn mặc định khi một nhân viên được
          gán vai trò này. Hệ thống sẽ tự động map các ID này tới ứng dụng đích.
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
          onClick={handleSubmit}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {isEdit ? "Cập nhật mapping" : "Tạo vai trò & Mapping"}
        </button>
      </div>
    </div>
  );
}
