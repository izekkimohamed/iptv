import { Module } from "@nestjs/common";
import { CommonModule } from "src/common/common.module";
import { DatabaseModule } from "src/database/database.module";
import { PlaylistRouter } from "./router";
import { PlaylistService } from "./service";

@Module({
  imports: [DatabaseModule, CommonModule],
  providers: [PlaylistRouter, PlaylistService],
  exports: [],
})
export class PlaylistModule {}
