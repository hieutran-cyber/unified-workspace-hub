import { Controller, Post, Body, ForbiddenException, Inject, forwardRef } from "@nestjs/common";
import { PrismaService } from "../database/database.module";
import { KeycloakAdminService } from "./keycloak-admin.service";
import { ProvisioningService } from "../provisioning/provisioning.service";

@Controller("auth")
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private keycloakAdmin: KeycloakAdminService,
    private provisioning: ProvisioningService,
  ) {}

  @Post("sync")
  async syncUser(@Body() userData: { email: string; name?: string; sub: string }) {
    console.log(`🔄 Attempting to sync user: ${userData.email}`);

    if (!userData.email) {
      throw new ForbiddenException("Email không được để trống.");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      console.warn(`⚠️ Blocked unauthorized login attempt: ${userData.email}`);
      throw new ForbiddenException("Tài khoản chưa được phân quyền truy cập hệ thống KiNEX.");
    }

    const userWithPermissions = await this.prisma.user.findUnique({
      where: { email: userData.email },
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
              },
            },
          },
        },
      },
    });

    const hasAccess = userWithPermissions?.roles.some((ur) =>
      ur.role.permissions.some((rp) => rp.permission.name === "hub:access"),
    );

    if (!hasAccess) {
      throw new ForbiddenException("Tài khoản của bạn chưa được cấp quyền truy cập.");
    }

    return this.prisma.user.update({
      where: { email: userData.email },
      data: {
        name: userData.name || existingUser.name,
        keycloakId: userData.sub,
        status: "active",
      },
    });
  }

  @Post("admin/sync-to-keycloak")
  async syncAllToKeycloak() {
    try {
      console.log("🚀 Starting Global Sync (Keycloak + App Provisioning)...");
      const users = await this.prisma.user.findMany();
      const provisioningResults = [];

      for (const user of users) {
        try {
          // 1. Get token and attributes
          const token = await this.keycloakAdmin.getAdminToken();
          const attributes = await this.provisioning.getUserAttributes(user.id);

          // 2. Sync to Keycloak with attributes
          const keycloakId = await this.keycloakAdmin.upsertKeycloakUser(token, user, attributes);

          // 3. Update DB
          await this.prisma.user.update({
            where: { id: user.id },
            data: { keycloakId },
          });

          // 4. Sync apps (Odoo, PMS)
          await this.provisioning.syncUserToApps(user.id);

          provisioningResults.push({ email: user.email, status: "success" });
        } catch (error) {
          provisioningResults.push({ email: user.email, status: "failed", error: error.message });
        }
      }

      return {
        message: "Global sync completed",
        provisioning: provisioningResults,
      };
    } catch (error) {
      console.error("❌ Global Sync Failed:", error);
      return {
        statusCode: 500,
        message: "Sync failed",
        error: error.message,
      };
    }
  }
}
