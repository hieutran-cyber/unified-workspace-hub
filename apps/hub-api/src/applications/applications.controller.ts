import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { PrismaService } from "../database/database.module";
import { MultiAuthGuard } from "../auth/multi-auth.guard";

@Controller("applications")
@UseGuards(MultiAuthGuard)
export class ApplicationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getApplications(@Request() req: any) {
    const { user } = req;
    const orgId = user.orgId;

    // Filter apps by organization if orgId is present in token
    // This ensures that when managing roles, only org-owned apps are shown
    return this.prisma.application.findMany({
      where: orgId ? {
        OR: [
          { organizationId: orgId },
          { organization: { clerkOrgId: orgId } },
          { organizationId: null }, // Global apps like Hub
        ]
      } : {},
      orderBy: { name: "asc" },
    });
  }
}
