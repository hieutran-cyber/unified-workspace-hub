import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class MultiAuthGuard extends AuthGuard(["jwt", "clerk-jwt"]) {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    return super.handleRequest(err, user, info, context);
  }
}
