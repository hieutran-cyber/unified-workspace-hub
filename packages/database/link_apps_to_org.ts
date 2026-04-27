import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔗 Updating application metadata for KiNEX organization...");

  // 1. Find KiNEX Org
  const kinexOrg = await prisma.organization.findFirst({
    where: { clerkOrgId: "org_3CmwDxbcwYqKaKNrz2H86AjxIKq" },
  });

  if (!kinexOrg) {
    console.error("❌ KiNEX Organization not found!");
    return;
  }

  // 2. Define App data with correct ports/urls
  const appsToUpdate = [
    { name: "PMS", type: "pms", baseUrl: "http://localhost:3005" },
    { name: "POS", type: "pos", baseUrl: "http://localhost:3002" },
    { name: "Odoo ERP", type: "odoo", baseUrl: "http://localhost:8069" },
    { name: "Analytics", type: "analytics", baseUrl: "http://localhost:3003" },
    { name: "Workspace Hub", type: "hub", baseUrl: "http://localhost:3000" },
  ];

  for (const item of appsToUpdate) {
    const app = await prisma.application.findFirst({
      where: { name: { contains: item.name, mode: "insensitive" } },
    });

    if (app) {
      await prisma.application.update({
        where: { id: app.id },
        data: {
          type: item.type,
          baseUrl: item.baseUrl,
          organizationId: item.type === "hub" ? null : kinexOrg.id, // Hub is global
        },
      });
      console.log(
        `  - Updated app: ${app.name} (Type: ${item.type}, Port: ${item.baseUrl.split(":").pop()}, Org: ${item.type === "hub" ? "Global" : "KiNEX"})`,
      );
    } else {
      // Create if missing? For now just log
      console.warn(`  - App not found: ${item.name}`);
    }
  }

  console.log("✨ Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
