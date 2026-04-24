import { Injectable, Logger } from "@nestjs/common";
import { createClerkClient, ClerkClient } from "@clerk/backend";

@Injectable()
export class ClerkAdminService {
  private readonly logger = new Logger(ClerkAdminService.name);
  private client: ClerkClient;

  constructor() {
    this.client = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }

  async upsertClerkUser(user: {
    email: string;
    name?: string | null;
    clerkUserId?: string | null;
  }) {
    if (user.clerkUserId) {
      const [firstName, ...rest] = (user.name || "").split(" ");
      await this.client.users.updateUser(user.clerkUserId, {
        firstName: firstName || undefined,
        lastName: rest.join(" ") || undefined,
      });
      return user.clerkUserId;
    }

    const [firstName, ...rest] = (user.name || "").split(" ");
    const created = await this.client.users.createUser({
      emailAddress: [user.email],
      firstName: firstName || undefined,
      lastName: rest.join(" ") || undefined,
      skipPasswordRequirement: true,
    });
    return created.id;
  }

  async setUserMetadata(clerkUserId: string, publicMetadata: Record<string, any>) {
    await this.client.users.updateUserMetadata(clerkUserId, { publicMetadata });
  }

  async createOrganization(name: string, createdBy: string) {
    return this.client.organizations.createOrganization({ name, createdBy });
  }

  async addMember(organizationId: string, userId: string, role = "basic_member") {
    return this.client.organizations.createOrganizationMembership({
      organizationId,
      userId,
      role,
    });
  }

  getClient() {
    return this.client;
  }
}
