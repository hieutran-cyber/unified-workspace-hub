import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { RolesController } from "./roles/roles.controller";
import { ProvisioningModule } from "./provisioning/provisioning.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { ApplicationsController } from "./applications/applications.controller";
import { UsersController } from "./users/users.controller";

import { PropertiesController } from "./properties/properties.controller";
import { PropertySyncService } from "./properties/property-sync.service";

@Module({
  imports: [DatabaseModule, AuthModule, ProvisioningModule, WebhooksModule],
  controllers: [RolesController, ApplicationsController, UsersController, PropertiesController],
  providers: [PropertySyncService],
})
export class AppModule {}
