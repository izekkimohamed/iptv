import { batchInsert, getTmdbInfo } from "@/trpc/common";
import { getDb } from "@/trpc/db";
import { categories, series, zodSerieSchema } from "@/trpc/schema";
import { Xtream } from "@iptv/xtream-api";
import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, t } from "../trpc";

function xtream(url: string, username: string, password: string) {
  return new Xtream({ url, username, password, preferredFormat: "m3u8" });
}

export const seriesRouter = t.router({
  getseries: publicProcedure
    .input(
      z.object({
        playlistId: z.number(),
        categoryId: z.number(),
      })
    )
    .output(z.array(zodSerieSchema))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(series)
        .where(
          and(
            eq(series.playlistId, input.playlistId),
            eq(series.categoryId, input.categoryId)
          )
        )
        .orderBy(asc(series.id));
      return rows;
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
      const res = await fetch(
        `${input.url}/player_api.php?username=${input.username}&password=${input.password}&action=get_series_info&series_id=${input.serieId}`
      );
      const data = await res.json();
      if (!data) throw new Error("Failed to get serie details from Xtream API");
      const seasons = Object.keys(data.episodes).map((season) =>
        Number(season)
      );
      data.seasons = seasons;
      const details = await getTmdbInfo(
        "show",
        data.info.tmdb_id,
        data.info.name,
        new Date(data.info.first_aired).getFullYear()
      );
      return { ...data, tmdb: details };
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
      const x = xtream(input.url, input.username, input.password);
      const seriesData = await x.getShows();
      const uniqueCategoryIds = new Set<number>();
      seriesData.forEach((serie) => {
        if (serie.category_id) uniqueCategoryIds.add(Number(serie.category_id));
      });
      const db = getDb();
      const existingCategories = await db
        .select({ selected: categories.categoryId })
        .from(categories);
      const missingCategoryIds = Array.from(uniqueCategoryIds).filter(
        (id) => !existingCategories.map((cat) => cat.selected).includes(id)
      );
      if (missingCategoryIds.length > 0) {
        const newCategories = missingCategoryIds.map((id) => ({
          playlistId: input.playlistId,
          type: "series" as const,
          categoryName: `category ${id}`,
          categoryId: id,
        }));
        await db.insert(categories).values(newCategories);
      }
      const seriesChunk = seriesData.map((serie) => ({
        seriesId: serie.series_id,
        name: serie.name ?? "",
        cast: serie.cast ?? "",
        director: serie.director ?? "",
        genere: serie.genre ?? "",
        releaseDate: serie.release_date ?? "",
        lastModified: serie.last_modified ?? "",
        rating: serie.rating?.toString() ?? "0",
        backdropPath:
          Array.isArray(serie.backdrop_path) ? serie.backdrop_path[0] : "",
        youtubeTrailer: serie.youtube_trailer ?? "",
        episodeRunTime: serie.episode_run_time ?? "",
        categoryId: +serie.category_id,
        playlistId: input.playlistId,
        cover: serie.cover ?? "",
        plot: serie.plot ?? "",
      }));
      await batchInsert(series, seriesChunk, {
        chunkSize: 3000,
        concurrency: 5,
      });
      return { success: true };
    }),
  getSeriesCategories: publicProcedure
    .input(
      z.object({
        playlistId: z.number(),
      })
    )
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
      const db = getDb();
      const x = xtream(input.url, input.username, input.password);
      const data = await x.getShowCategories();
      const tempCategories = data.map((category) => ({
        playlistId: input.playlistId,
        type: "series" as const,
        categoryName: category.category_name,
        categoryId: +category.category_id,
      }));
      if (!tempCategories.length) return [];
      await db
        .insert(categories)
        .values(tempCategories)
        .onConflictDoUpdate({
          target: [categories.categoryId, categories.playlistId],
          set: {
            categoryName: sql`excluded.category_name`,
            type: sql`excluded.type`,
          },
        })
        .catch(() => {
          return { success: false, message: "error", data: [] };
        });
      return { success: true };
    }),
});
