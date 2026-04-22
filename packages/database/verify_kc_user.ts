import { PrismaClient } from "@prisma/client";

async function getAdminToken() {
  const params = new URLSearchParams();
  params.append("client_id", "admin-cli");
  params.append("username", "admin");
  params.append("password", "admin");
  params.append("grant_type", "password");

  const response = await fetch(
    "http://localhost:8080/realms/master/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    },
  );
  const data: any = await response.json();
  return data.access_token;
}

async function main() {
  const token = await getAdminToken();
  const email = "admin@kinex.com";

  const searchRes = await fetch(`http://localhost:8080/admin/realms/KiNEX/users?email=${email}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const users: any = await searchRes.json();

  if (users.length > 0) {
    const userId = users[0].id;
    const fullUserRes = await fetch(`http://localhost:8080/admin/realms/KiNEX/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fullUser: any = await fullUserRes.json();
    console.log(`🔍 Full User: ${fullUser.email}`);
    console.log(`📂 Attributes:`, JSON.stringify(fullUser.attributes, null, 2));
  } else {
    console.log("❌ User not found in Keycloak");
  }
}

main();
