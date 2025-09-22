// auth.middleware.ts
import { Injectable } from "@nestjs/common";
import {
  MiddlewareOptions,
  MiddlewareResponse,
  TRPCMiddleware,
} from "nestjs-trpc";
import { AuthService } from "@mguay/nestjs-better-auth";
import { TRPCError } from "@trpc/server";

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(opts: MiddlewareOptions<{ req: any; res: any }>) {
    const { ctx, next } = opts;
    try {
      const session = await this.authService.api.getSession({
        headers: ctx.req.headers,
      });

      if (session?.user && session?.session) {
        // carry on with added user info
        return next({
          ctx: {
            ...ctx,
            user: session.user,
            session: session.session,
          },
        });
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }
    } catch (err) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }
  }
}
