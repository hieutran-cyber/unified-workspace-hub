import { Module } from "@nestjs/common";
import { ProvisioningService } from "./provisioning.service";
import { DatabaseModule } from "../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { forwardRef } from "@nestjs/common";

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  providers: [ProvisioningService],
  exports: [ProvisioningService],
})
export class ProvisioningModule {}
