"use client";

import { FormField, inputClasses } from "@/components/shared/FormField";
import { toast } from "sonner";
import {
  ShieldAlert,
  Info,
  Check,
  Loader2,
  Save,
  Globe,
  Settings2,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useRole, useUpdateRole, useCreateRole, usePermissions } from "@/hooks/api/use-roles";
import { useApps } from "@/hooks/api/use-apps";
import { useOrganizations } from "@/hooks/api/use-organizations";
import { useProperties } from "@/hooks/api/use-properties";
import { Select } from "@/components/shared/Select";
import { MultiSelect } from "@/components/shared/MultiSelect";

interface RoleFormProps {
  id?: string;
  onClose: () => void;
}

interface AppMapping {
  appId: string;
  appRoleName: string;
  appGroups: string[];
  appProperties: string[];
  appOutlets: string[];
  appCompanies: string[];
  appDepartments: string[];
  isEnabled?: boolean;
}

// --- Mock Data for Selectors ---
const MOCK_ODOO_COMPANIES = [
  { value: "odoo-c1", label: "Kinex One" },
  { value: "odoo-c2", label: "Kinex Two" },
  { value: "odoo-c3", label: "Kinex Three" },
];

const MOCK_POS_PMS_COMPANIES = [
  { value: "comp-a", label: "Company A" },
  { value: "comp-b", label: "Company B" },
  { value: "comp-c", label: "Company C" },
];

const MOCK_OUTLETS = [
  { value: "o1", label: "Nhà hàng Blue", propertyId: "p1" },
  { value: "o2", label: "Spa Serenity", propertyId: "p1" },
  { value: "o3", label: "Bar Sunset", propertyId: "p2" },
  { value: "o4", label: "Quầy Thu Ngân 01", propertyId: "p3" },
];

const MOCK_GROUPS = [
  { value: "g1", label: "Accounting" },
  { value: "g2", label: "Human Resources" },
  { value: "g3", label: "Sales" },
  { value: "g4", label: "Warehouse" },
];

const MOCK_DEPARTMENTS = [
  { value: "d1", label: "IT Department" },
  { value: "d2", label: "Finance" },
  { value: "d3", label: "Operations" },
];

const APP_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "supervisor", label: "Supervisor" },
  { value: "user", label: "User" },
];

export function RoleForm({ id, onClose }: RoleFormProps) {
  const isEdit = !!id;

  // 1. API Hooks
  const { data: role, isLoading: roleLoading } = useRole(id);
  const { data: apps, isLoading: appsLoading } = useApps();
  const { data: availablePermissions, isLoading: permsLoading } = usePermissions();
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();
  const { data: properties, isLoading: propsLoading } = useProperties();

  const updateRole = useUpdateRole();
  const createRole = useCreateRole();

  // 2. State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, AppMapping>>({});
  const [expandedApps, setExpandedApps] = useState<string[]>([]);

  // 3. Formatted Data for Selects
  const organizationOptions = useMemo(
    () =>
      organizations?.map((org) => ({
        value: org.id,
        label: org.name,
      })) || [],
    [organizations],
  );

  const propertyOptions = useMemo(
    () =>
      properties?.map((prop) => ({
        value: prop.id,
        label: prop.name,
        organizationId: prop.organizationId,
      })) || [],
    [properties],
  );

  const dynamicOutlets = useMemo(() => {
    if (!properties || properties.length === 0) return MOCK_OUTLETS;
    return MOCK_OUTLETS.map((o, idx) => ({
      ...o,
      propertyId: properties[idx % properties.length].id,
    }));
  }, [properties]);

  // 4. Grouped Permissions for UI
  const groupedPermissions = useMemo(() => {
    if (!availablePermissions) return {};
    const groups: Record<string, any[]> = {};
    availablePermissions.forEach((p) => {
      const parts = p.name.split(":");
      const groupName = parts.length > 1 ? `${parts[0]}:${parts[1]}` : "other";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(p);
    });
    return groups;
  }, [availablePermissions]);

  // 5. Effect: Load existing data
  useEffect(() => {
    if (role) {
      setName(role.name || "");
      setDescription(role.description || "");
      setSelectedPermissions(role.permissions?.map((p: any) => p.permission.id) || []);

      const existingMappings: Record<string, AppMapping> = {};
      const activeAppIds: string[] = [];

      role.mappings?.forEach((m: any) => {
        existingMappings[m.appId] = {
          appId: m.appId,
          appRoleName: m.appRoleName || "",
          appGroups: m.appGroups || [],
          appProperties: m.appProperties || [],
          appOutlets: m.appOutlets || [],
          appCompanies: m.appCompanies || [],
          appDepartments: m.appDepartments || [],
          isEnabled: true,
        };
        activeAppIds.push(m.appId);
      });

      setMappings(existingMappings);
      setExpandedApps(activeAppIds);
    }
  }, [role]);

  // 6. Handlers
  const toggleApp = (appId: string) => {
    setMappings((prev) => {
      const exists = prev[appId];
      if (exists?.isEnabled) {
        return { ...prev, [appId]: { ...exists, isEnabled: false } };
      }
      return {
        ...prev,
        [appId]: exists
          ? { ...exists, isEnabled: true }
          : {
              appId,
              appRoleName: "",
              appGroups: [],
              appProperties: [],
              appOutlets: [],
              appCompanies: [],
              appDepartments: [],
              isEnabled: true,
            },
      };
    });

    if (!expandedApps.includes(appId)) {
      setExpandedApps((prev) => [...prev, appId]);
    }
  };

  const updateMappingField = (appId: string, field: keyof AppMapping, value: any) => {
    setMappings((prev) => ({
      ...prev,
      [appId]: { ...prev[appId], [field]: value },
    }));
  };

  const togglePermission = (pId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activeMappings = Object.values(mappings)
      .filter((m) => m.isEnabled)
      .map(({ isEnabled, ...rest }) => rest);

    const payload = {
      name,
      description,
      permissionIds: selectedPermissions,
      mappings: activeMappings,
    };

    try {
      if (isEdit) {
        await updateRole.mutateAsync({ id: id!, data: payload });
        toast.success("Vai trò đã được cập nhật");
      } else {
        await createRole.mutateAsync(payload);
        toast.success("Vai trò mới đã được tạo");
      }
      onClose();
    } catch (error) {
      // API error handled by toast in apiClient
    }
  };

  if ((isEdit && roleLoading) || appsLoading || permsLoading || orgsLoading || propsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">
          Đang tải cấu hình vai trò...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute inset-0 flex flex-col bg-background animate-in fade-in duration-500 overflow-hidden"
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-primary/20">
        {/* Section 1: Basic Information */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Basic Information</h3>
              <p className="text-xs text-muted-foreground">
                Define the role identity and its purpose
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Role Name" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(inputClasses, "bg-muted/30")}
                placeholder="e.g. Regional Manager"
                required
              />
            </FormField>
            <FormField label="Description">
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(inputClasses, "bg-muted/30")}
                placeholder="Brief description of responsibilities..."
              />
            </FormField>
          </div>
        </div>

        {/* Section 2: Hub Permissions */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Workspace Permissions</h3>
              <p className="text-xs text-muted-foreground">
                Direct hub-level permissions for this role
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([groupName, perms]) => (
              <div key={groupName} className="space-y-3">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  {groupName.replace("hub:", "")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {perms.map((p) => {
                    const isSelected = selectedPermissions.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePermission(p.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                          isSelected
                            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700"
                            : "border-border/40 bg-muted/10 text-muted-foreground hover:bg-muted/20 hover:border-border/60",
                        )}
                      >
                        <div
                          className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all",
                            isSelected
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-border/60 bg-white",
                          )}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold truncate">{p.name.split(":").pop()}</p>
                          <p className="text-[10px] opacity-70 truncate">
                            {p.description || p.name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Application Mappings */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Application Access</h3>
              <p className="text-xs text-muted-foreground">
                Enable specific apps and configure their attributes
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {apps?.map((app, index) => {
              const isEnabled = mappings[app.id]?.isEnabled;
              const isExpanded = expandedApps.includes(app.id);
              const mapping = mappings[app.id] || {
                appId: app.id,
                appRoleName: "",
                appGroups: [],
                appProperties: [],
                appOutlets: [],
                appCompanies: [],
                appDepartments: [],
                isEnabled: false,
              };

              const isOdoo = app.type === "odoo";
              const isPosPms = app.type === "pos" || app.type === "pms";

              return (
                <div
                  key={app.id}
                  className={cn(
                    "rounded-2xl border transition-all duration-300",
                    isEnabled
                      ? "border-primary/20 bg-primary/[0.02]"
                      : "border-border/40 bg-muted/10",
                    isExpanded ? "relative shadow-xl ring-2 ring-primary/20 bg-card" : "relative",
                  )}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                        isEnabled ? "bg-primary text-white" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Globe className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-foreground">{app.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {app.type}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => toggleApp(app.id)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                          isEnabled ? "bg-primary" : "bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            isEnabled ? "translate-x-5" : "translate-x-0",
                          )}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedApps((prev) =>
                            prev.includes(app.id)
                              ? prev.filter((id) => id !== app.id)
                              : [...prev, app.id],
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && isEnabled && (
                    <div className="p-6 border-t border-border/30 space-y-6 bg-card animate-in slide-in-from-top-2">
                      {isOdoo ? (
                        <div className="grid grid-cols-1 gap-6">
                          <FormField label="Groups" required>
                            <MultiSelect
                              value={mapping.appGroups}
                              onChange={(vals) => updateMappingField(app.id, "appGroups", vals)}
                              options={MOCK_GROUPS}
                              placeholder="Select groups..."
                            />
                          </FormField>
                          <FormField label="Company (Optional)">
                            <Select
                              value={mapping.appCompanies?.[0] || ""}
                              onChange={(val) =>
                                updateMappingField(app.id, "appCompanies", val ? [val] : [])
                              }
                              options={MOCK_ODOO_COMPANIES}
                              placeholder="Select company..."
                            />
                          </FormField>
                          <FormField label="Department (Optional)">
                            <Select
                              value={mapping.appDepartments?.[0] || ""}
                              onChange={(val) =>
                                updateMappingField(app.id, "appDepartments", val ? [val] : [])
                              }
                              options={MOCK_DEPARTMENTS}
                              placeholder="Select department..."
                            />
                          </FormField>
                          <FormField label="Property (Optional)">
                            <Select
                              value={mapping.appProperties?.[0] || ""}
                              onChange={(val) =>
                                updateMappingField(app.id, "appProperties", val ? [val] : [])
                              }
                              options={propertyOptions}
                              placeholder="Select property..."
                            />
                          </FormField>
                        </div>
                      ) : isPosPms ? (
                        <div className="grid grid-cols-1 gap-6">
                          <FormField label="Select Role" required>
                            <Select
                              value={mapping.appRoleName}
                              onChange={(val) => updateMappingField(app.id, "appRoleName", val)}
                              options={APP_ROLES}
                              placeholder="Select role..."
                            />
                          </FormField>
                          <FormField label="Select Company" required>
                            <Select
                              value={mapping.appCompanies?.[0] || ""}
                              onChange={(val) => {
                                updateMappingField(app.id, "appCompanies", val ? [val] : []);
                                updateMappingField(app.id, "appProperties", []);
                                updateMappingField(app.id, "appOutlets", []);
                              }}
                              options={organizationOptions}
                              placeholder="Select company..."
                            />
                          </FormField>

                          {mapping.appCompanies?.[0] && (
                            <>
                              <FormField label="Select Properties">
                                <MultiSelect
                                  value={mapping.appProperties}
                                  onChange={(vals) => {
                                    updateMappingField(app.id, "appProperties", vals);
                                    const validOutlets = mapping.appOutlets.filter((oid) => {
                                      const outlet = dynamicOutlets.find((o) => o.value === oid);
                                      return outlet && vals.includes(outlet.propertyId);
                                    });
                                    updateMappingField(app.id, "appOutlets", validOutlets);
                                  }}
                                  options={propertyOptions.filter(
                                    (p: any) => p.organizationId === mapping.appCompanies[0],
                                  )}
                                  placeholder="Select properties..."
                                />
                              </FormField>

                              {mapping.appProperties?.length > 0 && (
                                <FormField label="Select Outlets">
                                  <MultiSelect
                                    value={mapping.appOutlets}
                                    onChange={(vals) =>
                                      updateMappingField(app.id, "appOutlets", vals)
                                    }
                                    options={dynamicOutlets.filter((o) =>
                                      mapping.appProperties.includes(o.propertyId),
                                    )}
                                    placeholder="Select outlets..."
                                  />
                                </FormField>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6">
                          <FormField label="App Role Name" required>
                            <input
                              value={mapping.appRoleName || ""}
                              onChange={(e) =>
                                updateMappingField(app.id, "appRoleName", e.target.value)
                              }
                              className={inputClasses}
                              placeholder="e.g. manager, admin, user"
                            />
                          </FormField>
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

      {/* Pinned Action Footer */}
      <div className="bg-background border-t border-border/60 p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] flex items-center gap-4 z-50">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-12 rounded-2xl border border-border font-bold text-sm hover:bg-muted transition-all active:scale-95 bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={updateRole.isPending || createRole.isPending}
          className="flex-[2] h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {updateRole.isPending || createRole.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {isEdit ? "Update Configuration" : "Create Role"}
        </button>
      </div>
    </form>
  );
}
