import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { ClerkStrategy } from "./clerk.strategy";
import { DatabaseModule } from "../database/database.module";
import { KeycloakAdminService } from "./keycloak-admin.service";
import { ClerkAdminService } from "./clerk-admin.service";
import { MultiAuthGuard } from "./multi-auth.guard";

import { PermissionsGuard } from "./permissions.guard";

import { forwardRef } from "@nestjs/common";
import { ProvisioningModule } from "../provisioning/provisioning.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    DatabaseModule,
    forwardRef(() => ProvisioningModule),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    ClerkStrategy,
    KeycloakAdminService,
    ClerkAdminService,
    PermissionsGuard,
    MultiAuthGuard,
  ],
  exports: [
    PassportModule,
    JwtStrategy,
    ClerkStrategy,
    KeycloakAdminService,
    ClerkAdminService,
    PermissionsGuard,
    MultiAuthGuard,
  ],
})
export class AuthModule {}
