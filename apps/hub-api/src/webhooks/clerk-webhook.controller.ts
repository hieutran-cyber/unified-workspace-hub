import { Controller, Post, Req, Headers, BadRequestException, Logger } from "@nestjs/common";
import type { Request } from "express";
import { Webhook } from "svix";
import { PrismaService } from "../database/database.module";

@Controller("webhooks/clerk")
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Req() req: Request,
    @Headers("svix-id") svixId: string,
    @Headers("svix-timestamp") svixTimestamp: string,
    @Headers("svix-signature") svixSignature: string,
  ) {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) throw new BadRequestException("Missing CLERK_WEBHOOK_SECRET");

    const payload = (req as any).rawBody?.toString() || JSON.stringify(req.body);
    const wh = new Webhook(secret);
    let evt: any;
    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      this.logger.error("Invalid Clerk webhook signature", err as any);
      throw new BadRequestException("Invalid signature");
    }

    const type = evt.type as string;
    const data = evt.data;
    this.logger.log(`Clerk event: ${type}`);

    switch (type) {
      case "user.created":
      case "user.updated": {
        const email = data.email_addresses?.[0]?.email_address;
        if (!email) return { ok: true };

        // DOMAIN RESTRICTION
        const allowedDomains = (
          process.env.ALLOWED_EMAIL_DOMAINS || "kinex.com,inbox4us.xyz"
        ).split(",");
        const emailDomain = email.split("@")[1];

        if (!allowedDomains.includes(emailDomain)) {
          this.logger.warn(`Blocked sign-up attempt from unauthorized domain: ${email}`);
          return { ok: true, status: "blocked" };
        }

        const name = [data.first_name, data.last_name].filter(Boolean).join(" ");

        // ONLY UPDATE EXISTING USERS (Whitelist Policy)
        const existingUser = await this.prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          await this.prisma.user.update({
            where: { email },
            data: {
              clerkUserId: data.id,
              name: existingUser.name || name || undefined,
            },
          });
          this.logger.log(`Linked Clerk ID ${data.id} to existing user ${email}`);
        } else {
          this.logger.warn(`Ignored Clerk user creation for ${email} (Not in whitelist)`);
        }
        break;
      }
      case "user.deleted": {
        if (data.id) {
          await this.prisma.user
            .updateMany({ where: { clerkUserId: data.id }, data: { status: "inactive" } })
            .catch(() => undefined);
        }
        break;
      }
      default:
        this.logger.log(`Unhandled event type: ${type}`);
    }

    return { ok: true };
  }
}
