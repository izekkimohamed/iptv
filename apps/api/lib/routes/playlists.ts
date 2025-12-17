import { performPlaylistUpdate } from "@/services/playlistUpdateService";
import { ensureAnonymousUser } from "@/services/userService";
import { getDb } from "@/trpc/db";
import { playlists, zodPlaylistsSchema } from "@/trpc/schema";
import { createXtreamClient } from "@/utils/xtream";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, t } from "../trpc";

export const playlistsRouter = t.router({
  getPlaylists: publicProcedure
    .output(
      z.array(
        z.object({
          id: z.number(),
          userId: z.string(),
          baseUrl: z.string(),
          username: z.string(),
          password: z.string(),
          status: z.string(),
          expDate: z.string(),
          isTrial: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
        })
      )
    )
    .query(async () => {
      const db = getDb();
      return db.select().from(playlists);
    }),

  createPlaylist: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
      })
    )
    .output(zodPlaylistsSchema)
    .mutation(async ({ input }) => {
      const db = getDb();
      const xtreamClient = createXtreamClient(
        input.url,
        input.username,
        input.password
      );
      const data = await xtreamClient.getProfile();

      if (!data.status || data.status !== "Active") {
        throw new Error("Failed to get profile from xtream");
      }

      await ensureAnonymousUser();

      const res = await db
        .insert(playlists)
        .values({
          baseUrl: input.url,
          expDate: data.exp_date || "",
          isTrial: data.is_trial,
          password: data.password,
          username: data.username,
          status: data.status,
          userId: "anonymous",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .onConflictDoNothing()
        .returning();

      return res[0];
    }),

  updatePlaylists: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
        playlistId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const res = await performPlaylistUpdate(input);
      const db = getDb();
      await db
        .update(playlists)
        .set({ updatedAt: new Date().toISOString() })
        .where(eq(playlists.id, input.playlistId));
      return res;
    }),

  deletePlaylist: publicProcedure
    .input(z.object({ playlistId: z.number() }))
    .output(z.object({ success: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [name] = await db
        .delete(playlists)
        .where(and(eq(playlists.id, input.playlistId)))
        .returning({ username: playlists.username });
      return { success: `Playlist ${name.username} deleted successfully` };
    }),
});
