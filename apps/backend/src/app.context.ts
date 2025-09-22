// app.context.ts
import { Injectable } from "@nestjs/common";
import { ContextOptions, TRPCContext } from "nestjs-trpc";

@Injectable()
export class AppContext implements TRPCContext {
  async create(opts: ContextOptions): Promise<{ req: any; res: any }> {
    return {
      req: opts.req,
      res: opts.res,
    };
  }
}
