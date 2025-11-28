import { Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AppContext } from './app.context';
import { PlaylistModule } from './playlist/playlists.module';
import { PlaylistService } from './playlist/playlists.service';

import { CommonModule } from './common/common.module';
import { ChannelsModule } from './channels/channels.module';
import { MoviesModule } from './movies/movies.module';
import { SeriesModule } from './series/series.module';
import { HomeModule } from './home/home.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TRPCModule.forRoot({
      autoSchemaFile: '../../packages/trpc/src/server',
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
