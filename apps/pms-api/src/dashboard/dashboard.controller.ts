import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { MultiAuthGuard } from "../auth/multi-auth.guard";

@Controller("dashboard")
@UseGuards(MultiAuthGuard)
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get("stats")
  async getStats(@Request() req) {
    try {
      const userEmail = req.user.email;
      if (!userEmail) {
        console.warn("getStats called without user email in request");
      }

      // Find local user in PMS database
      const pmsUser = userEmail ? await this.prisma.pmsUser.findUnique({
        where: { email: userEmail },
      }) : null;

      return {
        user: pmsUser
          ? {
              id: pmsUser.id,
              fullName: pmsUser.fullName,
              role: pmsUser.role,
              mappingSource: "Keycloak SSO",
            }
          : { error: "User not found in PMS DB" },
        stats: {
          totalReservations: 124,
          availableRooms: 12,
          occupiedRooms: 45,
          revenueToday: 15000000,
        },
        recentActivity: [
          { id: 1, guest: "Nguyễn Văn A", room: "101", action: "Check-in", time: "08:30" },
          { id: 2, guest: "Trần Thị B", room: "205", action: "Check-out", time: "09:45" },
          { id: 3, guest: "Lê Văn C", room: "302", action: "Booking", time: "10:15" },
        ],
      };
    } catch (e) {
      console.error("Error in DashboardController.getStats:", e);
      throw e;
    }
  }
}
