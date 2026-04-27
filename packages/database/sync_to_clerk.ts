import { PrismaClient } from "@prisma/client";
import { createClerkClient } from "@clerk/nextjs/server";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function syncToClerk() {
  console.log("🚀 Starting permission sync to Clerk Organization Memberships...");

  const users = await prisma.user.findMany({
    include: {
      roles: {
        include: {
          role: {
            include: {
              organization: true,
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  for (const user of users) {
    if (!user.clerkUserId) {
      console.log(`⚠️ User ${user.email} has no clerkUserId, skipping...`);
      continue;
    }

    console.log(`\n👤 Processing User: ${user.email} (${user.clerkUserId})`);

    try {
      // Get all memberships for this user from Clerk to verify they exist
      const memberships = await clerk.users.getOrganizationMembershipList({
        userId: user.clerkUserId,
      });

      const clerkOrgIds = memberships.data.map((m) => m.organization.id);
      console.log(
        `  🔗 User belongs to ${memberships.data.length} orgs in Clerk: ${clerkOrgIds.join(", ")}`,
      );

      // Group roles and permissions by Organization
      const orgData: Record<string, { roles: string[]; permissions: string[] }> = {};

      for (const userRole of user.roles) {
        const org = userRole.role.organization;
        if (!org || !org.clerkOrgId) continue;

        const orgId = org.clerkOrgId;
        if (!orgData[orgId]) {
          orgData[orgId] = { roles: [], permissions: [] };
        }

        orgData[orgId].roles.push(userRole.role.name);
        const perms = userRole.role.permissions.map((p) => p.permission.name);
        orgData[orgId].permissions.push(...perms);
      }

      // Update each Membership in Clerk
      for (const [clerkOrgId, data] of Object.entries(orgData)) {
        if (!clerkOrgIds.includes(clerkOrgId)) {
          console.warn(
            `  ⚠️ User is NOT a member of Org ${clerkOrgId} in Clerk. Please add them first.`,
          );
          continue;
        }

        try {
          const uniquePermissions = Array.from(new Set(data.permissions));

          console.log(`  🏢 Updating Org Membership: ${clerkOrgId}`);

          // IMPORTANT: Clerk Backend SDK v1.x uses an object argument
          await clerk.organizations.updateOrganizationMembershipMetadata({
            organizationId: clerkOrgId,
            userId: user.clerkUserId,
            publicMetadata: {
              roles: [],
              permissions: [],
              hub_permissions: [],
            },
          });

          console.log(`    ✅ Successfully updated metadata.`);
        } catch (error) {
          console.error(
            `    ❌ Failed to update membership in org ${clerkOrgId}:`,
            (error as any).message || error,
          );
        }
      }
    } catch (e) {
      console.error(
        `  ❌ Error fetching memberships for user ${user.clerkUserId}:`,
        (e as any).message || e,
      );
    }
  }

  console.log("\n✨ Sync completed!");
}

syncToClerk()
  .catch((e) => {
    console.error("Fatal error during sync:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
