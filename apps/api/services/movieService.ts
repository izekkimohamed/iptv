import { batchInsert, getTmdbInfo } from "@/trpc/common";
import { getDb } from "@/trpc/db";
import { movies } from "@/trpc/schema";
import { cleanName } from "@/utils/cleanName";
import { Xtream } from "@iptv/xtream-api";
import { and, eq, ilike } from "drizzle-orm";

export async function fetchAndPrepareMovies(
  playlistId: number,
  xtreamClient: Xtream
) {
  const db = getDb();
  const fetched = await xtreamClient.getMovies();
  const existing = await db
    .select({ streamId: movies.streamId })
    .from(movies)
    .where(eq(movies.playlistId, playlistId));

  const fetchedMap = new Map(fetched.map((m) => [m.stream_id, m]));
  const existingMap = new Map(existing.map((m) => [m.streamId, m]));

  const newMovies = fetched
    .filter((m) => !existingMap.has(Number(m.stream_id)))
    .map((m) => ({
      streamId: m.stream_id,
      name: m.name || "Unknown movie",
      streamType: m.stream_type,
      streamIcon: m.stream_icon || "",
      rating: m.rating ? m.rating.toString() : "0",
      added: m.added || "",
      categoryId: +m.category_id,
      playlistId,
      containerExtension: m.container_extension,
      url: m.url || "",
    }));

  const toDelete = existing.filter((m) => !fetchedMap.has(Number(m.streamId)));

  return { newMovies, toDelete };
}

export async function insertMovies(newMovies: (typeof movies.$inferInsert)[]) {
  if (newMovies.length === 0) return;

  const results = await batchInsert(movies, newMovies, {
    chunkSize: 3000,
    concurrency: 5,
  });
  return results;
}

export async function getMovieDetails(
  url: string,
  username: string,
  password: string,
  movieId: number
) {
  const res = await fetch(
    `${url}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${movieId}`
  );
  const data = await res.json();
  if (!data) throw new Error("Failed to get movie details from Xtream API");

  const details = await getTmdbInfo(
    "movie",
    data.info.tmdb_id,
    cleanName(data.movie_data.name),
    new Date(data.info.releasedate).getFullYear()
  );
  return { ...data, tmdb: details };
}

export async function getTmdbMovieMatches(tmdbId: number, playlistId: number) {
  const tmdbDetails = await getTmdbInfo("movie", tmdbId);
  if (!tmdbDetails) return [];

  const db = getDb();
  const dbMovies = await db
    .select()
    .from(movies)
    .where(
      and(
        ilike(movies.name, `%${tmdbDetails.title}%`),
        eq(movies.playlistId, playlistId)
      )
    )
    .execute();

  if (dbMovies.length === 0) {
    const tmdb = {
      ...tmdbDetails,
      overview: tmdbDetails.overview ?? null,
      genres: tmdbDetails.genres ?? null,
      runtime: tmdbDetails.runtime ?? null,
      releaseDate: tmdbDetails.releaseDate ?? null,
    };
    return [{ tmdb, dbMovies: [] }];
  }

  const tmdbYear =
    tmdbDetails.releaseDate ?
      new Date(tmdbDetails.releaseDate).getFullYear()
    : null;

  const matched: typeof dbMovies = [];
  for (const movie of dbMovies) {
    const baseUrl = movie.url.split("/movie")[0];
    const username = movie.url.split("/")[4];
    const password = movie.url.split("/")[5];

    const res = await fetch(
      `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${movie.streamId}`
    );
    const movieInfo = await res.json();
    const movieYear =
      movieInfo.info?.releasedate ?
        new Date(movieInfo.info.releasedate).getFullYear()
      : null;

    if (!movieYear) continue;
    if (tmdbYear && movieYear === tmdbYear) {
      matched.push(movie);
    }
  }

  const tmdb = {
    ...tmdbDetails,
    overview: tmdbDetails.overview ?? null,
    genres: tmdbDetails.genres ?? null,
    runtime: tmdbDetails.runtime ?? null,
    releaseDate: tmdbDetails.releaseDate ?? null,
  };
  return [{ tmdb, dbMovies: matched }];
}
