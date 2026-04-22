import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { DatabaseModule } from "../database/database.module";
import { KeycloakAdminService } from "./keycloak-admin.service";

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
  providers: [JwtStrategy, KeycloakAdminService, PermissionsGuard],
  exports: [PassportModule, JwtStrategy, KeycloakAdminService, PermissionsGuard],
})
export class AuthModule {}
