import { Module } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { MoviesRouter } from "./movies.router";
import { DatabaseModule } from "src/database/database.module";
import { CommonModule } from "src/common/common.module";

@Module({
  imports: [DatabaseModule, CommonModule],
  providers: [MoviesService, MoviesRouter],
  exports: [MoviesService],
})
export class MoviesModule {}
