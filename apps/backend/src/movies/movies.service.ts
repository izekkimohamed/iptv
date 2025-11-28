import { XtreamMoviesListing } from '@iptv/xtream-api';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CommonService } from '../common/common.service';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { movies } from './schema';
import { categories } from '../playlist/schema';
import { and, asc, eq, sql } from 'drizzle-orm';

const importJobs = new Map<
  string,
  {
    status: 'processing' | 'completed' | 'failed';
    progress: number;
    total: number;
    inserted: number;
    failed: number;
    error?: string;
  }
>();

@Injectable()
export class MoviesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase,
    private readonly common: CommonService,
  ) {}

  async createMovie(
    url: string,
    username: string,
    password: string,
    playlistId: number,
  ) {
    const jobId = `movie-${playlistId}-${Date.now()}`;

    // Initialize job
    importJobs.set(jobId, {
      status: 'processing',
      progress: 0,
      total: 0,
      inserted: 0,
      failed: 0,
    });

    // Start import in background
    this.importMovies(url, username, password, playlistId, jobId).catch(
      (err) => {
        const job = importJobs.get(jobId);
        if (job) {
          job.status = 'failed';
          job.error = err.message;
        }
        console.error('Movie import failed:', err);
      },
    );

    // Return job ID for polling
    return {
      success: true,
      jobId,
      message: 'Movie import started',
    };
  }

  async checkImportStatus(jobId: string) {
    const job = importJobs.get(jobId);

    if (!job) {
      return {
        success: false,
        message: 'Job not found',
      };
    }

    return {
      success: true,
      ...job,
    };
  }

  private async importMovies(
    url: string,
    username: string,
    password: string,
    playlistId: number,
    jobId: string,
  ) {
    const job = importJobs.get(jobId)!;

    try {
      const xtream = this.common.xtream(url, username, password);
      const moviesData = await xtream.getMovies();

      job.total = moviesData.length;
      job.progress = 10;

      // Collect categories and transform data in one loop
      const categoryMap = new Map<number, boolean>();
      const moviesChunk: (typeof movies.$inferInsert)[] = [];

      for (const movie of moviesData) {
        const categoryId = movie.category_id ? Number(movie.category_id) : 0;

        if (categoryId) {
          categoryMap.set(categoryId, true);
        }

        moviesChunk.push({
          streamId: movie.stream_id,
          name: movie.name,
          streamType: 'movie',
          streamIcon: movie.stream_icon || '',
          rating: movie.rating?.toString() ?? '0',
          added: movie.added,
          categoryId: categoryId,
          playlistId: playlistId,
          containerExtension: movie.container_extension,
          url: movie.url || '',
        });
      }

      job.progress = 20;

      // Handle categories
      const uniqueCategoryIds = Array.from(categoryMap.keys());

      if (uniqueCategoryIds.length > 0) {
        const existingCategories = await this.database
          .select({ categoryId: categories.categoryId })
          .from(categories)
          .where(sql`${categories.categoryId} = ANY(${uniqueCategoryIds})`);

        const existingSet = new Set(
          existingCategories.map((c) => c.categoryId),
        );
        const missingIds = uniqueCategoryIds.filter(
          (id) => !existingSet.has(id),
        );

        if (missingIds.length > 0) {
          const newCategories = missingIds.map((id) => ({
            playlistId: playlistId,
            type: 'movies' as const,
            categoryName: `category ${id}`,
            categoryId: id,
          })) as (typeof categories.$inferInsert)[];

          await this.database
            .insert(categories)
            .values(newCategories)
            .onConflictDoNothing();
        }
      }

      job.progress = 30;

      // Insert movies with progress tracking
      const result = await this.common.batchInsert(movies, moviesChunk, {
        chunkSize: 5000,
        concurrency: 5,
        onConflict: 'nothing',
        onProgress: (progress) => {
          job.progress = 30 + Math.floor((progress.percent / 100) * 70);
          job.inserted = progress.inserted;
          job.failed = progress.failed;
        },
      });

      // Mark as completed
      job.status = 'completed';
      job.progress = 100;
      job.inserted = result.inserted;
      job.failed = result.failed;

      // Clean up after 5 minutes
      setTimeout(() => {
        importJobs.delete(jobId);
      }, 300000);
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  async getMovies(playlistId: number, categoryId: number) {
    return await this.database
      .select()
      .from(movies)
      .where(
        and(
          eq(movies.playlistId, playlistId),
          eq(movies.categoryId, categoryId),
        ),
      )
      .orderBy(asc(movies.id));
  }
  async getMovie(
    url: string,
    username: string,
    password: string,
    movieId: number,
  ) {
    const res = await fetch(
      `${url}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${movieId}`,
    );
    const data = await res.json();
    if (!data) {
      throw new InternalServerErrorException(
        `Failed to get movie details from Xtream API: ${data.message}`,
      );
    }
    const details = await this.common.getTmdbInfo(
      'movie',
      data.info.tmdb_id,
      data.movie_data.name,
      new Date(data.info.releasedate).getFullYear(),
    );

    return {
      ...data,
      tmdb: details,
    };
  }

  async getMovieCategories(playlistId: number) {
    return await this.database
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.playlistId, playlistId),
          eq(categories.type, 'movies'),
        ),
      )
      .orderBy(asc(categories.id));
  }
  async createMovieCategory(
    url: string,
    username: string,
    password: string,
    playlist: number,
  ) {
    const xtream = this.common.xtream(url, username, password);
    const data = await xtream.getMovieCategories();
    const tempCategories: (typeof categories.$inferInsert)[] = data.map(
      (category) => ({
        playlistId: playlist,
        type: 'movies',
        categoryName: category.category_name,
        categoryId: +category.category_id,
      }),
    );
    if (!tempCategories.length) return [];
    return await this.database
      .insert(categories)
      .values(tempCategories)
      .onConflictDoUpdate({
        target: [categories.categoryId, categories.playlistId],
        set: {
          categoryName: sql`excluded.category_name`,
          type: sql`excluded.type`,
        },
      });
  }

  async getMovieDetails(tmdbId?: number, name?: string, year?: number) {
    if (tmdbId !== undefined) {
      return await this.common.getTmdbInfo('movie', tmdbId);
    } else {
      return await this.common.getTmdbInfo('movie', undefined, name, year);
    }
  }
}
