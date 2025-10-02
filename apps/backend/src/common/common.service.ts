import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Xtream } from "@iptv/xtream-api";
import { DATABASE_CONNECTION } from "src/database/database-connection";
import { z } from "zod";

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
  genres: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .optional(),
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

// Export types if you want to extract them from the schemas
export type TmdbCast = z.infer<typeof TmdbCastSchema>;
export type TmdbCrew = z.infer<typeof TmdbCrewSchema>;
export type TmdbCredits = z.infer<typeof TmdbCreditsSchema>;
export type TmdbVideo = z.infer<typeof TmdbVideoSchema>;
export type TmdbDetailsResponse = z.infer<typeof TmdbDetailsResponseSchema>;

// Export the schemas
export {
  TmdbCastSchema,
  TmdbCrewSchema,
  TmdbCreditsSchema,
  TmdbVideoSchema,
  TmdbDetailsResponseSchema,
};

@Injectable()
export class CommonService {
  private readonly tmdbApiKey: string | undefined;
  private readonly tmdbBaseUrl = "https://api.themoviedb.org/3";

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase,
    private readonly configService: ConfigService // inject ConfigService
  ) {
    this.tmdbApiKey = this.configService.get<string>("TMDB_API_KEY");
  }

  async fetchApi<T>(url: string): Promise<T> {
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Request failed: ${res.status}`);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await res.json();

    return data as T;
  }

  async batchInsert<T>(
    table: any,
    data: T[],
    chunkSize = 500,
    concurrency = 3
  ) {
    const chunks: T[][] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }

    const results: T[][] = [];
    let index = 0;

    // Helper function to process a chunk
    const insertChunk = async () => {
      while (index < chunks.length) {
        const currentIndex = index;
        index++;
        const chunk = chunks[currentIndex];
        try {
          await this.database.insert(table).values(chunk).onConflictDoNothing(); // don't use returning() for big batches
          results.push(chunk);
        } catch (err) {
          console.error("Batch insert error:", err);
        }
      }
    };

    // Start limited number of parallel insert "workers"
    await Promise.all(Array.from({ length: concurrency }, () => insertChunk()));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      success: true,
      message: `${data.length} Inserted  successfully.`,
    };
  }
  async getTmdbInfo(
    type: "movie" | "show",
    tmdbId?: number,
    name?: string,
    year?: number
  ): Promise<{
    id: number;
    title: string;
    overview?: string;
    genres?: { id: number; name: string }[];
    runtime?: number;
    releaseDate?: string;
    poster?: string | null;
    backdrop?: string | null;
    director?: string | null;
    cast: { name: string; profilePath: string | null }[];
    videos: TmdbVideo[];
  } | null> {
    try {
      if (!this.tmdbApiKey) {
        throw new Error("TMDB_API_KEY not configured");
      }

      const endpoint = type === "movie" ? "movie" : "tv";

      let id = tmdbId;
      if (!id && name) {
        const query = name.replace(/[^|]*\|/g, "");
        const yearParam =
          type === "movie" && year ? `&year=${year}`
          : type === "show" && year ? `&first_air_date_year=${year}`
          : "";
        const searchUrl = `${this.tmdbBaseUrl}/search/${endpoint}?api_key=${this.tmdbApiKey}&language=en-US&query=${query}${yearParam}`;
        const searchRes = await this.fetchApi<{ results: { id: number }[] }>(
          searchUrl
        );
        if (!searchRes.results.length) return null;
        id = searchRes.results[0].id;
      }

      if (!id) return null;

      const detailsUrl = `${this.tmdbBaseUrl}/${endpoint}/${id}?api_key=${this.tmdbApiKey}&language=en-US&append_to_response=credits,videos`;
      const details = await this.fetchApi<TmdbDetailsResponse>(detailsUrl);

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
    } catch (err) {
      throw new InternalServerErrorException(`TMDB fetch failed: ${err}`);
    }
  }

  xtream(url: string, username: string, password: string): Xtream {
    return new Xtream({
      url,
      username,
      password,
      preferredFormat: "m3u8",
    });
  }
}
