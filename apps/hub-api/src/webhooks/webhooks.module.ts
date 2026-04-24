import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { ClerkWebhookController } from "./clerk-webhook.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [ClerkWebhookController],
})
export class WebhooksModule {}
