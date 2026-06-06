import {
  buildMissingCategories,
  fetchAndCreateCategoriesByType,
  insertMissingCategories,
} from "@/services/categoryService";
import {
  fetchAndPrepareMovies,
  getMovieDetails,
  getMoviesFromDb,
  getTmdbMovieMatches,
  insertMovies,
} from "@/services/movieService";
import { getTmdbInfo } from "@/trpc/common";
import { getDb } from "@/trpc/db";
import { categories, movies, zodCategoriesSchema, zodMovieSchema } from "@/trpc/schema";
import { createXtreamClient } from "@/utils/xtream";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, t } from "../trpc";

const tmdbInfoSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string().nullable(),
  tagline: z.string().nullable(),
  status: z.string().nullable(),
  voteAverage: z.number().nullable(),
  voteCount: z.number().nullable(),
  popularity: z.number().nullable(),
  originalLanguage: z.string().nullable(),
  spokenLanguages: z.array(z.string()).nullable(),
  productionCountries: z.array(z.string()).nullable(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })).nullable(),
  runtime: z.number().nullable(),
  numberOfSeasons: z.number().nullable(),
  numberOfEpisodes: z.number().nullable(),
  networks: z
    .array(z.object({ name: z.string(), logo: z.string().nullable() }))
    .nullable(),
  createdBy: z.array(z.string()).nullable(),
  releaseDate: z.string().nullable(),
  poster: z.string().nullable(),
  backdrop: z.string().nullable(),
  director: z.string().nullable(),
  cast: z.array(
    z.object({ name: z.string(), profilePath: z.string().nullable() }),
  ),
  videos: z.array(
    z.object({
      id: z.string(),
      key: z.string(),
      site: z.string(),
      type: z.string(),
      name: z.string(),
    }),
  ),
});

export const moviesRouter = t.router({
  getMovies: publicProcedure
    .input(
      z.object({
        playlistId: z.number(),
        categoryId: z.number().optional(),
        cursor: z.number().nullish(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .output(
      z.object({
        items: z.array(zodMovieSchema),
        nextCursor: z.number().nullish(),
      }),
    )
    .query(async ({ input }) => {
      return await getMoviesFromDb(input);
    }),

  getMovieById: publicProcedure
    .input(z.object({ id: z.number() }))
    .output(zodMovieSchema.nullable())
    .query(async ({ input }) => {
      const db = getDb();
      const [result] = await db
        .select()
        .from(movies)
        .where(eq(movies.id, input.id))
        .limit(1);
      return result ?? null;
    }),

  getMovie: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
        movieId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      return await getMovieDetails(
        input.url,
        input.username,
        input.password,
        input.movieId,
      );
    }),

  getTmdbMovieDetails: publicProcedure
    .input(
      z.object({
        tmdbId: z.number(),
        playlistId: z.number(),
      }),
    )
    .output(
      z.array(
        z.object({
          tmdb: tmdbInfoSchema,
          dbMovies: z.array(zodMovieSchema),
        }),
      ),
    )
    .query(async ({ input }) => {
      return await getTmdbMovieMatches(input.tmdbId, input.playlistId);
    }),

  getMovieDetails: publicProcedure
    .input(
      z.object({
        tmdbId: z.number().nullable(),
        name: z.string().nullable(),
        year: z.number().nullable(),
      }),
    )
    .output(tmdbInfoSchema.nullable())
    .query(async ({ input }) => {
      if (input.tmdbId !== null && input.tmdbId !== undefined) {
        return await getTmdbInfo("movie", input.tmdbId ?? undefined);
      }
      return await getTmdbInfo(
        "movie",
        undefined,
        input.name ?? undefined,
        input.year ?? undefined,
      );
    }),

  createMovie: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
        playlistId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const xtreamClient = createXtreamClient(
        input.url,
        input.username,
        input.password,
      );

      const { newMovies } = await fetchAndPrepareMovies(
        input.playlistId,
        xtreamClient,
      );

      const categoryData = buildMissingCategories(
        newMovies,
        "movies",
        input.playlistId,
        new Set(),
      );
      await insertMissingCategories(categoryData);
      await insertMovies(newMovies);

      return { success: true };
    }),

  getMoviesCategories: publicProcedure
    .input(z.object({ playlistId: z.number() }))
    .output(z.array(zodCategoriesSchema))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.playlistId, input.playlistId),
            eq(categories.type, "movies"),
          ),
        )
        .orderBy(asc(categories.id));
      return rows.map((r) => ({
        ...r,
        playlistId: r.playlistId ?? input.playlistId,
      }));
    }),

  createMoviesCategories: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
        playlistId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const xtreamClient = createXtreamClient(
        input.url,
        input.username,
        input.password,
      );
      return await fetchAndCreateCategoriesByType(
        xtreamClient,
        "movies",
        input.playlistId,
      );
    }),
});
