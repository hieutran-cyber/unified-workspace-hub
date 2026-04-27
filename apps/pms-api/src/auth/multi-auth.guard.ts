import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class MultiAuthGuard extends AuthGuard(["jwt", "clerk-jwt"]) {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (user) {
      return user;
    }
    throw err || new UnauthorizedException(info?.message || "Authentication failed (PMS)");
  }
}
