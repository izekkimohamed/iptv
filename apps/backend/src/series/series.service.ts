import { XtreamShowInfo, XtreamShowListing } from "@iptv/xtream-api";
import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { CommonService } from "src/common/common.service";
import { DATABASE_CONNECTION } from "src/database/database-connection";
import { categories } from "src/playlist/schema";
import { series } from "./schema";

@Injectable()
export class SeriesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase,
    private readonly common: CommonService
  ) {}

  async getSeriesCategories(playlistId: number) {
    return await this.database
      .select()
      .from(categories)

      .where(
        and(
          eq(categories.playlistId, playlistId),
          eq(categories.type, "series")
        )
      )
      .orderBy(asc(categories.id));
  }

  async getSeries(playlistId: number, categoryId: number) {
    return await this.database
      .select()
      .from(series)
      .where(
        and(
          eq(series.playlistId, playlistId),
          eq(series.categoryId, categoryId)
        )
      )
      .orderBy(asc(series.id));
  }
  async getSerie(
    url: string,
    username: string,
    password: string,
    serieId: number
  ) {
    const res = await fetch(
      `${url}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${serieId}`
    );
    const data = await res.json();
    if (!data) {
      throw new Error(
        `Failed to get serie details from Xtream API: ${data.message}`
      );
    }
    const seasons = Object.keys(data.episodes).map((season) => Number(season));
    data.seasons = seasons;
    // fetch tmdb details
    const details = await this.common.getTmdbInfo(
      "show",
      data.info.tmdb_id,
      data.info.name,
      new Date(data.info.first_aired).getFullYear()
    );
    return { ...data, tmdb: details };
  }
  async createSerie(
    url: string,
    username: string,
    password: string,
    playlistId: number
  ) {
    const xtream = this.common.xtream(url, username, password);
    const seriesData = await xtream.getShows();

    // check how many unique category ids there are in channels
    const uniqueCategoryIds = new Set<number>();
    seriesData.forEach((serie) => {
      if (serie.category_id) {
        uniqueCategoryIds.add(Number(serie.category_id));
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
          type: "series",
          categoryName: `category ${id}`,
          categoryId: id,
        }));
      await this.database.insert(categories).values(newCategories);
    }
    const seriesChunk: (typeof series.$inferInsert)[] = seriesData.map(
      (serie) => ({
        seriesId: serie.series_id,
        name: serie.name ?? "",
        cast: serie.cast ?? "",
        director: serie.director ?? "",
        genre: serie.genre ?? "",
        releaseDate: serie.release_date ?? "",
        lastModified: serie.last_modified ?? "",
        rating: serie.rating?.toString() ?? "0",
        backdropPath:
          Array.isArray(serie.backdrop_path) ? serie.backdrop_path[0] : "",
        youtubeTrailer: serie.youtube_trailer ?? "",
        episodeRunTime: serie.episode_run_time ?? "",
        categoryId: +serie.category_id,
        playlistId,
        cover: serie.cover ?? "",
        plot: serie.plot ?? "",
        genere: serie.genre ?? "",
      })
    );

    await this.common.batchInsert(series, seriesChunk, {
      chunkSize: 3000,
      concurrency: 5,
      onProgress: (progress) => {
        console.log(`${progress.percent}% complete`);
      },
    });
  }

  async createSeriesCategories(
    url: string,
    username: string,
    password: string,
    playlist: number
  ) {
    const xtream = this.common.xtream(url, username, password);
    const data = await xtream.getShowCategories();
    const tempCategories: (typeof categories.$inferInsert)[] = data.map(
      (category) => ({
        playlistId: playlist,
        type: "series",
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
      })
      .catch((error) => {
        return {
          success: false,
          message: error.message,
          data: [],
        };
      });
  }
}
