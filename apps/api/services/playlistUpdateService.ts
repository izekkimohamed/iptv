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

  // Fetch categories
  const categoryData = await fetchAndPrepareCategories(input.playlistId);
  console.log("res", categoryData);
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
