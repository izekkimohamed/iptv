import { and, asc, eq, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';
import { t, publicProcedure } from '../trpc';
import { getDb } from '@/trpc/db';
import { categories, movies, zodCategoriesSchema, zodMovieSchema } from '@/trpc/schema';
import { Xtream } from '@iptv/xtream-api';
import { batchInsert, getTmdbInfo } from '@/trpc/common';

function xtream(url: string, username: string, password: string) {
  return new Xtream({ url, username, password, preferredFormat: 'm3u8' });
}

export const moviesRouter = t.router({
  getMovies: publicProcedure
    .input(
      z.object({
        playlistId: z.number(),
        categoryId: z.number(),
      }),
    )
    .output(z.array(zodMovieSchema))
    .query(async ({ input }) => {
      const db = getDb();
      return await db
        .select()
        .from(movies)
        .where(and(eq(movies.playlistId, input.playlistId), eq(movies.categoryId, input.categoryId)))
        .orderBy(asc(movies.id));
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
      const res = await fetch(
        `${input.url}/player_api.php?username=${input.username}&password=${input.password}&action=get_vod_info&vod_id=${input.movieId}`,
      );
      const data = await res.json();
      if (!data) throw new Error('Failed to get movie details from Xtream API');
      const details = await getTmdbInfo(
        'movie',
        data.info.tmdb_id,
        data.movie_data.name,
        new Date(data.info.releasedate).getFullYear(),
      );
      return { ...data, tmdb: details };
    }),
  getTmdbMovieDetails: publicProcedure
    .input(
      z.object({
        tmdbId: z.number(),
        playlistId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const tmdbDetails = await getTmdbInfo('movie', input.tmdbId);
      if (!tmdbDetails) return { tmdb: null, dbMovies: [] };
      const db = getDb();
      const dbMovies = await db
        .select()
        .from(movies)
        .where(and(ilike(movies.name, `%${tmdbDetails.title}%`), eq(movies.playlistId, input.playlistId)))
        .execute();
      if (dbMovies.length === 0) return { tmdb: tmdbDetails, dbMovies: [] };
      const tmdbYear = tmdbDetails.releaseDate ? new Date(tmdbDetails.releaseDate).getFullYear() : null;
      const matched: typeof dbMovies = [];
      for (const movie of dbMovies) {
        const baseUrl = movie.url.split('/movie')[0];
        const username = movie.url.split('/')[4];
        const password = movie.url.split('/')[5];
        const res = await fetch(
          `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${movie.streamId}`,
        );
        const movieInfo = await res.json();
        const movieYear = movieInfo.info?.releasedate ? new Date(movieInfo.info.releasedate).getFullYear() : null;
        if (!movieYear) continue;
        if (tmdbYear && movieYear === tmdbYear) {
          matched.push(movie);
        }
      }
      return { tmdb: tmdbDetails, dbMovies: matched };
    }),
  getMovieDetails: publicProcedure
    .input(
      z.object({
        tmdbId: z.number().nullable(),
        name: z.string().nullable(),
        year: z.number().nullable(),
      }),
    )
    .query(async ({ input }) => {
      if (input.tmdbId !== null && input.tmdbId !== undefined) {
        return await getTmdbInfo('movie', input.tmdbId ?? undefined);
      }
      return await getTmdbInfo('movie', undefined, input.name ?? undefined, input.year ?? undefined);
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
      const x = xtream(input.url, input.username, input.password);
      const moviesData = await x.getMovies();
      const moviesChunk = moviesData.map((m) => ({
        streamId: m.stream_id,
        name: m.name,
        streamType: 'movie',
        streamIcon: m.stream_icon || '',
        rating: m.rating?.toString() ?? '0',
        added: m.added,
        categoryId: m.category_id ? Number(m.category_id) : 0,
        playlistId: input.playlistId,
        containerExtension: m.container_extension,
        url: m.url || '',
      }));
      await batchInsert(movies, moviesChunk, { chunkSize: 5000, concurrency: 5 });
      return { success: true };
    }),
  getMoviesCategories: publicProcedure
    .input(
      z.object({
        playlistId: z.number(),
      }),
    )
    .output(z.array(zodCategoriesSchema))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(categories)
        .where(and(eq(categories.playlistId, input.playlistId), eq(categories.type, 'movies')))
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
      const db = getDb();
      const x = xtream(input.url, input.username, input.password);
      const data = await x.getMovieCategories();
      const tempCategories = data.map((category) => ({
        playlistId: input.playlistId,
        type: 'movies' as const,
        categoryName: category.category_name,
        categoryId: +category.category_id,
      }));
      if (!tempCategories.length) return [];
      await db
        .insert(categories)
        .values(tempCategories)
        .onConflictDoUpdate({
          target: [categories.categoryId, categories.playlistId],
          set: { categoryName: sql`excluded.category_name`, type: sql`excluded.type` },
        });
      return { success: true };
    }),
});
