import { getTmdbPopularMovies, getTmdbPopularSeries } from "@/trpc/common";
import { getDb } from "@/trpc/db";
import {
  channels,
  movies,
  series,
  zodChannelsSchema,
  zodMovieSchema,
  zodSerieSchema,
} from "@/trpc/schema";
import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, t } from "../trpc";

export const homeRouter = t.router({
  getHome: publicProcedure
    .output(
      z.object({
        movies: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            overview: z.string(),
            releaseDate: z.string(),
            voteAverage: z.number(),
            voteCount: z.number(),
            popularity: z.number(),
            posterUrl: z.string().nullable(),
            backdropUrl: z.string().nullable(),
            genres: z.array(z.string().optional()),
          })
        ),
        series: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            overview: z.string(),
            firstAirDate: z.string(),
            voteAverage: z.number(),
            voteCount: z.number(),
            popularity: z.number(),
            posterUrl: z.string().nullable(),
            backdropUrl: z.string().nullable(),
            genres: z.array(z.string().optional()),
          })
        ),
      })
    )
    .query(async () => {
      const movies = await getTmdbPopularMovies();
      const series = await getTmdbPopularSeries();
      return { movies, series };
    }),
  globalSearch: publicProcedure
    .input(
      z.object({
        query: z.string(),
        playlistId: z.number(),
      })
    )
    .output(
      z.object({
        movies: z.array(zodMovieSchema).nullable(),
        channels: z.array(zodChannelsSchema).nullable(),
        series: z.array(zodSerieSchema).nullable(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const [movieResults, seriesResults, channelsResults] = await Promise.all([
        await db
          .select()
          .from(movies)
          .where(
            and(
              ilike(movies.name, `%${input.query}%`),
              eq(movies.playlistId, input.playlistId)
            )
          )
          .execute(),
        await db
          .select()
          .from(series)
          .where(
            and(
              ilike(series.name, `%${input.query}%`),
              eq(series.playlistId, input.playlistId)
            )
          )
          .execute(),
        await db
          .select()
          .from(channels)
          .where(
            and(
              ilike(channels.name, `%${input.query}%`),
              eq(channels.playlistId, input.playlistId)
            )
          )
          .execute(),
      ]);
      return {
        movies: movieResults.length > 0 ? movieResults : null,
        series: seriesResults.length > 0 ? seriesResults : null,
        channels:
          channelsResults.length > 0 ?
            channelsResults.map((r) => ({
              ...r,
              streamIcon: r.streamIcon ?? undefined,
              isFavorite: r.isFavorite ?? false,
            }))
          : null,
      };
    }),
});
