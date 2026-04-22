import { Controller, Get, Param, Put, Body, UseGuards, Post } from "@nestjs/common";
import { PrismaService } from "../database/database.module";
import { ProvisioningService } from "../provisioning/provisioning.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../auth/permissions.guard";
import { RequiredPermissions } from "../auth/permissions.decorator";

@Controller("users")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private prisma: PrismaService,
    private provisioning: ProvisioningService,
  ) {}

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
