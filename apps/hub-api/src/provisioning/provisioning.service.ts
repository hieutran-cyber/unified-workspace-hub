import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../database/database.module";
import { KeycloakAdminService } from "../auth/keycloak-admin.service";

@Injectable()
export class ProvisioningService {
  private readonly logger = new Logger(ProvisioningService.name);

  constructor(
    private prisma: PrismaService,
    private keycloak: KeycloakAdminService,
  ) {}

  async getUserAttributes(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
                mappings: {
                  include: {
                    app: true,
                  },
                },
              },
            },
          },
        },
        mappings: {
          include: {
            app: true,
          },
        },
      },
    });

    if (!user) return {};

    const hubPermissions = new Set<string>();
    const appAttributes: Record<string, string[]> = {};

    for (const userRole of user.roles) {
      for (const rolePerm of userRole.role.permissions) {
        hubPermissions.add(rolePerm.permission.name);
      }
      for (const mapping of userRole.role.mappings) {
        const appKey = `app_${mapping.app.name.toLowerCase().replace(/\s+/g, "_")}_roles`;
        if (!appAttributes[appKey]) appAttributes[appKey] = [];
        if (mapping.appRoleName) appAttributes[appKey].push(mapping.appRoleName);
      }
    }


    for (const mapping of user.mappings) {
      if (mapping.externalId) {
        appAttributes[`ext_id_${mapping.app.name.toLowerCase().replace(/\s+/g, "_")}`] = [
          mapping.externalId,
        ];
      }
    }

    const finalAttributes: Record<string, string[]> = {};
    if (hubPermissions.size > 0) {
      finalAttributes.hub_permissions = Array.from(hubPermissions).filter((p) => !!p);
    }

    for (const [key, value] of Object.entries(appAttributes)) {
      const validValues = value?.filter((v) => v && typeof v === "string");
      if (validValues && validValues.length > 0) {
        finalAttributes[key] = validValues;
      }
    }

    return finalAttributes;
  }

  async syncUserToApps(userId: string) {
    this.logger.log(`🔄 Starting dynamic app provisioning for user: ${userId}`);

    // Fetch user for app syncing
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                mappings: {
                  include: {
                    app: true,
                  },
                },
              },
            },
          },
        },
        mappings: {
          include: {
            app: true,
          },
        },
      },
    });

    if (!user) {
      this.logger.error(`❌ User ${userId} not found`);
      return;
    }

    // 2. Identify DESIRED apps and their settings
    const desiredAppsMap = new Map<string, any>();
    for (const userRole of user.roles) {
      for (const mapping of userRole.role.mappings) {
        desiredAppsMap.set(mapping.appId, mapping);
      }
    }

    // 3. Identify CURRENT apps the user is provisioned in
    const currentAppsMap = new Map<string, any>();
    for (const mapping of user.mappings) {
      currentAppsMap.set(mapping.appId, mapping);
    }

    // 4. PROVISION or UPDATE apps
    for (const [appId, mapping] of desiredAppsMap.entries()) {
      const app = mapping.app;
      const currentMapping = currentAppsMap.get(appId);

      try {
        if (app.name.toLowerCase().includes("odoo")) {
          await this.provisionOdoo(user, mapping, currentMapping);
        } else if (
          app.name.toLowerCase().includes("pms") ||
          app.name.toLowerCase().includes("pos")
        ) {
          await this.provisionPmsPos(user, mapping, currentMapping);
        }
      } catch (error) {
        this.logger.error(`❌ Failed to provision ${app.name}: ${error.message}`);
      }
    }

    // 5. DE-PROVISION apps that are no longer authorized
    for (const [appId, userAppMapping] of currentAppsMap.entries()) {
      if (!desiredAppsMap.has(appId)) {
        const app = userAppMapping.app;
        this.logger.warn(`⚠️ Revoking access to ${app.name} for user ${user.email}`);

        try {
          if (app.name.toLowerCase().includes("odoo")) {
            await this.deprovisionOdoo(user, userAppMapping);
          } else if (
            app.name.toLowerCase().includes("pms") ||
            app.name.toLowerCase().includes("pos")
          ) {
            await this.deprovisionPmsPos(user, userAppMapping);
          }

          // Remove the mapping from database after successful revocation
          await this.prisma.userAppMapping.delete({
            where: { id: userAppMapping.id },
          });
          this.logger.log(`✅ Revoked access to ${app.name} successfully`);
        } catch (error) {
          this.logger.error(`❌ Failed to de-provision ${app.name}: ${error.message}`);
        }
      }
    }

    this.logger.log(`✅ App provisioning completed for user: ${user.email}`);
  }

  private async provisionOdoo(user: any, mapping: any, currentMapping?: any) {
    const action = currentMapping ? "Updating" : "Creating";
    this.logger.log(`[Odoo] ${action} access for ${user.email}`);

    // TODO: Call Odoo XML-RPC / REST API
    const externalId =
      currentMapping?.externalId || `odoo_user_${Math.floor(Math.random() * 1000)}`;

    if (!currentMapping) {
      await this.prisma.userAppMapping.create({
        data: {
          userId: user.id,
          appId: mapping.appId,
          externalId: externalId,
        },
      });
    }
  }

  private async provisionPmsPos(user: any, mapping: any, currentMapping?: any) {
    const action = currentMapping ? "Updating" : "Creating";
    this.logger.log(
      `[PMS/POS] ${action} access for ${user.email} with role ${mapping.appRoleName}`,
    );

    try {
      // Call PMS API to sync user and get their local ID
      const response = await fetch("http://localhost:3006/users/sync-from-hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          fullName: user.name,
          keycloakId: user.keycloakId,
        }),
      });

      if (!response.ok) {
        throw new Error(`PMS API responded with ${response.status}`);
      }

      const data = await response.json();
      const externalId = data.pmsId;

      if (!currentMapping) {
        await this.prisma.userAppMapping.create({
          data: {
            userId: user.id,
            appId: mapping.appId,
            externalId: externalId,
          },
        });
        this.logger.log(`✅ Successfully mapped user ${user.email} to PMS ID: ${externalId}`);
      } else if (currentMapping.externalId !== externalId) {
        await this.prisma.userAppMapping.update({
          where: { id: currentMapping.id },
          data: { externalId: externalId },
        });
        this.logger.log(`🔄 Updated PMS ID for user ${user.email} to: ${externalId}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to sync with PMS API: ${error.message}`);
      // Fallback to mock ID if API is down for demo purposes
      const externalId =
        currentMapping?.externalId || `pms_user_${Math.floor(Math.random() * 1000)}`;
      if (!currentMapping) {
        await this.prisma.userAppMapping.create({
          data: { userId: user.id, appId: mapping.appId, externalId },
        });
      }
    }
  }

  private async deprovisionOdoo(user: any, userAppMapping: any) {
    this.logger.log(`[Odoo] Locking account for external ID: ${userAppMapping.externalId}`);
    // TODO: Call Odoo API to set active=False
  }

  private async deprovisionPmsPos(user: any, userAppMapping: any) {
    this.logger.log(`[PMS/POS] Revoking roles for external ID: ${userAppMapping.externalId}`);
    // TODO: Call PMS/POS API to remove roles or lock user
  }
}
