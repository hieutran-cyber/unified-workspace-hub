import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🛠️ Fixing existing user data...");
  const users = await prisma.user.findMany();

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: user.status || "active",
        category: user.category || "Office",
        type: user.type || "Full-time",
      },
    });
    console.log(`✅ Updated: ${user.email}`);
  }

  console.log("✨ All users fixed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
