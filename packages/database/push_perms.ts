import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getAdminToken() {
  const params = new URLSearchParams();
  params.append("client_id", "admin-cli");
  params.append("username", "admin");
  params.append("password", "admin");
  params.append("grant_type", "password");

  const response = await fetch("http://localhost:8080/realms/master/protocol/openid-connect/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const data: any = await response.json();
  return data.access_token;
}

async function main() {
  const token = await getAdminToken();
  const users = await prisma.user.findMany({
    where: { keycloakId: { not: null } },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } }
            }
          }
        }
      }
    }
  });

  console.log(`🔄 Pushing permissions for ${users.length} users...`);

  for (const user of users) {
    const perms = user.roles.flatMap(ur => ur.role.permissions.map(p => p.permission.name));
    
    console.log(`- ${user.email}: [${perms.join(', ')}]`);

    const res = await fetch(`http://localhost:8080/admin/realms/KiNEX/users/${user.keycloakId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        attributes: {
          hub_permissions: perms
        }
      })
    });
    if (!res.ok) console.error(`Failed to push for ${user.email}: ${await res.text()}`);
  }
  
  console.log("✅ Done!");
}

main().finally(() => prisma.$disconnect());
