import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from "@nestjs/common";
import { PrismaService } from "../database/database.module";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("roles")
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getRoles() {
    return this.prisma.centralRole.findMany({
      include: {
        mappings: {
          include: {
            app: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });
  }

  @Get(":id")
  async getRole(@Param("id") id: string) {
    return this.prisma.centralRole.findUnique({
      where: { id },
      include: {
        mappings: { include: { app: true } },
        permissions: { include: { permission: true } },
      },
    });
  }

  @Put(":id")
  async updateRole(
    @Param("id") id: string,
    @Body()
    data: {
      name: string;
      description?: string;
      permissionIds?: string[];
      mappings?: {
        appId: string;
        appRoleName?: string;
        appGroups?: string[];
        appProperties?: string[];
        appOutlets?: string[];
        appCompanies?: string[];
      }[];
    },
  ) {
    // 1. Resolve permission IDs from names if they look like permission names (contain colons)
    let finalPermissionIds = data.permissionIds || [];
    if (finalPermissionIds.length > 0 && finalPermissionIds[0].includes(":")) {
      const perms = await this.prisma.permission.findMany({
        where: { name: { in: finalPermissionIds } },
        select: { id: true },
      });
      finalPermissionIds = perms.map((p) => p.id);
    }

    // 2. Update basic info and permissions
    const role = await this.prisma.centralRole.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          deleteMany: {},
          create: finalPermissionIds.map((pId) => ({ permissionId: pId })),
        },
      },
    });

    // 2. Update app mappings if provided
    if (data.mappings) {
      for (const m of data.mappings) {
        await this.prisma.roleAppMapping.upsert({
          where: { centralRoleId_appId: { centralRoleId: id, appId: m.appId } },
          update: {
            appRoleName: m.appRoleName,
            appGroups: m.appGroups || [],
            appProperties: m.appProperties || [],
            appOutlets: m.appOutlets || [],
            appCompanies: m.appCompanies || [],
          },
          create: {
            centralRoleId: id,
            appId: m.appId,
            appRoleName: m.appRoleName,
            appGroups: m.appGroups || [],
            appProperties: m.appProperties || [],
            appOutlets: m.appOutlets || [],
            appCompanies: m.appCompanies || [],
          },
        });
      }
    }

    return role;
  }

  @Post()
  async createRole(
    @Body()
    data: {
      name: string;
      description?: string;
      permissionIds?: string[];
    },
  ) {
    // Resolve permission IDs from names
    let finalPermissionIds = data.permissionIds || [];
    if (finalPermissionIds.length > 0 && finalPermissionIds[0].includes(":")) {
      const perms = await this.prisma.permission.findMany({
        where: { name: { in: finalPermissionIds } },
        select: { id: true },
      });
      finalPermissionIds = perms.map((p) => p.id);
    }

    return this.prisma.centralRole.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          create: finalPermissionIds.map((pId) => ({ permissionId: pId })),
        },
      },
    });
  }

  @Post("mapping")
  async createMapping(
    @Body()
    data: {
      centralRoleId: string;
      appId: string;
      appRoleName?: string;
      appGroups?: string[];
      appProperties?: string[];
      appOutlets?: string[];
      appCompanies?: string[];
    },
  ) {
    return this.prisma.roleAppMapping.upsert({
      where: {
        centralRoleId_appId: {
          centralRoleId: data.centralRoleId,
          appId: data.appId,
        },
      },
      update: {
        appRoleName: data.appRoleName,
        appGroups: data.appGroups || [],
        appProperties: data.appProperties || [],
        appOutlets: data.appOutlets || [],
        appCompanies: data.appCompanies || [],
      },
      create: {
        centralRoleId: data.centralRoleId,
        appId: data.appId,
        appRoleName: data.appRoleName,
        appGroups: data.appGroups || [],
        appProperties: data.appProperties || [],
        appOutlets: data.appOutlets || [],
        appCompanies: data.appCompanies || [],
      },
    });
  }
}
