import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { DatabaseModule } from '../database/database.module';
import { HomeRouter } from './home.router';
import { HomeService } from './home.service';
import { ChannelsModule } from '../channels/channels.module';
import { MoviesModule } from '../movies/movies.module';
import { SeriesModule } from '../series/series.module';

@Module({
  imports: [
    DatabaseModule,
    CommonModule,
    ChannelsModule,
    MoviesModule,
    SeriesModule,
  ],
  providers: [HomeRouter, HomeService],
  exports: [],
})
export class HomeModule {}
