import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../database/database.module";
import { ClerkAdminService } from "../auth/clerk-admin.service";

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly clerk: ClerkAdminService,
  ) {}

  async create(name: string, userId: string, provider: "clerk" | "keycloak") {
    this.logger.log(`Creating organization "${name}" for user ${userId} (${provider})`);

    let clerkOrgId: string | undefined;

    if (provider === "clerk") {
      try {
        const clerkOrg = await this.clerk.createOrganization(name, userId);
        clerkOrgId = clerkOrg.id;
        this.logger.log(`Created organization in Clerk: ${clerkOrgId}`);
      } catch (error) {
        this.logger.error("Failed to create organization in Clerk", error);
        throw new BadRequestException("Could not create organization in Clerk");
      }
    }

    // Find internal user ID
    const internalUser = await this.db.user.findFirst({
      where: {
        OR: [{ clerkUserId: userId }, { keycloakId: userId }, { id: userId }],
      },
    });

    if (!internalUser) {
      this.logger.error(`User ${userId} not found in database`);
      throw new BadRequestException(
        "Authenticated user not found in local database. Please sync first.",
      );
    }

    // Save to local database
    const org = await this.db.organization.create({
      data: {
        name,
        clerkOrgId,
        users: {
          create: {
            userId: internalUser.id,
          },
        },
      },
    });

    return org;
  }

  async findAll(userId: string) {
    return this.db.organization.findMany({
      where: {
        users: {
          some: {
            user: {
              OR: [{ clerkUserId: userId }, { keycloakId: userId }, { id: userId }],
            },
          },
        },
      },
      include: {
        _count: {
          select: { properties: true, users: true, roles: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.db.organization.findUnique({
      where: { id },
      include: {
        properties: true,
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}
