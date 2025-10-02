import { Module } from "@nestjs/common";
import { CommonModule } from "src/common/common.module";
import { DatabaseModule } from "src/database/database.module";
import { ChannelsService } from "./channels.service";
import { ChannelsRouter } from "./channels.router";

@Module({
  imports: [DatabaseModule, CommonModule],
  providers: [ChannelsService, ChannelsRouter],
  exports: [ChannelsService],
})
export class ChannelsModule {}
