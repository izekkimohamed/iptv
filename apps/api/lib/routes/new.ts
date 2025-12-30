import { getDb } from "@/trpc/db";
import {
  channels,
  movies,
  playlists,
  series,
  zodChannelsSchema,
  zodMovieSchema,
  zodSerieSchema,
} from "@/trpc/schema";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, t } from "../trpc";

// Input schema used by all three procedures
const syncInput = z.object({
  playlistId: z.number(),
});

export const newRouter = t.router({
  // --- CHANNELS ---
  getNewChannels: publicProcedure
    .input(syncInput)
    .output(z.array(zodChannelsSchema))
    .query(async ({ input }) => {
      const db = getDb();
      const [p] = await db
        .select()
        .from(playlists)
        .where(eq(playlists.id, input.playlistId));
      if (!p) return [];

      const updatedTime = new Date(p.updatedAt).toISOString().split("T")[0];
      const newChannels = await db
        .select()
        .from(channels)
        .where(
          and(
            eq(channels.playlistId, input.playlistId),
            eq(sql`DATE(${channels.createdAt})`, sql`DATE(${updatedTime})`)
          )
        );

      return newChannels.map((r) => ({
        ...r,
        streamIcon: r.streamIcon ?? undefined,
        isFavorite: r.isFavorite ?? false,
      }));
    }),

  // --- MOVIES ---
  getNewMovies: publicProcedure
    .input(syncInput)
    .output(z.array(zodMovieSchema))
    .query(async ({ input }) => {
      const db = getDb();
      const [p] = await db
        .select()
        .from(playlists)
        .where(eq(playlists.id, input.playlistId));
      if (!p) return [];

      const dateStr = new Date(p.updatedAt).toISOString().split("T")[0];

      return await db
        .select()
        .from(movies)
        .where(
          and(
            eq(movies.playlistId, input.playlistId),
            sql`DATE(${movies.createdAt}) = ${dateStr}`
          )
        );
    }),

  // --- SERIES ---
  getNewSeries: publicProcedure
    .input(syncInput)
    .output(z.array(zodSerieSchema))
    .query(async ({ input }) => {
      const db = getDb();
      const [p] = await db
        .select()
        .from(playlists)
        .where(eq(playlists.id, input.playlistId));
      if (!p) return [];

      const dateStr = new Date(p.updatedAt).toISOString().split("T")[0];

      return await db
        .select()
        .from(series)
        .where(
          and(
            eq(series.playlistId, input.playlistId),
            sql`DATE(${series.createdAt}) = ${dateStr}`
          )
        );
    }),
});
