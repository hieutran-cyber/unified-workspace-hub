import { Controller, Get, UseGuards } from "@nestjs/common";
import { PrismaService } from "../database/database.module";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("applications")
// @UseGuards(JwtAuthGuard) // Optional: Uncomment to protect this endpoint
export class ApplicationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getApplications() {
    return this.prisma.application.findMany({
      orderBy: { name: "asc" },
    });
  }
}
