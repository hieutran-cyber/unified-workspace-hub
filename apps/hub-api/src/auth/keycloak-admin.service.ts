import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../database/database.module";

@Injectable()
export class KeycloakAdminService {
  private readonly logger = new Logger(KeycloakAdminService.name);
  private readonly keycloakUrl = "http://localhost:8080";
  private readonly realm = "KiNEX";

  constructor(private prisma: PrismaService) {}

  /**
   * Get Admin access token from master realm
   */
  async getAdminToken(): Promise<string> {
    const params = new URLSearchParams();
    params.append("client_id", "admin-cli");
    params.append("username", "admin");
    params.append("password", "admin");
    params.append("grant_type", "password");

    const response = await fetch(
      `${this.keycloakUrl}/realms/master/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get master token: ${response.statusText}`);
    }

    const data: any = await response.json();
    return data.access_token;
  }

  /**
   * Sync all users from DB to Keycloak
   */
  async syncAllToKeycloak() {
    this.logger.log("🚀 Starting Bulk Sync to Keycloak...");
    const token = await this.getAdminToken();
    const users = await this.prisma.user.findMany();

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        const keycloakId = await this.upsertKeycloakUser(token, user);
        if (keycloakId) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { keycloakId },
          });
          successCount++;
        }
      } catch (error) {
        this.logger.error(`Failed to sync user ${user.email}: ${error.message}`);
        failCount++;
      }
    }

    return { total: users.length, success: successCount, failed: failCount };
  }

  /**
   * Upsert user in Keycloak and return their ID
   */
  async upsertKeycloakUser(
    token: string,
    user: any,
    attributes?: Record<string, string[]>,
  ): Promise<string> {
    // 1. Check if user already exists
    const searchRes = await fetch(
      `${this.keycloakUrl}/admin/realms/${this.realm}/users?username=${user.email}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const existingUsers: any[] = await searchRes.json();
    if (existingUsers.length > 0) {
      const keycloakUser = existingUsers[0];
      this.logger.warn(`User ${user.email} exists. Deleting to re-create with fresh attributes...`);

      await fetch(`${this.keycloakUrl}/admin/realms/${this.realm}/users/${keycloakUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // 2. Create new user fresh with attributes
    const createPayload = {
      email: user.email,
      username: user.email,
      enabled: true,
      firstName: user.name?.split(" ")[0] || "User",
      lastName: user.name?.split(" ").slice(1).join(" ") || "KiNEX",
      emailVerified: true,
      attributes: attributes || {},
      credentials: [
        {
          type: "password",
          value: "Password@123",
          temporary: false,
        },
      ],
    };

    const createRes = await fetch(`${this.keycloakUrl}/admin/realms/${this.realm}/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createPayload),
    });

    if (!createRes.ok) {
      throw new Error(`Create user failed: ${await createRes.text()}`);
    }

    // Fetch again to get the new ID
    const finalSearch = await fetch(
      `${this.keycloakUrl}/admin/realms/${this.realm}/users?username=${user.email}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const result: any[] = await finalSearch.json();
    const keycloakId = result[0].id;

    // 3. Fallback: Update attributes via PUT (Keycloak sometimes ignores them in POST)
    if (attributes && Object.keys(attributes).length > 0) {
      await this.updateUserAttributes(keycloakId, attributes);
    }

    return keycloakId;
  }

  /**
   * Update specific user attributes in Keycloak
   */
  async updateUserAttributes(keycloakId: string, attributes: Record<string, string[]>) {
    const token = await this.getAdminToken();

    // 1. Fetch current user to get their username (mandatory for PUT)
    const getRes = await fetch(
      `${this.keycloakUrl}/admin/realms/${this.realm}/users/${keycloakId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!getRes.ok) {
      throw new Error(`Failed to fetch user before update: ${await getRes.text()}`);
    }

    const keycloakUser = await getRes.json();

    // Merge attributes safely
    const currentAttributes = keycloakUser.attributes || {};
    const mergedAttributes = {
      ...currentAttributes,
      ...attributes,
    };

    const updatePayload = {
      id: keycloakId,
      username: keycloakUser.username,
      email: keycloakUser.email,
      firstName: keycloakUser.firstName,
      lastName: keycloakUser.lastName,
      enabled: keycloakUser.enabled,
      attributes: mergedAttributes,
    };

    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${keycloakId}`;
    this.logger.log(`🔄 Syncing attributes for ${keycloakUser.username}...`);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(
        `Failed to update attributes for ${keycloakUser.username}. Status: ${response.status}, Body: ${errorBody}`,
      );
      throw new Error(`Failed to update attributes: ${errorBody || response.statusText}`);
    }
  }
}
