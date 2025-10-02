import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { CommonService } from "src/common/common.service";
import { DATABASE_CONNECTION } from "src/database/database-connection";
import { playlists } from "./schema";
import { ChannelsService } from "src/channels/channels.service";
import { MoviesService } from "src/movies/movies.service";
import { SeriesService } from "src/series/series.service";

@Injectable()
export class PlaylistService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase,
    private readonly common: CommonService,
    private readonly channelsService: ChannelsService,
    private readonly moviesService: MoviesService,
    private readonly seriesService: SeriesService
  ) {}

  async createPlaylist(
    url: string,
    username: string,
    password: string,
    userId: string
  ) {
    const xtream = this.common.xtream(url, username, password);
    const data = await xtream.getProfile();
    if (!data) {
      throw new InternalServerErrorException(
        "Failed to get profile from xtream"
      );
    }
    const playlist = await this.database
      .insert(playlists)
      .values({
        baseUrl: url,
        expDate: data.exp_date,
        isTrial: data.is_trial,
        password: data.password,
        username: data.username,
        status: data.status,
        userId,
        createdAt: new Date().toISOString(),
      })
      .onConflictDoNothing()
      .returning();
    return {
      ...playlist[0],
    };
  }
  async updatePlaylists(
    url: string,
    username: string,
    password: string,
    playlistId: number
  ) {
    return Promise.all([
      await this.channelsService.createChannelsCategories(
        url,
        username,
        password,
        playlistId
      ),
      await this.moviesService.createMovieCategory(
        url,
        username,
        password,
        playlistId
      ),
      await this.seriesService.createSeriesCategories(
        url,
        username,
        password,
        playlistId
      ),
      await this.channelsService.createChannels(
        url,
        username,
        password,
        playlistId
      ),
      await this.moviesService.createMovie(url, username, password, playlistId),
      await this.seriesService.createSerie(url, username, password, playlistId),
    ]);
  }
  async getPlaylists(userId: string) {
    const data = await this.database
      .select()
      .from(playlists)
      .where(eq(playlists.userId, userId));

    return data;
  }
}
