import {
  buildMissingCategories,
  fetchAndCreateCategoriesByType,
  insertMissingCategories,
} from "@/services/categoryService";
import {
  fetchAndPrepareSeries,
  getSeriesDetails,
  getSeriesFromDb,
  insertSeries,
} from "@/services/seriesService";
import { getDb } from "@/trpc/db";
import {
  categories,
  paginationInputSchema,
  playlists,
  series,
  zodCategoriesSchema,
  zodSerieSchema,
} from "@/trpc/schema";
import { createXtreamClient } from "@/utils/xtream";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, t } from "../trpc";

export const seriesRouter = t.router({
  getseries: publicProcedure
    .input(
      z.object({
        playlistId: z.number(),
        categoryId: z.number().optional(),
        cursor: z.number().nullish(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .output(
      z.object({
        items: z.array(zodSerieSchema),
        nextCursor: z.number().nullish(),
      })
    )
    .query(async ({ input }) => {
      return await getSeriesFromDb(input);
    }),

  getSerieById: publicProcedure
    .input(z.object({ id: z.number() }))
    .output(zodSerieSchema.nullable())
    .query(async ({ input }) => {
      const db = getDb();
      const [result] = await db
        .select()
        .from(series)
        .where(eq(series.id, input.id))
        .limit(1);
      return result ?? null;
    }),

  getSerie: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
        serieId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await getSeriesDetails(
        input.url,
        input.username,
        input.password,
        input.serieId
      );
    }),

  getSerieEpisodes: publicProcedure
    .input(z.object({ playlistId: z.number(), serieId: z.number() }))
    .output(
      z.object({
        info: z.any(),
        seasons: z.array(z.number()),
        episodes: z.record(z.string(), z.array(
          z.object({
            id: z.number(),
            episodeNum: z.number(),
            title: z.string(),
            streamUrl: z.string(),
            plot: z.string().optional(),
          })
        )),
        tmdb: z.any().nullable(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const [playlist] = await db
        .select()
        .from(playlists)
        .where(eq(playlists.id, input.playlistId))
        .limit(1);
      if (!playlist) throw new Error("Playlist not found");

      const data = await getSeriesDetails(
        playlist.baseUrl,
        playlist.username,
        playlist.password,
        input.serieId
      );

      const episodes: Record<string, { id: number; episodeNum: number; title: string; streamUrl: string; plot?: string }[]> = {};
      for (const [season, eps] of Object.entries(data.episodes || {})) {
        episodes[season] = (eps as any[]).map((ep: any) => ({
          id: Number(ep.id),
          episodeNum: Number(ep.episode_num),
          title: ep.title || `Episode ${ep.episode_num}`,
          streamUrl: `${playlist.baseUrl}/movie/${playlist.username}/${playlist.password}/${ep.id}.${ep.container_extension || "mp4"}`,
          plot: ep.info?.plot || "",
        }));
      }

      return {
        info: data.info || {},
        seasons: data.seasons || [],
        episodes,
        tmdb: data.tmdb || null,
      };
    }),

  createSerie: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
        playlistId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const xtreamClient = createXtreamClient(
        input.url,
        input.username,
        input.password
      );

      const { newSeries } = await fetchAndPrepareSeries(
        input.playlistId,
        xtreamClient
      );

      const categoryData = await buildMissingCategories(
        newSeries,
        "series",
        input.playlistId,
        new Set()
      );
      await insertMissingCategories(categoryData);
      await insertSeries(newSeries);

      return { success: true };
    }),

  getSeriesCategories: publicProcedure
    .input(z.object({ playlistId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.playlistId, input.playlistId),
            eq(categories.type, "series")
          )
        )
        .orderBy(asc(categories.id));
      return rows.map((r) => ({
        ...r,
        playlistId: r.playlistId ?? input.playlistId,
      }));
    }),

  createSeriesCategories: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
        playlistId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const xtreamClient = createXtreamClient(
        input.url,
        input.username,
        input.password
      );
      return await fetchAndCreateCategoriesByType(
        xtreamClient,
        "series",
        input.playlistId
      );
    }),
});
