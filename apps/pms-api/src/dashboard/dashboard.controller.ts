import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PrismaService } from "../prisma.service";

@Controller("dashboard")
@UseGuards(AuthGuard("jwt"))
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get("stats")
  async getStats(@Request() req) {
    const userEmail = req.user.email;

    // Find local user in PMS database
    const pmsUser = await this.prisma.pmsUser.findUnique({
      where: { email: userEmail },
    });

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
  }
}
