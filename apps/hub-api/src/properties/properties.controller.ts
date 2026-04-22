import { Controller, Get, Post, Put, Body, Param, UseGuards } from "@nestjs/common";
import { PrismaService } from "../database/database.module";
import { PropertySyncService } from "./property-sync.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../auth/permissions.guard";
import { RequiredPermissions } from "../auth/permissions.decorator";

@Controller("properties")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PropertiesController {
  constructor(
    private prisma: PrismaService,
    private syncService: PropertySyncService,
  ) {}

  @Get()
  @RequiredPermissions("hub:properties:view")
  async getProperties() {
    return this.prisma.property.findMany({
      orderBy: { name: "asc" },
    });
  }

  @Get(":id")
  @RequiredPermissions("hub:properties:view")
  async getProperty(@Param("id") id: string) {
    return this.prisma.property.findUnique({
      where: { id },
    });
  }

  @Post()
  @RequiredPermissions("hub:properties:manage")
  async createProperty(
    @Body()
    data: {
      name: string;
      code: string;
      address?: string;
    },
  ) {
    const property = await this.prisma.property.create({
      data,
    });

    // Trigger sync
    await this.syncService.syncProperty(property.id);

    return property;
  }

  @Put(":id")
  @RequiredPermissions("hub:properties:manage")
  async updateProperty(
    @Param("id") id: string,
    @Body()
    data: {
      name?: string;
      code?: string;
      address?: string;
      status?: string;
    },
  ) {
    const property = await this.prisma.property.update({
      where: { id },
      data,
    });

    // Trigger sync
    await this.syncService.syncProperty(property.id);

    return property;
  }
}
