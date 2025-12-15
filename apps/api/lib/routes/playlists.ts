import { batchInsert } from "@/trpc/common";
import { getDb } from "@/trpc/db";
import {
  categories,
  channels,
  movies,
  playlists,
  series,
  zodPlaylistsSchema,
} from "@/trpc/schema";
import { Xtream } from "@iptv/xtream-api";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, t } from "../trpc";

function xtream(url: string, username: string, password: string) {
  return new Xtream({ url, username, password, preferredFormat: "m3u8" });
}

export const playlistsRouter = t.router({
  getPlaylists: publicProcedure
    .output(z.array(zodPlaylistsSchema))
    .query(async () => {
      const db = getDb();
      return await db.select().from(playlists);
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
      const x = xtream(input.url, input.username, input.password);
      const data = await x.getProfile();
      if (!data) throw new Error("Failed to get profile from xtream");
      const res = await db
        .insert(playlists)
        .values({
          baseUrl: input.url,
          expDate: data.exp_date || "",
          isTrial: data.is_trial,
          password: data.password,
          username: data.username,
          status: data.status,
          userId: "",
          createdAt: new Date().toISOString(),
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
      const db = getDb();
      const x = xtream(input.url, input.username, input.password);

      const channelCats = await x.getChannelCategories();
      const ccats = channelCats.map((c) => ({
        playlistId: input.playlistId,
        type: "channels" as const,
        categoryName: c.category_name,
        categoryId: +c.category_id,
      }));
      if (ccats.length) {
        await db
          .insert(categories)
          .values(ccats)
          .onConflictDoUpdate({
            target: [categories.categoryId, categories.playlistId],
            set: {
              categoryName: sql`excluded.category_name`,
              type: sql`excluded.type`,
            },
          });
      }

      const movieCats = await x.getMovieCategories();
      const mcats = movieCats.map((c) => ({
        playlistId: input.playlistId,
        type: "movies" as const,
        categoryName: c.category_name,
        categoryId: +c.category_id,
      }));
      if (mcats.length) {
        await db
          .insert(categories)
          .values(mcats)
          .onConflictDoUpdate({
            target: [categories.categoryId, categories.playlistId],
            set: {
              categoryName: sql`excluded.category_name`,
              type: sql`excluded.type`,
            },
          });
      }

      const seriesCats = await x.getShowCategories();
      const scats = seriesCats.map((c) => ({
        playlistId: input.playlistId,
        type: "series" as const,
        categoryName: c.category_name,
        categoryId: +c.category_id,
      }));
      if (scats.length) {
        await db
          .insert(categories)
          .values(scats)
          .onConflictDoUpdate({
            target: [categories.categoryId, categories.playlistId],
            set: {
              categoryName: sql`excluded.category_name`,
              type: sql`excluded.type`,
            },
          });
      }

      const [channelsData, moviesData, seriesData] = await Promise.all([
        x.getChannels(),
        x.getMovies(),
        x.getShows(),
      ]);

      const channelsChunk = channelsData.map((ch) => ({
        categoryId: +ch.category_id,
        name: ch.name,
        streamType: ch.stream_type,
        streamId: ch.stream_id,
        streamIcon: ch.stream_icon || "",
        playlistId: input.playlistId,
        isFavorite: false,
        url: ch.url || "",
      }));
      const moviesChunk = moviesData.map((m) => ({
        streamId: m.stream_id,
        name: m.name,
        streamType: "movie",
        streamIcon: m.stream_icon || "",
        rating: m.rating?.toString() ?? "0",
        added: m.added,
        categoryId: m.category_id ? Number(m.category_id) : 0,
        playlistId: input.playlistId,
        containerExtension: m.container_extension,
        url: m.url || "",
      }));
      const seriesChunk = seriesData.map((s) => ({
        seriesId: s.series_id,
        name: s.name ?? "",
        cast: s.cast ?? "",
        director: s.director ?? "",
        genere: s.genre ?? "",
        releaseDate: s.release_date ?? "",
        lastModified: s.last_modified ?? "",
        rating: s.rating?.toString() ?? "0",
        backdropPath: Array.isArray(s.backdrop_path) ? s.backdrop_path[0] : "",
        youtubeTrailer: s.youtube_trailer ?? "",
        episodeRunTime: s.episode_run_time ?? "",
        categoryId: +s.category_id,
        playlistId: input.playlistId,
        cover: s.cover ?? "",
        plot: s.plot ?? "",
      }));

      await Promise.all([
        batchInsert(channels, channelsChunk, {
          chunkSize: 3000,
          concurrency: 5,
        }),
        batchInsert(movies, moviesChunk, { chunkSize: 5000, concurrency: 5 }),
        batchInsert(series, seriesChunk, { chunkSize: 3000, concurrency: 5 }),
      ]);

      return { success: true };
    }),
  deletePlaylist: publicProcedure
    .input(
      z.object({
        playlistId: z.number(),
      })
    )
    .output(z.object({ success: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [name] = await db
        .delete(playlists)
        .where(and(eq(playlists.id, input.playlistId)))
        .returning({ id: playlists.username });
      return { success: `Playlist ${name} deleted successfully` };
    }),
});
