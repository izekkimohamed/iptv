import { getDb } from "@/trpc/db";
import { createXtreamClient } from "@/utils/xtream";
import {
  buildMissingCategories,
  fetchAndPrepareCategories,
  insertMissingCategories,
} from "./categoryService";
import { fetchAndPrepareChannels, insertChannels } from "./channelService";
import { fetchAndPrepareMovies, insertMovies } from "./movieService";
import { fetchAndPrepareSeries, insertSeries } from "./seriesService";

interface PlaylistUpdateInput {
  url: string;
  username: string;
  password: string;
  playlistId: number;
}

export async function performPlaylistUpdate(input: PlaylistUpdateInput) {
  const db = getDb();
  const xtreamClient = createXtreamClient(
    input.url,
    input.username,
    input.password
  );

  // Fetch categories
  const categoryData = await fetchAndPrepareCategories(input.playlistId);

  // Fetch channels
  const { newChannels, toDelete: channelsToDelete } =
    await fetchAndPrepareChannels(input.playlistId, xtreamClient);

  const newChannelsCategories = buildMissingCategories(
    newChannels,
    "channels",
    input.playlistId,
    categoryData.idSets.channels
  );
  await insertMissingCategories(newChannelsCategories);
  await insertChannels(newChannels);

  // Fetch movies
  const { newMovies, toDelete: moviesToDelete } = await fetchAndPrepareMovies(
    input.playlistId,
    xtreamClient
  );

  const newMoviesCategories = buildMissingCategories(
    newMovies,
    "movies",
    input.playlistId,
    categoryData.idSets.movies
  );
  await insertMissingCategories(newMoviesCategories);
  await insertMovies(newMovies);

  // Fetch series
  const { newSeries, toDelete: seriesToDelete } = await fetchAndPrepareSeries(
    input.playlistId,
    xtreamClient
  );

  const newSeriesCategories = buildMissingCategories(
    newSeries,
    "series",
    input.playlistId,
    categoryData.idSets.series
  );
  await insertMissingCategories(newSeriesCategories);
  await insertSeries(newSeries);

  return {
    success: true,
    newItems: {
      channels: newChannels.length,
      movies: newMovies.length,
      series: newSeries.length,
    },
    deletedItems: {
      channels: channelsToDelete.length,
      movies: moviesToDelete.length,
      series: seriesToDelete.length,
    },
    categories: {
      channelsCat: newChannelsCategories.length,
      moviesCat: newMoviesCategories.length,
      seriesCat: newSeriesCategories.length,
    },
  };
}
