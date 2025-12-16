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
import { and, eq, inArray, not } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, t } from "../trpc";

function xtream(url: string, username: string, password: string) {
  return new Xtream({ url, username, password, preferredFormat: "m3u8" });
}

// Define a reasonable batch size for the IN clause (e.g., 500 or 1000)
const BATCH_SIZE = 500;

async function pruneCategoriesByType(
  db: ReturnType<typeof getDb>,
  playlistId: number,
  type: "channels" | "movies" | "series",
  validCatIds: number[]
) {
  const commonConditions = [
    eq(categories.playlistId, playlistId),
    eq(categories.type, type),
  ];

  // Case 1: No valid IDs to keep (Delete ALL of this type for this playlist)
  if (validCatIds.length === 0) {
    return await db
      .delete(categories)
      .where(and(...commonConditions))
      .returning({ id: categories.id });
  }

  // Case 2: A small number of valid IDs (Use the original inArray method)
  if (validCatIds.length < BATCH_SIZE) {
    const conditions = [
      ...commonConditions,
      not(inArray(categories.categoryId, validCatIds)),
    ];

    return await db
      .delete(categories)
      .where(and(...conditions))
      .returning({ id: categories.id });
  }

  let deletedIds: { id: number }[] = [];

  // Get ALL category IDs that belong to the playlist and type
  const allCatIdsResult = await db
    .select({ categoryId: categories.categoryId })
    .from(categories)
    .where(and(...commonConditions));

  const allCategoryIds = allCatIdsResult.map(
    (row: { categoryId: number }) => row.categoryId
  );

  // Determine the IDs that need to be deleted
  const validSet = new Set(validCatIds);
  const idsToDelete = allCategoryIds.filter((id: number) => !validSet.has(id));

  if (idsToDelete.length === 0) {
    console.log("No categories to delete after filtering.");
    return []; // Nothing to delete
  }

  console.log(`Found ${idsToDelete.length} categories to delete. Batching...`);

  // Perform the batched deletion on the IDs that need to be removed
  for (let i = 0; i < idsToDelete.length; i += BATCH_SIZE) {
    const batch = idsToDelete.slice(i, i + BATCH_SIZE);

    // The conditions for the delete are:
    // 1. belongs to the playlist/type (already implicitly filtered by how idsToDelete was created)
    // 2. the categoryId is one of the batch IDs
    const batchConditions = [
      ...commonConditions,
      inArray(categories.categoryId, batch),
    ];

    const result = await db
      .delete(categories)
      .where(and(...batchConditions))
      .returning({ id: categories.id });

    deletedIds = deletedIds.concat(result);
  }

  return deletedIds;
}

export async function performPlaylistUpdate(input: {
  url: string;
  username: string;
  password: string;
  playlistId: number;
}) {
  const db = getDb();
  const x = xtream(input.url, input.username, input.password);
  const existingCats = await db
    .select({ categoryId: categories.categoryId, type: categories.type })
    .from(categories)
    .where(eq(categories.playlistId, input.playlistId));
  const existingCatKeys = new Set(
    existingCats.map((c) => `${c.categoryId}-${c.type}`)
  );
  const channelCats = await x.getChannelCategories();
  const ccats = channelCats
    .filter((c) => !existingCatKeys.has(`${c.category_id}-channels`))
    .map((c) => ({
      playlistId: input.playlistId,
      type: "channels" as const,
      categoryName: c.category_name,
      categoryId: +c.category_id,
    }));
  if (ccats.length) {
    await db.insert(categories).values(ccats).onConflictDoNothing();
  }
  const movieCats = await x.getMovieCategories();
  const mcats = movieCats
    .filter((c) => !existingCatKeys.has(`${c.category_id}-movies`))
    .map((c) => ({
      playlistId: input.playlistId,
      type: "movies" as const,
      categoryName: c.category_name,
      categoryId: +c.category_id,
    }));
  if (mcats.length) {
    await db.insert(categories).values(mcats).onConflictDoNothing();
  }
  const seriesCats = await x.getShowCategories();
  const scats = seriesCats
    .filter((c) => !existingCatKeys.has(`${c.category_id}-series`))
    .map((c) => ({
      playlistId: input.playlistId,
      type: "series" as const,
      categoryName: c.category_name,
      categoryId: +c.category_id,
    }));
  if (scats.length) {
    await db.insert(categories).values(scats).onConflictDoNothing();
  }
  const [channelsData, moviesData, seriesData] = await Promise.all([
    x.getChannels(),
    x.getMovies(),
    x.getShows(),
  ]);
  const allowedChannelIdsByCat = new Map<number, number[]>();
  for (const ch of channelsData) {
    const catId = Number(ch.category_id);
    const list = allowedChannelIdsByCat.get(catId) ?? [];
    list.push(ch.stream_id);
    allowedChannelIdsByCat.set(catId, list);
  }
  const allowedMovieIdsByCat = new Map<number, number[]>();
  for (const m of moviesData) {
    const catId = m.category_id ? Number(m.category_id) : 0;
    const list = allowedMovieIdsByCat.get(catId) ?? [];
    list.push(m.stream_id);
    allowedMovieIdsByCat.set(catId, list);
  }
  const allowedSeriesIdsByCat = new Map<number, number[]>();
  for (const s of seriesData) {
    const catId = Number(s.category_id);
    const list = allowedSeriesIdsByCat.get(catId) ?? [];
    list.push(s.series_id);
    allowedSeriesIdsByCat.set(catId, list);
  }
  let deletedChannels = 0;
  for (const [catId, ids] of allowedChannelIdsByCat.entries()) {
    const rows =
      ids.length > 0 ?
        await db
          .delete(channels)
          .where(
            and(
              eq(channels.playlistId, input.playlistId),
              eq(channels.categoryId, catId),
              not(inArray(channels.streamId, ids))
            )
          )
          .returning({ id: channels.id })
      : await db
          .delete(channels)
          .where(
            and(
              eq(channels.playlistId, input.playlistId),
              eq(channels.categoryId, catId)
            )
          )
          .returning({ id: channels.id });
    deletedChannels += rows.length;
  }
  let deletedMovies = 0;
  for (const [catId, ids] of allowedMovieIdsByCat.entries()) {
    const rows =
      ids.length > 0 ?
        await db
          .delete(movies)
          .where(
            and(
              eq(movies.playlistId, input.playlistId),
              eq(movies.categoryId, catId),
              not(inArray(movies.streamId, ids))
            )
          )
          .returning({ id: movies.id })
      : await db
          .delete(movies)
          .where(
            and(
              eq(movies.playlistId, input.playlistId),
              eq(movies.categoryId, catId)
            )
          )
          .returning({ id: movies.id });
    deletedMovies += rows.length;
  }
  let deletedSeries = 0;
  for (const [catId, ids] of allowedSeriesIdsByCat.entries()) {
    const rows =
      ids.length > 0 ?
        await db
          .delete(series)
          .where(
            and(
              eq(series.playlistId, input.playlistId),
              eq(series.categoryId, catId),
              not(inArray(series.seriesId, ids))
            )
          )
          .returning({ id: series.id })
      : await db
          .delete(series)
          .where(
            and(
              eq(series.playlistId, input.playlistId),
              eq(series.categoryId, catId)
            )
          )
          .returning({ id: series.id });
    deletedSeries += rows.length;
  }
  const existingChannels = await db
    .select({
      streamId: channels.streamId,
      categoryId: channels.categoryId,
    })
    .from(channels)
    .where(eq(channels.playlistId, input.playlistId));
  const existingMovies = await db
    .select({ streamId: movies.streamId, categoryId: movies.categoryId })
    .from(movies)
    .where(eq(movies.playlistId, input.playlistId));
  const existingSeries = await db
    .select({ seriesId: series.seriesId, categoryId: series.categoryId })
    .from(series)
    .where(eq(series.playlistId, input.playlistId));
  const existingChannelKeys = new Set(
    existingChannels.map((c) => `${c.streamId}-${c.categoryId}`)
  );
  const existingMovieKeys = new Set(
    existingMovies.map((m) => `${m.streamId}-${m.categoryId}`)
  );
  const existingSeriesKeys = new Set(
    existingSeries.map((s) => `${s.seriesId}-${s.categoryId}`)
  );
  const channelsChunk = channelsData
    .filter(
      (ch) =>
        !existingChannelKeys.has(`${ch.stream_id}-${Number(ch.category_id)}`)
    )
    .map((ch) => ({
      categoryId: +ch.category_id,
      name: ch.name,
      streamType: ch.stream_type,
      streamId: ch.stream_id,
      streamIcon: ch.stream_icon || "",
      playlistId: input.playlistId,
      isFavorite: false,
      url: ch.url || "",
    }));
  const moviesChunk = moviesData
    .filter(
      (m) =>
        !existingMovieKeys.has(
          `${m.stream_id}-${m.category_id ? Number(m.category_id) : 0}`
        )
    )
    .map((m) => ({
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
  const seriesChunk = seriesData
    .filter(
      (s) => !existingSeriesKeys.has(`${s.series_id}-${Number(s.category_id)}`)
    )
    .map((s) => ({
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
    channelsChunk.length > 0 ?
      batchInsert(channels, channelsChunk, { chunkSize: 3000, concurrency: 5 })
    : Promise.resolve(),
    moviesChunk.length > 0 ?
      batchInsert(movies, moviesChunk, { chunkSize: 5000, concurrency: 5 })
    : Promise.resolve(),
    seriesChunk.length > 0 ?
      batchInsert(series, seriesChunk, { chunkSize: 3000, concurrency: 5 })
    : Promise.resolve(),
  ]);
  const channelCatIdsWithItems = await db
    .select({ categoryId: channels.categoryId })
    .from(channels)
    .where(eq(channels.playlistId, input.playlistId));
  const movieCatIdsWithItems = await db
    .select({ categoryId: movies.categoryId })
    .from(movies)
    .where(eq(movies.playlistId, input.playlistId));
  const seriesCatIdsWithItems = await db
    .select({ categoryId: series.categoryId })
    .from(series)
    .where(eq(series.playlistId, input.playlistId));

  const channelCatIds = channelCatIdsWithItems.map((r) => r.categoryId);
  const movieCatIds = movieCatIdsWithItems.map((r) => r.categoryId);
  const seriesCatIds = seriesCatIdsWithItems.map((r) => r.categoryId);
  const prunedChannelsCats = await pruneCategoriesByType(
    db,
    input.playlistId,
    "channels",
    channelCatIds
  );
  const prunedMoviesCats = await pruneCategoriesByType(
    db,
    input.playlistId,
    "movies",
    movieCatIds
  );
  const prunedSeriesCats = await pruneCategoriesByType(
    db,
    input.playlistId,
    "series",
    seriesCatIds
  );
  await db
    .update(playlists)
    .set({ updatedAt: new Date().toISOString() })
    .where(eq(playlists.id, input.playlistId));
  return {
    success: true,
    newItems: {
      channels: channelsChunk.length,
      movies: moviesChunk.length,
      series: seriesChunk.length,
    },
    deletedItems: {
      channels: deletedChannels,
      movies: deletedMovies,
      series: deletedSeries,
    },
    categories: {
      channelsCat: ccats,
      moviesCat: mcats,
      seriesCat: scats,
      pruned: {
        channels: prunedChannelsCats,
        movies: prunedMoviesCats,
        series: prunedSeriesCats,
      },
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
      const xtreamData = xtream(p[0].baseUrl, p[0].username, p[0].password);
      const profile = await xtreamData.getChannelCategories();
      const channels = await xtreamData.getChannels();
      const xtreamData2 = xtream(p[1].baseUrl, p[1].username, p[1].password);
      const profile2 = await xtreamData2.getChannelCategories();
      const channels2 = await xtreamData2.getChannels();

      console.log(xtreamData.baseUrl, channels.length, profile.length);
      console.log(xtreamData2.baseUrl, channels2.length, profile2.length);

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
