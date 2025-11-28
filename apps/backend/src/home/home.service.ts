import { Inject, Injectable } from '@nestjs/common';
import { ilike } from 'drizzle-orm';
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
  async globalSearch(query: string) {
    const [movieResults, seriesResults, channelsResults] = await Promise.all([
      await this.db
        .select()
        .from(movies)
        .where(ilike(movies.name, `%${query}%`))
        .execute(),
      await this.db
        .select()
        .from(series)
        .where(ilike(series.name, `%${query}%`))
        .execute(),
      await this.db
        .select()
        .from(channels)
        .where(ilike(channels.name, `%${query}%`))
        .execute(),
    ]);
    return {
      movies: movieResults.length > 0 ? movieResults : null,
      series: seriesResults.length > 0 ? seriesResults : null,
      channels: channelsResults.length > 0 ? channelsResults : null,
    };
  }
}
