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
  const xtreamClient = createXtreamClient(
    input.url,
    input.username,
    input.password
  );

  // Fetch categories + all 3 content types from Xtream in parallel
  const [
    categoryData,
    { newChannels, toDelete: channelsToDelete },
    { newMovies, toDelete: moviesToDelete },
    { newSeries, toDelete: seriesToDelete },
  ] = await Promise.all([
    fetchAndPrepareCategories(input.playlistId),
    fetchAndPrepareChannels(input.playlistId, xtreamClient),
    fetchAndPrepareMovies(input.playlistId, xtreamClient),
    fetchAndPrepareSeries(input.playlistId, xtreamClient),
  ]);

  // Build missing categories for each type
  const newChannelsCategories = buildMissingCategories(newChannels, "channels", input.playlistId, categoryData.idSets.channels);
  const newMoviesCategories = buildMissingCategories(newMovies, "movies", input.playlistId, categoryData.idSets.movies);
  const newSeriesCategories = buildMissingCategories(newSeries, "series", input.playlistId, categoryData.idSets.series);

  // Insert categories then content in parallel
  await insertMissingCategories([...newChannelsCategories, ...newMoviesCategories, ...newSeriesCategories]);
  await Promise.all([
    insertChannels(newChannels),
    insertMovies(newMovies),
    insertSeries(newSeries),
  ]);

  return {
    success: true,
    newItems: {
      channels: newChannels,
      movies: newMovies,
      series: newSeries,
    },
    deletedItems: {
      channels: channelsToDelete,
      movies: moviesToDelete,
      series: seriesToDelete,
    },
    categories: {
      channelsCat: newChannelsCategories,
      moviesCat: newMoviesCategories,
      seriesCat: newSeriesCategories,
    },
  };
}

export type returnType = Awaited<ReturnType<typeof performPlaylistUpdate>>;
