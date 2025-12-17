import { batchInsert, getTmdbInfo } from "@/trpc/common";
import { getDb } from "@/trpc/db";
import { series } from "@/trpc/schema";
import type { Xtream } from "@iptv/xtream-api";
import { eq } from "drizzle-orm";

export async function fetchAndPrepareSeries(
  playlistId: number,
  xtreamClient: Xtream
) {
  const db = getDb();
  const fetched = await xtreamClient.getShows();
  const existing = await db
    .select({ seriesId: series.seriesId })
    .from(series)
    .where(eq(series.playlistId, playlistId));

  const fetchedMap = new Map(fetched.map((s) => [s.series_id, s]));
  const existingMap = new Map(existing.map((s) => [s.seriesId, s]));

  const newSeries = fetched
    .filter((s) => !existingMap.has(Number(s.series_id)))
    .map((s) => ({
      seriesId: s.series_id,
      name: s.name || "Unknown series",
      cover: s.cover || "",
      plot: s.plot,
      rating: s.rating ? s.rating.toString() : "0",
      lastModified: s.last_modified || "",
      cast: s.cast,
      genere: s.genre,
      director: s.director,
      releaseDate: s.release_date,
      backdropPath: s.backdrop_path[0],
      youtubeTrailer: s.youtube_trailer,
      episodeRunTime: s.episode_run_time ? s.episode_run_time.toString() : "",
      categoryId: +s.category_id,
      playlistId,
    }));

  const toDelete = existing.filter((s) => !fetchedMap.has(Number(s.seriesId)));

  return { newSeries, toDelete };
}

export async function insertSeries(newSeries: (typeof series.$inferInsert)[]) {
  if (newSeries.length === 0) return;

  await batchInsert(series, newSeries, {
    chunkSize: 3000,
    concurrency: 5,
  });
}

export async function getSeriesDetails(
  url: string,
  username: string,
  password: string,
  seriesId: number
) {
  const res = await fetch(
    `${url}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${seriesId}`
  );

  const data = await res.json();
  if (!data) {
    throw new Error("Failed to get serie details from Xtream API");
  }

  const episodes = data.episodes ?? {};
  const seasons = Object.keys(episodes).map(Number);
  const info = data.info ?? {};

  data.seasons = seasons;

  const details =
    info.tmdb_id ?
      await getTmdbInfo(
        "show",
        info.tmdb_id,
        info.name ?? "",
        info.first_aired ? new Date(info.first_aired).getFullYear() : undefined
      )
    : null;

  return { ...data, tmdb: details };
}
