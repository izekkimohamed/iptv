import { batchInsert } from "@/trpc/common";
import { getDb } from "@/trpc/db";
import {
  categories,
  channels,
  movies,
  playlists,
  series,
  user,
  zodPlaylistsSchema,
} from "@/trpc/schema";
import { Xtream } from "@iptv/xtream-api";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, t } from "../trpc";

function xtream(url: string, username: string, password: string) {
  return new Xtream({ url, username, password, preferredFormat: "m3u8" });
}

export async function performPlaylistUpdate(input: {
  url: string;
  username: string;
  password: string;
  playlistId: number;
}) {
  const db = getDb();
  const x = xtream(input.url, input.username, input.password);

  // categories
  const fetchedChannelsCategories = await x.getChannelCategories();
  const fetchedMoviesCategories = await x.getMovieCategories();
  const fetchedSeriesCategories = await x.getShowCategories();
  const fetchedCategories: (typeof categories.$inferInsert)[] = [
    ...fetchedChannelsCategories.map((category) => ({
      categoryName: category.category_name,
      categoryId: parseInt(category.category_id),
      playlistId: input.playlistId,
      type: "channels" as const,
    })),
    ...fetchedMoviesCategories.map((category) => ({
      categoryName: category.category_name,
      categoryId: parseInt(category.category_id),
      playlistId: input.playlistId,
      type: "movies" as const,
    })),
    ...fetchedSeriesCategories.map((category) => ({
      categoryName: category.category_name,
      categoryId: parseInt(category.category_id),
      playlistId: input.playlistId,
      type: "series" as const,
    })),
  ];

  const ExistingCategories = await db
    .select({ categoryId: categories.categoryId, type: categories.type })
    .from(categories)
    .where(eq(categories.playlistId, input.playlistId));
  const fetchedCategoriesMap = new Map(
    fetchedCategories.map((category) => [category.categoryId, category])
  );
  const categoryMap = new Map(
    ExistingCategories.map((category) => [category.categoryId, category])
  );
  const newCategories = fetchedCategories.filter(
    (category) => !categoryMap.has(Number(category.categoryId))
  );
  const categoriesToDelete = ExistingCategories.filter(
    (category) => !fetchedCategoriesMap.has(category.categoryId)
  );

  if (newCategories.length > 0) {
    const categoriesToCreate = await db
      .insert(categories)
      .values(newCategories)
      .returning({ categoryId: categories.categoryId });
    console.log("created categories", categoriesToCreate.length);
  }

  // channels
  const fetchedChannels = await x.getChannels();
  const existingChannels = await db
    .select({ streamId: channels.streamId })
    .from(channels)
    .where(eq(channels.playlistId, input.playlistId));

  const fetchedChannelsMap = new Map(
    fetchedChannels.map((channel) => [channel.stream_id, channel])
  );
  const ExistinghannelsMap = new Map(
    existingChannels.map((channel) => [channel.streamId, channel])
  );
  const newChannels = fetchedChannels
    .filter((channel) => !ExistinghannelsMap.has(Number(channel.stream_id)))
    .map((channel) => ({
      categoryId: +channel.category_id,
      name: channel.name || "Unkown channel",
      streamType: channel.stream_type,
      streamId: channel.stream_id,
      streamIcon: channel.stream_icon || "",
      playlistId: input.playlistId,
      isFavorite: false,
      url: channel.url || "",
    }));

  const newChannelsCategories = newChannels.map((channel) => ({
    playlistId: input.playlistId,
    type: "channels" as const,
    categoryName: `category ${channel.categoryId}`,
    categoryId: channel.categoryId,
  }));

  const newChannelsCategoriesMap = new Map(
    newChannelsCategories.map((category) => [category.categoryId, category])
  );

  const existingChannelsCategories = ExistingCategories.filter(
    (c) => c.type !== "channels"
  );
  const existingChannelsCategoriesMap = new Map(
    existingChannelsCategories.map((category) => [
      category.categoryId,
      category,
    ])
  );

  const newChannelsCategoriesToCreate = newChannelsCategories.filter(
    (category) => !existingChannelsCategoriesMap.has(category.categoryId)
  );
  console.log(
    "new channels categories",
    newChannelsCategoriesMap.size,
    existingChannelsCategories.length
  );
  if (newChannelsCategoriesToCreate.length > 0) {
    // await db
    //   .insert(categories)
    //   .values(newChannelsCategoriesToCreate)
    //   .onConflictDoUpdate({
    //     target: [categories.categoryId, categories.playlistId],
    //     set: {
    //       categoryName: sql`excluded.category_name`,
    //       type: sql`excluded.type`,
    //     },
    //   });
    console.log(
      " newChannelsCategoriesToCreate",
      newChannelsCategoriesToCreate.length
    );
  }

  const channelsToDelete = existingChannels.filter(
    (channel) => !fetchedChannelsMap.has(Number(channel.streamId))
  );

  if (newChannels.length > 0) {
    const results = await batchInsert(channels, newChannels, {
      chunkSize: 3000,
      concurrency: 5,
    });
    console.log("new channels", results);
  }

  // movies
  const fetchedMovies = await x.getMovies();
  const existingMovies = await db
    .select({ streamId: movies.streamId })
    .from(movies)
    .where(eq(movies.playlistId, input.playlistId));
  const fetchedMoviesMap = new Map(
    fetchedMovies.map((movie) => [movie.stream_id, movie])
  );
  const ExistingMoviesMap = new Map(
    existingMovies.map((movie) => [movie.streamId, movie])
  );
  const newMovies = fetchedMovies
    .filter((movie) => !ExistingMoviesMap.has(Number(movie.stream_id)))
    .map((movie) => ({
      streamId: movie.stream_id,
      name: movie.name,
      streamType: movie.stream_type,
      streamIcon: movie.stream_icon,
      rating: movie.rating,
      added: movie.added,
      categoryId: movie.category_id,
      playlistId: input.playlistId,
      containerExtension: movie.container_extension,
      url: movie.url,
    }));
  const newMoviesCategories = newMovies.map((movie) => ({
    playlistId: input.playlistId,
    type: "movies" as const,
    categoryName: `category ${movie.categoryId}`,
    categoryId: +movie.categoryId,
  }));

  const existingMoviesCategoriesMap = new Map(
    ExistingCategories.map((category) => [category.categoryId, category])
  );

  const newMoviesCategoriesToCreate = newMoviesCategories.filter(
    (category) => !existingMoviesCategoriesMap.has(category.categoryId)
  );
  console.log("new movies categories", newMoviesCategoriesToCreate);
  if (newMoviesCategoriesToCreate.length > 0) {
    await db
      .insert(categories)
      .values(newMoviesCategoriesToCreate)
      .onConflictDoUpdate({
        target: [categories.categoryId, categories.playlistId],
        set: {
          categoryName: sql`excluded.category_name`,
          type: sql`excluded.type`,
        },
      });
  }
  const moviesToDelete = existingMovies.filter(
    (movie) => !fetchedMoviesMap.has(Number(movie.streamId))
  );
  if (newMovies.length > 0) {
    await batchInsert(movies, newMovies, {
      chunkSize: 3000,
      concurrency: 5,
    });
    console.log("new movies", newMovies.length);
  }

  // series
  const fetchedSeries = await x.getShows();
  const existingSeries = await db
    .select({ seriesId: series.seriesId })
    .from(series)
    .where(eq(series.playlistId, input.playlistId));
  const fetchedSeriesMap = new Map(
    fetchedSeries.map((series) => [series.series_id, series])
  );
  const ExistingSeriesMap = new Map(
    existingSeries.map((series) => [series.seriesId, series])
  );
  const newSeries = fetchedSeries
    .filter((series) => !ExistingSeriesMap.has(Number(series.series_id)))
    .map((series) => ({
      seriesId: series.series_id,
      name: series.name,
      cover: series.cover,
      plot: series.plot,
      rating: series.rating,
      cast: series.cast,
      genere: series.genre,
      director: series.director,
      releaseDate: series.release_date,
      lastModified: series.last_modified,
      backdropPath: series.backdrop_path,
      youtubeTrailer: series.youtube_trailer,
      episodeRunTime: series.episode_run_time,
      categoryId: series.category_id,
      playlistId: input.playlistId,
    }));
  const existingSeriesCategoriesMap = new Map(
    ExistingCategories.filter((category) => category.type === "series").map(
      (category) => [category.categoryId, category]
    )
  );
  const newSeriesCategories = newSeries.map((series) => ({
    playlistId: input.playlistId,
    type: "series" as const,
    categoryName: `category ${series.categoryId}`,
    categoryId: +series.categoryId,
  }));

  const newSeriesCategoriesToCreate = newSeriesCategories.filter(
    (category) => !existingSeriesCategoriesMap.has(Number(category.categoryId))
  );
  if (newSeriesCategoriesToCreate.length > 0) {
    await db
      .insert(categories)
      .values(newSeriesCategoriesToCreate)
      .onConflictDoUpdate({
        target: [categories.categoryId, categories.playlistId],
        set: {
          categoryName: sql`excluded.category_name`,
          type: sql`excluded.type`,
        },
      });
    console.log("new series categories", newSeriesCategoriesToCreate.length);
  }

  const seriesToDelete = existingSeries.filter(
    (series) => !fetchedSeriesMap.has(Number(series.seriesId))
  );

  if (newSeries.length > 0) {
    await batchInsert(series, newSeries, {
      chunkSize: 3000,
      concurrency: 5,
    });
    console.log("new series", newSeries.length);
  }

  return {
    success: true,
    newItems: {
      channels: newChannels[0],
      movies: newMovies[0],
      series: newSeries[0],
    },
    deletedItems: {
      channels: channelsToDelete[0],
      movies: moviesToDelete[0],
      series: seriesToDelete[0],
    },
    categories: {
      channelsCat: newCategories[0],
      moviesCat: newCategories[0],
      seriesCat: newCategories[0],
    },
  };
}

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
      const p = await db.select().from(playlists);

      return p;
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
      if (!data.status || data.status !== "Active")
        throw new Error("Failed to get profile from xtream");

      const anonymousId = "anonymous";
      const existingAnonymous = await db
        .select()
        .from(user)
        .where(eq(user.id, anonymousId));
      if (existingAnonymous.length === 0) {
        await db
          .insert(user)
          .values({
            id: anonymousId,
            name: "Anonymous",
            email: "anonymous@example.com",
          })
          .onConflictDoNothing();
      }
      const res = await db
        .insert(playlists)
        .values({
          baseUrl: input.url,
          expDate: data.exp_date || "",
          isTrial: data.is_trial,
          password: data.password,
          username: data.username,
          status: data.status,
          userId: anonymousId,
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
        .returning({ username: playlists.username });
      return { success: `Playlist ${name.username} deleted successfully` };
    }),
});
