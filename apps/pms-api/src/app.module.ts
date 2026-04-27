import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { DashboardController } from "./dashboard/dashboard.controller";
import { UsersController } from "./users/users.controller";
import { PrismaService } from "./prisma.service";

import { RedisModule } from "./redis/redis.module";

@Module({
  imports: [AuthModule, RedisModule],
  controllers: [DashboardController, UsersController],
  providers: [PrismaService],
})
export class AppModule {}
