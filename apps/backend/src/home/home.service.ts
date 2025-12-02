import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ilike } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { channels } from 'src/channels/schema';
import { CommonService } from 'src/common/common.service';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { movies } from 'src/movies/schema';
import { series } from 'src/series/schema';

@Injectable()
export class HomeService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase,
    private readonly common: CommonService,
  ) {}

  async getPopularMovies() {
    const movies = await this.common.getTmdbPopularMovies();
    const series = await this.common.getTmdbPopularSeries();

    return {
      movies: movies,
      series: series,
    };
  }
  async globalSearch(query: string, playlistId: number) {
    const [movieResults, seriesResults, channelsResults] = await Promise.all([
      await this.db
        .select()
        .from(movies)
        .where(
          and(
            ilike(movies.name, `%${query}%`),
            eq(movies.playlistId, playlistId),
          ),
        )
        .execute(),
      await this.db
        .select()
        .from(series)
        .where(
          and(
            ilike(series.name, `%${query}%`),
            eq(series.playlistId, playlistId),
          ),
        )
        .execute(),
      await this.db
        .select()
        .from(channels)
        .where(
          and(
            ilike(channels.name, `%${query}%`),
            eq(channels.playlistId, playlistId),
          ),
        )
        .execute(),
    ]);
    return {
      movies: movieResults.length > 0 ? movieResults : null,
      series: seriesResults.length > 0 ? seriesResults : null,
      channels: channelsResults.length > 0 ? channelsResults : null,
    };
  }
}
