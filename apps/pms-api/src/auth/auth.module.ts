import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";
import { ClerkStrategy } from "./clerk.strategy";
import { MultiAuthGuard } from "./multi-auth.guard";
import { PermissionsGuard } from "./permissions.guard";
import { PrismaService } from "../prisma.service";

@Module({
  imports: [PassportModule.register({ defaultStrategy: "jwt" })],
  providers: [JwtStrategy, ClerkStrategy, MultiAuthGuard, PermissionsGuard, PrismaService],
  exports: [PassportModule, MultiAuthGuard, PermissionsGuard],
})
export class AuthModule {}
