import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  playlists: t.router({
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
  }),
  channels: t.router({
    getChannels: publicProcedure.input(z.object({
      playlistId: z.number(),
      categoryId: z.number().optional(),
    })).output(z.array(z.object({
      id: z.number(),
      name: z.string(),
      streamType: z.string(),
      streamId: z.number(),
      streamIcon: z.string().optional(),
      categoryId: z.number(),
      playlistId: z.number().optional(),
      isFavorite: z.boolean().default(false),
      url: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getCategories: publicProcedure.input(z.object({
      playlistId: z.number(),
    })).output(z.array(zodCategoriesSchema)).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createChannels: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createChannelsCategories: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

