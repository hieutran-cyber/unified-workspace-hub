import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./auth/jwt.strategy";
import { DashboardController } from "./dashboard/dashboard.controller";
import { UsersController } from "./users/users.controller";
import { PrismaService } from "./prisma.service";

@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt" })],
  controllers: [DashboardController, UsersController],
  providers: [JwtStrategy, PrismaService],
})
export class AppModule {}
