import { z } from "zod";
import { getDb } from "./db";

const TmdbCastSchema = z.object({
  name: z.string(),
  profile_path: z.string().nullable(),
});

const TmdbCrewSchema = z.object({
  job: z.string(),
  name: z.string(),
});

const TmdbCreditsSchema = z.object({
  cast: z.array(TmdbCastSchema),
  crew: z.array(TmdbCrewSchema),
});

const TmdbVideoSchema = z.object({
  id: z.string(),
  key: z.string(),
  site: z.string(),
  type: z.string(),
  name: z.string(),
});

const TmdbDetailsResponseSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  overview: z.string().optional(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  runtime: z.number().optional(),
  episode_run_time: z.array(z.number()).optional(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  credits: TmdbCreditsSchema.optional(),
  videos: z
    .object({
      results: z.array(
        z.object({
          id: z.string(),
          key: z.string(),
          site: z.string(),
          type: z.string(),
          name: z.string(),
        })
      ),
    })
    .optional(),
});

export async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json();
  return data as T;
}

export async function getTmdbInfo(
  type: "movie" | "show",
  tmdbId?: number,
  name?: string,
  year?: number
) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY not configured");
  if (!tmdbId && !name) return null;
  const endpoint = type === "movie" ? "movie" : "tv";
  let id = tmdbId;
  if (!id && name) {
    const query = name
      .replace(/^[A-Z]{2}\s*-\s*/i, "")
      .replace(/\([^)]*\)/g, "")
      .trim();
    const yearParam =
      type === "movie" && year ? `&year=${year}`
      : type === "show" && year ? `&first_air_date_year=${year}`
      : "";
    const searchUrl = `https://api.themoviedb.org/3/search/${endpoint}?api_key=${apiKey}&language=en-US&query=${query}${yearParam}`;
    const searchRes = await fetchApi<{ results: { id: number }[] }>(searchUrl);
    if (!searchRes.results.length) return null;
    id = searchRes.results[0].id;
  }
  if (!id) return null;
  const detailsUrl = `https://api.themoviedb.org/3/${endpoint}/${id}?api_key=${apiKey}&language=en-US&append_to_response=credits,videos`;
  const details =
    await fetchApi<z.infer<typeof TmdbDetailsResponseSchema>>(detailsUrl);
  const director =
    details.credits?.crew?.find((c) => c.job === "Director")?.name ?? null;
  const cast =
    details.credits?.cast?.slice(0, 15).map((c) => ({
      name: c.name,
      profilePath:
        c.profile_path ?
          `https://image.tmdb.org/t/p/w500${c.profile_path}`
        : null,
    })) ?? [];
  const videos =
    details.videos?.results?.slice(0, 3).map((v) => ({
      id: v.id,
      key: v.key,
      site: v.site,
      type: v.type,
      name: v.name,
    })) ?? [];
  return {
    id: details.id,
    title: details.title || details.name || "Untitled",
    overview: details.overview,
    genres: details.genres,
    runtime: details.runtime ?? details.episode_run_time?.[0],
    releaseDate: details.release_date || details.first_air_date,
    poster:
      details.poster_path ?
        `https://image.tmdb.org/t/p/w500${details.poster_path}`
      : null,
    backdrop:
      details.backdrop_path ?
        `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
      : null,
    director,
    cast,
    videos,
  };
}

export async function getTmdbPopularMovies() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY not configured");
  const movieUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
  const movieData = (await fetchApi(movieUrl)) as { results: any[] };
  const genreUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;
  const genreData = (await fetchApi(genreUrl)) as {
    genres: { id: number; name: string }[];
  };
  const genreMap = new Map(genreData.genres.map((g) => [g.id, g.name]));
  return movieData.results.map((movie) => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    releaseDate: movie.release_date,
    voteAverage: movie.vote_average,
    voteCount: movie.vote_count,
    popularity: movie.popularity,
    posterUrl:
      movie.poster_path ?
        `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    backdropUrl:
      movie.backdrop_path ?
        `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : null,
    genres: movie.genre_ids
      .map((id: number) => genreMap.get(id))
      .filter(Boolean),
  }));
}

export async function getTmdbPopularSeries() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY not configured");
  const seriesUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`;
  const seriesData = (await fetchApi(seriesUrl)) as { results: any[] };
  const genreUrl = `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=en-US`;
  const genreData = (await fetchApi(genreUrl)) as {
    genres: { id: number; name: string }[];
  };
  const genreMap = new Map(genreData.genres.map((g) => [g.id, g.name]));
  return seriesData.results.map((series) => ({
    id: series.id,
    name: series.name,
    overview: series.overview,
    firstAirDate: series.first_air_date,
    voteAverage: series.vote_average,
    voteCount: series.vote_count,
    popularity: series.popularity,
    posterUrl:
      series.poster_path ?
        `https://image.tmdb.org/t/p/w500${series.poster_path}`
      : null,
    backdropUrl:
      series.backdrop_path ?
        `https://image.tmdb.org/t/p/w1280${series.backdrop_path}`
      : null,
    genres: series.genre_ids
      .map((id: number) => genreMap.get(id))
      .filter(Boolean),
  }));
}

export async function batchInsert(
  table: any,
  data: any[],
  opts: { chunkSize?: number; concurrency?: number } = {}
) {
  const chunkSize = opts.chunkSize ?? 5000;
  const concurrency = opts.concurrency ?? 3;
  const db = getDb();
  if (data.length === 0) {
    return { inserted: 0, failed: 0 };
  }
  const chunks: any[][] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  let inserted = 0;
  let failed = 0;
  let index = 0;
  let error;

  const worker = async () => {
    while (index < chunks.length) {
      const currentIndex = index++;
      const chunk = chunks[currentIndex];
      try {
        await db.insert(table).values(chunk).onConflictDoNothing();
        inserted += chunk.length;
      } catch (e) {
        error = e;
        failed += chunk.length;
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, chunks.length) }, () => worker())
  );

  return { inserted, failed, error };
}
