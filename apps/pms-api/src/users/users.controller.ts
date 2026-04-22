import { Controller, Post, Body } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Controller("users")
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Post("sync-from-hub")
  async syncFromHub(@Body() data: { email: string; fullName: string; keycloakId?: string }) {
    console.log(`🔄 Received sync request from Hub for: ${data.email}`);

    const user = await this.prisma.pmsUser.upsert({
      where: { email: data.email },
      update: {
        fullName: data.fullName,
        keycloakId: data.keycloakId,
      },
      create: {
        email: data.email,
        fullName: data.fullName,
        keycloakId: data.keycloakId,
        role: "staff", // Default role in PMS
      },
    });

    return {
      pmsId: user.id.toString(),
      status: "synced",
    };
  }
}
