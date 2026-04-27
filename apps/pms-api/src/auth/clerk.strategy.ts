import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";
import { PrismaService } from "../prisma.service";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, "clerk-jwt") {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    const issuer = process.env.CLERK_JWT_ISSUER;
    const jwksUri = process.env.CLERK_JWKS_URL || `${issuer}/.well-known/jwks.json`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ["RS256"],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
    });
  }

  async validate(payload: any) {
    try {
      const KINEX_ORG_ID = "org_3CmwDxbcwYqKaKNrz2H86AjxIKq";
      const tokenOrgId = payload.org_id;

      if (tokenOrgId !== KINEX_ORG_ID) {
        throw new UnauthorizedException(
          "Tài khoản của bạn không thuộc Organization được cấp phép cho PMS này.",
        );
      }

      // FETCH FROM REDIS
      const cache = await this.redis.getAccessCache(payload.sub, tokenOrgId);
      const permissions = cache?.permissions || [];

      // Find user in PMS local DB for local attributes
      const email = payload.email;
      const pmsUser = email
        ? await this.prisma.pmsUser.findUnique({
            where: { email },
          })
        : null;

      return {
        userId: payload.sub,
        email: email,
        name: payload.name,
        permissions: permissions, // Pure Redis-driven permissions
        role: pmsUser?.role || "guest",
        provider: "clerk" as const,
        pmsUserId: pmsUser?.id,
      };
    } catch (e) {
      console.error("Error in ClerkStrategy.validate:", e);
      throw e;
    }
  }
}
