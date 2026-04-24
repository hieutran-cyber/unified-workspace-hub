import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, "clerk-jwt") {
  constructor() {
    const issuer = process.env.CLERK_JWT_ISSUER;
    const jwksUri =
      process.env.CLERK_JWKS_URL || `${issuer}/.well-known/jwks.json`;

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
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: payload.roles || [],
      permissions: payload.hub_permissions || payload.permissions || [],
      orgId: payload.org_id,
      orgRole: payload.org_role,
      provider: "clerk" as const,
    };
  }
}
