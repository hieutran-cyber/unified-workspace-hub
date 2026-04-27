import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data migration to organizations...");

  // 1. Create Organizations
  const kinex = await prisma.organization.upsert({
    where: { slug: "kinex" },
    update: {},
    create: {
      name: "KiNEX",
      slug: "kinex",
    },
  });

  const malaysiaKinex = await prisma.organization.upsert({
    where: { slug: "malaysia-kinex" },
    update: {},
    create: {
      name: "Malaysia KiNEX",
      slug: "malaysia-kinex",
    },
  });

  console.log(`Created/Ensured organizations: ${kinex.name}, ${malaysiaKinex.name}`);

  // 2. Link Admin User
  const adminEmail = "admin@kinex.com";
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (admin) {
    await prisma.userOrganization.upsert({
      where: { userId_organizationId: { userId: admin.id, organizationId: kinex.id } },
      update: {},
      create: { userId: admin.id, organizationId: kinex.id },
    });

    await prisma.userOrganization.upsert({
      where: { userId_organizationId: { userId: admin.id, organizationId: malaysiaKinex.id } },
      update: {},
      create: { userId: admin.id, organizationId: malaysiaKinex.id },
    });
    console.log(`Linked admin user (${adminEmail}) to both organizations.`);
  } else {
    console.warn(`Admin user with email ${adminEmail} not found.`);
  }

  // 3. Link All Other Users to KiNEX
  const otherUsers = await prisma.user.findMany({
    where: { email: { not: adminEmail } },
  });

  for (const user of otherUsers) {
    await prisma.userOrganization.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: kinex.id } },
      update: {},
      create: { userId: user.id, organizationId: kinex.id },
    });
  }
  console.log(`Linked ${otherUsers.length} other users to KiNEX.`);

  // 4. Link All Properties to KiNEX
  const propertiesUpdate = await prisma.property.updateMany({
    where: { organizationId: null },
    data: { organizationId: kinex.id },
  });
  console.log(`Linked ${propertiesUpdate.count} properties to KiNEX.`);

  // 5. Link All Roles to KiNEX
  const rolesUpdate = await prisma.centralRole.updateMany({
    where: { organizationId: null },
    data: { organizationId: kinex.id },
  });
  console.log(`Linked ${rolesUpdate.count} roles to KiNEX.`);

  // 6. Link All Applications to KiNEX
  const appsUpdate = await prisma.application.updateMany({
    where: { organizationId: null },
    data: { organizationId: kinex.id },
  });
  console.log(`Linked ${appsUpdate.count} applications to KiNEX.`);

  console.log("Migration completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
