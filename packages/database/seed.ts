import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding...");

  // 1. Create Permissions
  const permissionsData = [
    { name: "hub:users:view", description: "Xem danh sách nhân viên" },
    { name: "hub:users:manage", description: "Thêm, sửa, xóa nhân viên" },
    { name: "hub:roles:view", description: "Xem danh sách vai trò" },
    { name: "hub:roles:manage", description: "Cấu hình ma trận Role-App" },
    { name: "hub:apps:view", description: "Xem danh sách ứng dụng" },
    { name: "hub:apps:manage", description: "Quản trị ứng dụng" },
    { name: "hub:properties:view", description: "Xem danh sách cơ sở" },
    { name: "hub:properties:manage", description: "Quản lý cơ sở & đồng bộ" },
    { name: "hub:access", description: "Quyền đăng nhập vào Hub Workspace" },
  ];

  const permissions: any = {};
  for (const data of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { name: data.name },
      update: data,
      create: data,
    });
    permissions[data.name] = perm;
    console.log(`  - Created permission: ${data.name}`);
  }

  // 2. Create Applications with rich metadata
  const appsData = [
    // ... same as before ...
    {
      name: "Odoo ERP",
      description: "Kế toán, nhân sự, mua hàng",
      baseUrl: "http://localhost:8069",
      color: "from-[oklch(0.7_0.15_290)] to-[oklch(0.55_0.2_300)]",
      status: "active",
    },
    {
      name: "PMS",
      description: "Quản lý khách sạn & đặt phòng",
      baseUrl: "http://localhost:3001",
      color: "from-[oklch(0.65_0.15_200)] to-[oklch(0.5_0.18_220)]",
      status: "active",
    },
    {
      name: "POS",
      description: "Bán hàng & thanh toán tại quầy",
      baseUrl: "http://localhost:3002",
      color: "from-[oklch(0.7_0.16_145)] to-[oklch(0.55_0.18_160)]",
      status: "active",
    },
    {
      name: "Analytics",
      description: "Báo cáo & BI tập trung",
      baseUrl: "http://localhost:3003",
      color: "from-[oklch(0.72_0.15_50)] to-[oklch(0.58_0.18_40)]",
      status: "pending",
    },
  ];

  const apps: any = {};
  for (const data of appsData) {
    const app = await prisma.application.upsert({
      where: { name: data.name },
      update: data,
      create: data,
    });
    apps[data.name] = app;
    console.log(`  - Created app: ${data.name}`);
  }

  // 3. Create Central Roles and assign Permissions
  const rolesData = [
    {
      name: "Giám đốc vùng",
      description: "Toàn quyền vùng phụ trách",
      permissions: [
        "hub:users:view",
        "hub:users:manage",
        "hub:roles:view",
        "hub:roles:manage",
        "hub:apps:view",
        "hub:apps:manage",
        "hub:properties:view",
        "hub:properties:manage",
        "hub:access",
      ],
    },
    {
      name: "Trưởng phòng HCNS",
      description: "Quản lý nhân sự & hành chính",
      permissions: ["hub:users:view", "hub:users:manage", "hub:roles:view", "hub:access"],
    },
    {
      name: "Kế toán",
      description: "Hạch toán, báo cáo tài chính",
      permissions: ["hub:users:view", "hub:access"],
    },
    { name: "Lễ tân", description: "Check-in/out, thu ngân quầy lễ tân", permissions: [] },
    {
      name: "IT Admin",
      description: "Quản trị hệ thống & hạ tầng",
      permissions: ["hub:apps:manage", "hub:roles:manage", "hub:access"],
    },
    { name: "Housekeeping", description: "Dịch vụ phòng", permissions: [] },
    { name: "Tạp vụ", description: "Vệ sinh công cộng", permissions: [] },
    { name: "Kỹ thuật", description: "Bảo trì thiết bị", permissions: [] },
  ];

  const roles: any = {};
  for (const data of rolesData) {
    const { permissions: rolePerms, ...roleData } = data;
    const role = await prisma.centralRole.upsert({
      where: { name: data.name },
      update: roleData,
      create: roleData,
    });
    roles[data.name] = role;

    // Assign permissions to role
    if (rolePerms) {
      for (const permName of rolePerms) {
        const perm = permissions[permName];
        if (perm) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: perm.id,
              },
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: perm.id,
            },
          });
        }
      }
    }
    console.log(`  - Created role: ${data.name} with permissions`);
  }

  // 4. Create Users (Employees) from Mockup
  const userData = [
    {
      email: "admin@kinex.com",
      name: "Hieu Tran",
      role: "Giám đốc vùng",
      status: "active",
      category: "Office",
      type: "Full-time",
    },
    {
      email: "accountant@kinex.com",
      name: "An Nguyen",
      role: "Kế toán",
      status: "active",
      category: "Office",
      type: "Full-time",
    },
    {
      email: "an.nv@kinex.vn",
      name: "Nguyễn Văn An",
      role: "Giám đốc vùng",
      status: "active",
      category: "Office",
      type: "Full-time",
    },
    {
      email: "binh.tt@kinex.vn",
      name: "Trần Thị Bình",
      role: "Trưởng phòng HCNS",
      status: "active",
      category: "Office",
      type: "Full-time",
    },
    {
      email: "cuong.lv@kinex.vn",
      name: "Lê Văn Cường",
      role: "Housekeeping",
      status: "away",
      category: "Hotel",
      type: "Full-time",
    },
    {
      email: "danh.pn@kinex.vn",
      name: "Phạm Như Danh",
      role: "Tạp vụ",
      status: "active",
      category: "Hotel",
      type: "Part-time",
    },
    {
      email: "dung.ha@kinex.vn",
      name: "Hoàng Anh Dũng",
      role: "Kỹ thuật",
      status: "offline",
      category: "Hotel",
      type: "Full-time",
    },
  ];

  for (const data of userData) {
    const userRole = roles[data.role];

    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        status: data.status,
        category: data.category,
        type: data.type,
      },
      create: {
        email: data.email,
        name: data.name,
        status: data.status,
        category: data.category,
        type: data.type,
      },
    });

    if (userRole) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: userRole.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: userRole.id,
        },
      });
    }
  }

  // 5. Create Role-App Mappings
  const mappings = [
    { role: "Giám đốc vùng", app: "Odoo ERP", appRole: "Manager" },
    { role: "Giám đốc vùng", app: "PMS", appRole: "Manager" },
    { role: "Giám đốc vùng", app: "POS", appRole: "Manager" },
    { role: "Trưởng phòng HCNS", app: "Odoo ERP", appRole: "HR Manager" },
    { role: "Kế toán", app: "Odoo ERP", appRole: "Accounting Admin" },
    { role: "Lễ tân", app: "PMS", appRole: "Receptionist" },
    { role: "Lễ tân", app: "POS", appRole: "Cashier" },
    { role: "IT Admin", app: "Odoo ERP", appRole: "Superuser" },
  ];

  for (const m of mappings) {
    const centralRole = roles[m.role];
    const app = apps[m.app];

    if (centralRole && app) {
      await prisma.roleAppMapping.upsert({
        where: {
          centralRoleId_appId: {
            centralRoleId: centralRole.id,
            appId: app.id,
          },
        },
        update: { appRoleName: m.appRole },
        create: {
          centralRoleId: centralRole.id,
          appId: app.id,
          appRoleName: m.appRole,
        },
      });
    }
  }

  // 6. Create Demo Properties
  const propertiesData = [
    {
      name: "Kin Hotel Edition Thi Sách",
      code: "HCM-Q1-TS01",
      address: "Thi Sách, Quận 1, TP.HCM",
      odooId: "odoo_prop_101",
      pmsId: "pms_prop_201",
      posId: "pos_prop_301",
    },
    {
      name: "Kin Hotel Đông Du",
      code: "HCM-Q1-DD01",
      address: "Đông Du, Quận 1, TP.HCM",
      odooId: "odoo_prop_102",
      pmsId: "pms_prop_202",
      posId: "pos_prop_302",
    },
    {
      name: "Kin Hotel Thái Văn Lung",
      code: "HCM-Q1-TVL01",
      address: "Thái Văn Lung, Quận 1, TP.HCM",
      odooId: "odoo_prop_103",
      pmsId: "pms_prop_203",
    },
    {
      name: "Kin Hotel Central Park",
      code: "HCM-BTH-CP01",
      address: "Central Park, Bình Thạnh, TP.HCM",
      odooId: "odoo_prop_104",
      pmsId: "pms_prop_204",
    },
    {
      name: "Kin Hotel Onsen",
      code: "HCM-Q1-OS01",
      address: "Lê Thánh Tôn, Quận 1, TP.HCM",
      odooId: "odoo_prop_105",
      pmsId: "pms_prop_205",
    },
    {
      name: "Kin Hotel Lí Tự Trọng",
      code: "HCM-Q1-LTT01",
      address: "Lí Tự Trọng, Quận 1, TP.HCM",
      odooId: "odoo_prop_106",
    },
  ];

  for (const data of propertiesData) {
    await prisma.property.upsert({
      where: { code: data.code },
      update: data,
      create: data,
    });
    console.log(`  - Created property: ${data.name} (${data.code})`);
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
