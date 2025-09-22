import { Module } from "@nestjs/common";
import { CommonModule } from "src/common/common.module";
import { DatabaseModule } from "src/database/database.module";
import { PlaylistRouter } from "./playlists.router";
import { PlaylistService } from "./playlists.service";

@Module({
  imports: [DatabaseModule, CommonModule],
  providers: [PlaylistRouter, PlaylistService],
  exports: [],
})
export class PlaylistModule {}
