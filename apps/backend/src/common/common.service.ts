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
import { sql } from "drizzle-orm";

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

  async batchInsert<T extends Record<string, any>>(
    table: any,
    data: T[],
    options: {
      chunkSize?: number;
      concurrency?: number;
      onConflict?: "nothing" | "update";
      conflictTarget?: string[];
      updateColumns?: string[];
      onProgress?: (progress: {
        inserted: number;
        failed: number;
        total: number;
        percent: number;
      }) => void;
    } = {}
  ) {
    const {
      chunkSize = 5000, // Reduced from 8000 for better memory management
      concurrency = 3, // Increased default for better parallelism
      onConflict = "nothing",
      conflictTarget = [],
      updateColumns = [],
      onProgress,
    } = options;

    // Early return for empty data
    if (data.length === 0) {
      return {
        success: true,
        inserted: 0,
        failed: 0,
        total: 0,
        message: "No data to insert.",
      };
    }

    // Split data into chunks
    const chunks: T[][] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }

    console.log(
      `Starting batch insert: ${data.length} records in ${chunks.length} chunks (concurrency: ${concurrency})`
    );

    let index = 0;
    let insertedCount = 0;
    let failedCount = 0;
    const failedChunks: Array<{
      chunkIndex: number;
      error: string;
      data: T[];
    }> = [];

    // Use mutex for thread-safe counter updates
    const updateProgress = () => {
      if (onProgress) {
        const total = data.length;
        const processed = insertedCount + failedCount;
        const percent = Math.round((processed / total) * 100);
        onProgress({
          inserted: insertedCount,
          failed: failedCount,
          total,
          percent,
        });
      }
    };

    // Process a single chunk with retry logic
    const insertChunk = async (
      chunk: T[],
      chunkIndex: number,
      retryCount = 0
    ): Promise<boolean> => {
      const maxRetries = 2;

      try {
        await this.database.transaction(async (tx) => {
          let query: any = tx.insert(table).values(chunk);

          if (onConflict === "nothing") {
            query = query.onConflictDoNothing();
          } else if (onConflict === "update" && conflictTarget.length > 0) {
            // Build update object dynamically
            const updateSet: Record<string, any> = {};
            const columnsToUpdate =
              updateColumns.length > 0 ? updateColumns : Object.keys(chunk[0]);

            columnsToUpdate.forEach((col) => {
              updateSet[col] = sql`excluded.${sql.identifier(col)}`;
            });

            query = query.onConflictDoUpdate({
              target: conflictTarget,
              set: updateSet,
            });
          }

          await query;
        });

        insertedCount += chunk.length;
        updateProgress();
        return true;
      } catch (err) {
        if (retryCount < maxRetries) {
          console.warn(
            `Chunk ${chunkIndex} failed, retrying (${retryCount + 1}/${maxRetries})...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (retryCount + 1))
          ); // Exponential backoff
          return insertChunk(chunk, chunkIndex, retryCount + 1);
        }

        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(
          `Chunk ${chunkIndex} failed after ${maxRetries} retries:`,
          errorMessage
        );

        failedCount += chunk.length;
        failedChunks.push({
          chunkIndex,
          error: errorMessage,
          data: chunk,
        });
        updateProgress();
        return false;
      }
    };

    // Worker function to process chunks concurrently
    const worker = async () => {
      while (index < chunks.length) {
        const currentIndex = index++;
        const chunk = chunks[currentIndex];

        await insertChunk(chunk, currentIndex);

        // Log progress every 10 chunks
        if ((currentIndex + 1) % 10 === 0) {
          console.log(
            `Progress: ${currentIndex + 1}/${chunks.length} chunks processed`
          );
        }
      }
    };

    // Start time tracking
    const startTime = Date.now();

    // Execute workers in parallel
    await Promise.all(
      Array.from({ length: Math.min(concurrency, chunks.length) }, () =>
        worker()
      )
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const recordsPerSecond = Math.round(insertedCount / parseFloat(duration));

    console.log(
      `Batch insert completed in ${duration}s (${recordsPerSecond} records/sec)`
    );
    console.log(`Results: ${insertedCount} inserted, ${failedCount} failed`);

    return {
      success: failedCount === 0,
      inserted: insertedCount,
      failed: failedCount,
      total: data.length,
      duration: parseFloat(duration),
      recordsPerSecond,
      message:
        failedCount === 0 ?
          `${insertedCount} records inserted successfully in ${duration}s.`
        : `${insertedCount} records inserted, ${failedCount} failed. Check failedChunks for details.`,
      failedChunks: failedChunks.length > 0 ? failedChunks : undefined,
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
    if (!tmdbId && !name) return null;
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
