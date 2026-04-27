import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";
import { PrismaService } from "../prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: process.env.KEYCLOAK_ID || "pms-app",
      issuer: process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/KiNEX",
      algorithms: ["RS256"],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.KEYCLOAK_JWKS_URI || "http://localhost:8080/realms/KiNEX/protocol/openid-connect/certs",
      }),
    });
  }

  async validate(payload: any) {
    // Find user in PMS local DB
    const pmsUser = await this.prisma.pmsUser.findUnique({
      where: { email: payload.email },
    });

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      permissions: payload.hub_permissions || payload.permissions || [],
      role: pmsUser?.role || "guest",
      provider: "keycloak" as const,
      pmsUserId: pmsUser?.id,
    };
  }
}
