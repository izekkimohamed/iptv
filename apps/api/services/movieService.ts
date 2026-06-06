import { batchInsert, getTmdbInfo } from "@/trpc/common";
import { getDb } from "@/trpc/db";
import { movies, playlists } from "@/trpc/schema";
import { cleanName } from "@/utils/cleanName";
import { Xtream } from "@iptv/xtream-api";
import { and, asc, eq, gt, ilike } from "drizzle-orm";

export async function getMoviesFromDb(input: {
  playlistId: number;
  categoryId?: number;
  cursor?: number | null;
  limit?: number;
}) {
  const db = getDb();
  const limit = input.limit ?? 50;
  const cursor = input.cursor;

  const whereConditions = [
    eq(movies.playlistId, input.playlistId),
  ];

  if (input.categoryId) {
    whereConditions.push(eq(movies.categoryId, input.categoryId));
  }

  if (cursor) {
    whereConditions.push(gt(movies.id, cursor));
  }

  const result = await db
    .select()
    .from(movies)
    .where(and(...whereConditions))
    .orderBy(asc(movies.id))
    .limit(limit + 1);

  let nextCursor: typeof cursor | undefined = undefined;
  if (result.length > limit) {
    const nextItem = result.pop();
    nextCursor = nextItem?.id;
  }

  return {
    items: result,
    nextCursor,
  };
}

export async function fetchAndPrepareMovies(
  playlistId: number,
  xtreamClient: Xtream,
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
  movieId: number,
) {
  const res = await fetch(
    `${url}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${movieId}`,
  );
  console.log(JSON.stringify(res, null, 2));
  const data = await res.json();
  if (!data) throw new Error("Failed to get movie details from Xtream API");

  const details = await getTmdbInfo(
    "movie",
    data.info.tmdb_id,
    cleanName(data.movie_data.name),
    new Date(data.info.releasedate).getFullYear(),
  );
  return { ...data, tmdb: details };
}

export async function getTmdbMovieMatches(tmdbId: number, playlistId: number) {
  const tmdbDetails = await getTmdbInfo("movie", tmdbId);
  if (!tmdbDetails) return [];

  const db = getDb();
  const [playlist, dbMovies] = await Promise.all([
    db.select().from(playlists).where(eq(playlists.id, playlistId)).limit(1),
    db
      .select()
      .from(movies)
      .where(
        and(
          ilike(movies.name, `%${tmdbDetails.title}%`),
          eq(movies.playlistId, playlistId),
        ),
      )
      .execute(),
  ]);

  if (!playlist[0]) throw new Error("Playlist not found");
  if (dbMovies.length === 0) return [{ tmdb: tmdbDetails, dbMovies: [] }];

  const { baseUrl, username, password } = playlist[0];
  const tmdbYear =
    tmdbDetails.releaseDate ?
      new Date(tmdbDetails.releaseDate).getFullYear()
    : null;

  const results = await Promise.all(
    dbMovies.map(async (movie) => {
      try {
        const res = await fetch(
          `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${movie.streamId}`,
        );
        const movieInfo = await res.json();
        const movieYear =
          movieInfo.info?.releasedate ?
            new Date(movieInfo.info.releasedate).getFullYear()
          : null;
        if (tmdbYear && movieYear && movieYear !== tmdbYear) return null;
        return movie;
      } catch {
        return movie;
      }
    }),
  );

  const matched = results.filter(
    (m): m is (typeof dbMovies)[number] => m !== null,
  );
  return [{ tmdb: tmdbDetails, dbMovies: matched }];
}
