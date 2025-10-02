import { XtreamMoviesListing } from "@iptv/xtream-api";
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { CommonService } from "../common/common.service";
import { DATABASE_CONNECTION } from "../database/database-connection";
import { movies } from "./schema";
import { categories } from "../playlist/schema";
import { and, eq, sql } from "drizzle-orm";

@Injectable()
export class MoviesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase,
    private readonly common: CommonService
  ) {}

  async getMovies(playlistId: number, categoryId: number) {
    return await this.database
      .select()
      .from(movies)
      .where(
        and(
          eq(movies.playlistId, playlistId),
          eq(movies.categoryId, categoryId)
        )
      );
  }
  async getMovie(
    url: string,
    username: string,
    password: string,
    movieId: number
  ) {
    const xtream = this.common.xtream(url, username, password);
    const res = await fetch(
      `${url}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${movieId}`
    );
    const data = await res.json();
    if (!data) {
      throw new InternalServerErrorException(
        `Failed to get movie details from Xtream API: ${data.message}`
      );
    }
    const details = await this.common.getTmdbInfo(
      "movie",
      data.info.tmdb_id,
      data.movie_data.name,
      new Date(data.info.releasedate).getFullYear()
    );

    return {
      ...data,
      ...details,
    };
  }

  async createMovie(
    url: string,
    username: string,
    password: string,
    playlistId: number
  ) {
    const xtream = this.common.xtream(url, username, password);
    const moviesData = await xtream.getMovies();

    // check how many unique category ids there are in channels
    const uniqueCategoryIds = new Set<number>();
    moviesData.forEach((movie) => {
      if (movie.category_id) {
        uniqueCategoryIds.add(Number(movie.category_id));
      }
    });
    //now get the channelsCategories from the the db and list the ids that are not in the db
    const existingCategories = await this.database
      .select({
        selected: categories.categoryId,
      })
      .from(categories);
    const missingCategoryIds = Array.from(uniqueCategoryIds).filter(
      (id) => !existingCategories.map((cat) => cat.selected).includes(id)
    );
    //create the missing categories in the db
    if (missingCategoryIds.length > 0) {
      const newCategories: (typeof categories.$inferInsert)[] =
        missingCategoryIds.map((id) => ({
          playlistId: playlistId,
          type: "movies",
          categoryName: `category ${id}`,
          categoryId: id,
        }));
      await this.database.insert(categories).values(newCategories);
    }

    const moviesChunk: (typeof movies.$inferInsert)[] = moviesData.map(
      (movie) => ({
        streamId: movie.stream_id,
        name: movie.name,
        streamType: "movie",
        streamIcon: movie.stream_icon || "",
        rating: movie.rating?.toString() ?? "0",
        added: movie.added,
        categoryId: +movie.category_id,
        playlistId: playlistId,
        containerExtension: movie.container_extension,
        url: movie.url || "",
      })
    );

    return await this.common.batchInsert(movies, moviesChunk);
  }

  async getMovieCategories(playlistId: number) {
    return await this.database
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.playlistId, playlistId),
          eq(categories.type, "movies")
        )
      );
  }
  async createMovieCategory(
    url: string,
    username: string,
    password: string,
    playlist: number
  ) {
    const xtream = this.common.xtream(url, username, password);
    const data = await xtream.getMovieCategories();
    const tempCategories: (typeof categories.$inferInsert)[] = data.map(
      (category) => ({
        playlistId: playlist,
        type: "movies",
        categoryName: category.category_name,
        categoryId: +category.category_id,
      })
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
      return await this.common.getTmdbInfo("movie", tmdbId);
    } else {
      return await this.common.getTmdbInfo("movie", undefined, name, year);
    }
  }
}
