import { Controller, Post, Body, Get, Request, UseGuards } from "@nestjs/common";
import { MultiAuthGuard } from "../auth/multi-auth.guard";
import { PrismaService } from "../prisma.service";

@Controller("users")
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get("me")
  @UseGuards(MultiAuthGuard)
  async getMe(@Request() req: any) {
    const { user } = req;
    
    // In PMS, we trust the token for Hub permissions
    // but we can return the local PMS profile info as well.
    const pmsUser = await this.prisma.pmsUser.findUnique({
      where: { email: user.email },
    });

    return {
      token: {
        userId: user.userId,
        email: user.email,
        permissions: user.permissions,
      },
      database: {
        id: pmsUser?.id,
        role: pmsUser?.role,
        permissions: user.permissions, // We use the token ones as primary for UI
      },
    };
  }

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
