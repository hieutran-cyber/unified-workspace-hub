import { PrismaClient } from "@prisma/pms-client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PMS Database...");

  const users = [
    {
      fullName: "Admin Hub (PMS Mock)",
      email: "admin@kinex.com",
      role: "pms-admin",
      // We don't have the keycloakId yet, it will be mapped on first login or we can use a dummy
      keycloakId: "8677c726-2586-455b-9d41-3596706e9275", // Mock ID from Keycloak
    },
    {
      fullName: "Kế toán PMS",
      email: "accountant@kinex.com",
      role: "receptionist",
    },
  ];

  for (const user of users) {
    await prisma.pmsUser.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
    console.log(`  - Created PMS User: ${user.fullName} (${user.email})`);
  }

  console.log("✅ PMS Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
