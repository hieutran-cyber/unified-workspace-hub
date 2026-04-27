import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  UseGuards,
  Post,
  Request,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../database/database.module";
import { ProvisioningService } from "../provisioning/provisioning.service";
import { MultiAuthGuard } from "../auth/multi-auth.guard";
import { RedisService } from "../redis/redis.service";
import { PermissionsGuard } from "../auth/permissions.guard";
import { RequiredPermissions } from "../auth/permissions.decorator";

@Controller("users")
@UseGuards(MultiAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private prisma: PrismaService,
    private provisioning: ProvisioningService,
    private redis: RedisService,
  ) {}

  @Get("me")
  async getMe(@Request() req: any) {
    const { user } = req;

    // 1. Get user from DB with roles and their app mappings
    const dbUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ clerkUserId: user.userId }, { keycloakId: user.userId }, { id: user.userId }],
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
                mappings: true,
              },
            },
          },
        },
      },
    });

    if (!dbUser) {
      throw new UnauthorizedException("User not found in workspace database");
    }

    // 2. Resolve internal organization ID from Clerk context
    const targetOrgId = user.orgId;
    let internalOrgId: string | null = null;
    if (targetOrgId) {
      const org = await this.prisma.organization.findUnique({
        where: { clerkOrgId: targetOrgId },
      });
      internalOrgId = org?.id || null;
    }

    // 3. Extract permissions and allowed App IDs based on active organization context
    const activeUserRoles = dbUser.roles.filter(
      (ur) => !ur.role.organizationId || ur.role.organizationId === internalOrgId,
    );

    const dbPermissions = activeUserRoles.flatMap((r) =>
      r.role.permissions.map((p) => p.permission.name),
    );

    const mappedAppIds = new Set(activeUserRoles.flatMap((r) => r.role.mappings.map((m) => m.appId)));

    const isGlobalAdmin = dbPermissions.includes("hub:apps:manage");

    // 4. Fetch apps that are either explicitly mapped or system-wide (Hub)
    const dbApps = await this.prisma.application.findMany({
      where: {
        OR: [
          { id: { in: Array.from(mappedAppIds) } },
          { type: "hub" }, // Always include hub if it exists in DB
        ],
      },
    });

    // 5. Format allowed apps
    const allowedApps = dbApps.map((app) => ({
      id: app.id,
      name: app.name,
      slug: app.type,
      baseUrl: app.baseUrl,
      access: true,
      color: app.color,
      description: app.description,
    }));

    // Ensure Hub is always present even if not in DB
    if (!allowedApps.some((a) => a.slug === "hub")) {
      allowedApps.unshift({
        id: "hub-virtual",
        name: "Workspace Hub",
        slug: "hub",
        baseUrl: process.env.FRONTEND_URL || "http://localhost:3000",
        access: true,
        color: "bg-primary",
        description: "Central Management",
      });
    }

    // 6. Final simplified profile response
    const profile = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatarUrl: dbUser.avatarUrl,
      permissions: dbPermissions,
      allowedApps,
      organizationId: internalOrgId,
      clerkOrgId: targetOrgId,
      defaultOrganizationId: dbUser.defaultOrganizationId,
    };

    // Cache in Redis for performance
    if (user.userId && targetOrgId) {
      await this.redis.setAccessCache(user.userId, targetOrgId, {
        permissions: dbPermissions,
        allowedApps,
      });
    }

    return profile;
  }

  @Put("me/default-org")
  async setDefaultOrg(@Request() req: any, @Body() body: { orgId: string | null }) {
    const { user } = req;
    const { orgId } = body;

    const dbUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ clerkUserId: user.userId }, { keycloakId: user.userId }, { id: user.userId }],
      },
    });

    if (!dbUser) {
      return { success: false, message: "User not found" };
    }

    await this.prisma.user.update({
      where: { id: dbUser.id },
      data: { defaultOrganizationId: orgId },
    });

    return { success: true, defaultOrganizationId: orgId };
  }

  @Get()
  @RequiredPermissions("hub:users:view")
  async getUsers() {
    return this.prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  @Get(":id")
  @RequiredPermissions("hub:users:view")
  async findOne(@Param("id") id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  @Put(":id/roles")
  @RequiredPermissions("hub:users:manage")
  async assignRoles(@Param("id") id: string, @Body() data: { roleIds: string[] }) {
    // 1. Update roles in database
    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId: id } }),
      this.prisma.userRole.createMany({
        data: data.roleIds.map((roleId) => ({
          userId: id,
          roleId: roleId,
        })),
      }),
    ]);

    // 2. Trigger provisioning
    await this.provisioning.syncUserToApps(id);

    return { message: "Roles assigned and provisioning triggered" };
  }

  @Put(":id")
  @RequiredPermissions("hub:users:manage")
  async updateUser(
    @Param("id") id: string,
    @Body()
    data: {
      name?: string;
      category?: string;
      type?: string;
      status?: string;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        type: data.type,
        status: data.status,
      },
    });
  }

  @Post()
  @RequiredPermissions("hub:users:manage")
  async createUser(
    @Body()
    data: {
      email: string;
      name: string;
      category?: string;
      type?: string;
      roleIds?: string[];
    },
  ) {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        category: data.category,
        type: data.type,
        roles: data.roleIds
          ? {
              create: data.roleIds.map((roleId) => ({
                roleId: roleId,
              })),
            }
          : undefined,
      },
    });

    // Trigger provisioning if roles were provided
    if (data.roleIds && data.roleIds.length > 0) {
      await this.provisioning.syncUserToApps(user.id);
    }

    return user;
  }
}
