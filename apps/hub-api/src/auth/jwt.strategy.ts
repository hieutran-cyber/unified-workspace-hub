import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";
import { PrismaService } from "../database/database.module";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: process.env.KEYCLOAK_ID,
      issuer: process.env.KEYCLOAK_ISSUER,
      algorithms: ["RS256"],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`,
      }),
    });
  }

  async validate(payload: any) {
    const keycloakId = payload.sub;

    // 1. Fetch from DB
    const dbUser = await this.prisma.user.findUnique({
      where: { keycloakId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // 2. Extract all permissions (Keycloak usually doesn't have org_id in token in the same way)
    let permissions: string[] = [];
    if (dbUser) {
      permissions = dbUser.roles.flatMap(r => r.role.permissions.map(p => p.permission.name));
    }

    // Fallback
    if (permissions.length === 0) {
      permissions = payload.hub_permissions || [];
    }

    return {
      userId: keycloakId,
      email: payload.email,
      roles: dbUser?.roles.map(r => r.role.name) || payload.realm_access?.roles || [],
      permissions: permissions,
      name: payload.name,
      provider: "keycloak" as const,
      dbId: dbUser?.id,
    };
  }
}
