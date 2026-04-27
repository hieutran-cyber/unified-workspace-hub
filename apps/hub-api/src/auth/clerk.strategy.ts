import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";
import { PrismaService } from "../database/database.module";

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, "clerk-jwt") {
  private readonly logger = new Logger(ClerkStrategy.name);

  constructor(private prisma: PrismaService) {
    const issuer = process.env.CLERK_JWT_ISSUER;
    const jwksUri = process.env.CLERK_JWKS_URL || `${issuer}/.well-known/jwks.json`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer,
      algorithms: ["RS256"],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
    });

    this.logger.log(`Initializing ClerkStrategy with JWKS: ${jwksUri}`);
  }

  async validate(payload: any) {
    const clerkUserId = payload.sub;
    const orgId = payload.org_id;
    const email = payload.email;

    // 0. Domain restriction check
    if (email) {
      const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || "kinex.com,inbox4us.xyz").split(
        ",",
      );
      const emailDomain = email.split("@")[1];
      if (!allowedDomains.includes(emailDomain)) {
        this.logger.warn(`Blocked access attempt from unauthorized domain: ${email}`);
        throw new UnauthorizedException(
          "Tài khoản của bạn không thuộc tổ chức được phép truy cập.",
        );
      }
    }

    // 1. Find user in local DB
    const dbUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ clerkUserId }, { email: email }],
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                organization: true,
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. WHITELIST CHECK: Only allow login if user exists in DB
    if (!dbUser) {
      this.logger.warn(`Rejected login attempt: User ${email} not found in database.`);
      throw new UnauthorizedException(
        "Tài khoản của bạn chưa được cấp quyền truy cập hệ thống. Vui lòng liên hệ quản trị viên.",
      );
    }

    // 3. Extract permissions from DB based on current Org
    let permissions: string[] = [];
    if (dbUser) {
      const activeRoles = dbUser.roles.filter((ur) => {
        if (!orgId) return true;
        return ur.role.organization?.clerkOrgId === orgId || ur.role.organizationId === orgId;
      });
      permissions = activeRoles.flatMap((r) => r.role.permissions.map((p) => p.permission.name));
    }

    const dbRoles = dbUser?.roles.map((r) => r.role.name) || [];
    const roles = dbRoles;

    return {
      userId: clerkUserId,
      email: email,
      name: payload.name,
      roles: roles,
      permissions: permissions,
      orgId: orgId,
      orgRole: payload.org_role,
      provider: "clerk" as const,
      dbId: dbUser?.id,
    };
  }
}
