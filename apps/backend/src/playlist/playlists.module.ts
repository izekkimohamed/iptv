import { Module } from "@nestjs/common";
import { CommonModule } from "src/common/common.module";
import { DatabaseModule } from "src/database/database.module";
import { PlaylistRouter } from "./playlists.router";
import { PlaylistService } from "./playlists.service";
import { ChannelsModule } from "src/channels/channels.module";
import { MoviesModule } from "src/movies/movies.module";
import { SeriesModule } from "src/series/series.module";

@Module({
  imports: [
    DatabaseModule,
    CommonModule,
    ChannelsModule,
    MoviesModule,
    SeriesModule,
  ],
  providers: [PlaylistRouter, PlaylistService],
  exports: [],
})
export class PlaylistModule {}
