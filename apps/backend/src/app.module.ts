import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TRPCModule } from 'nestjs-trpc';
import { AppContext } from './app.context';
import { DatabaseModule } from './database/database.module';
import { PlaylistModule } from './playlist/playlists.module';
import { PlaylistService } from './playlist/playlists.service';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChannelsModule } from './channels/channels.module';
import { CommonModule } from './common/common.module';
import { HomeModule } from './home/home.module';
import { MoviesModule } from './movies/movies.module';
import { SeriesModule } from './series/series.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TRPCModule.forRoot({
      autoSchemaFile: '../../../packages/trpc/src/server',
      context: AppContext,
    }),
    PlaylistModule,
    DatabaseModule,
    CommonModule,
    ChannelsModule,
    MoviesModule,
    SeriesModule,
    HomeModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppContext, PlaylistService],
})
export class AppModule {}
