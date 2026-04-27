import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class MultiAuthGuard extends AuthGuard(["jwt", "clerk-jwt"]) {
  // Passport will try "jwt" first, then "clerk-jwt".
  // If ALL fail, it will call handleRequest with info from the LAST one.

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (user) {
      return user;
    }

    // If we are here, both failed.
    // info might contain why (e.g. "No auth token", "jwt expired", etc.)
    throw (
      err ||
      new UnauthorizedException(
        info?.message || "Authentication failed (tried both Keycloak and Clerk)",
      )
    );
  }
}
