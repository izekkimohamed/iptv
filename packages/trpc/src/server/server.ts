import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  playlist: t.router({
    getPlaylists: publicProcedure.output(z.array(z.object({
      id: z.number(),
      userId: z.string(),
      baseUrl: z.string(),
      username: z.string(),
      password: z.string(),
      status: z.string(),
      expDate: z.string(),
      isTrial: z.string(),
      createdAt: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createPlaylist: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
    })).output(z.any()).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

