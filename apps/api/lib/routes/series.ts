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
        categoryId: z.number(),
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
