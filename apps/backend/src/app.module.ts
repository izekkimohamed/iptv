import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { TRPCModule } from "nestjs-trpc";
import { AppConfigModule } from "./config/config.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { AppContext } from "./app.context";
import { AuthService } from "@mguay/nestjs-better-auth";

import { PlaylistModule } from "./playlist/playlists.module";
import { PlaylistService } from "./playlist/playlists.service";

import { AuthMiddleware } from "./auth/auth.middleware";
import { CommonModule } from "./common/common.module";
import { ChannelsModule } from "./channels/channels.module";
import { MoviesModule } from "./movies/movies.module";
import { SeriesModule } from "./series/series.module";

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local"],
    }),
    TRPCModule.forRoot({
      autoSchemaFile: "../../packages/trpc/src/server",
      context: AppContext,
    }),
    PlaylistModule,
    DatabaseModule,
    CommonModule,
    ChannelsModule,
    MoviesModule,
    SeriesModule,
  ],

  providers: [
    AppContext,
    PlaylistService,
    AuthService,
    AuthMiddleware, // 👈 make Better Auth service injectable
  ],
})
export class AppModule {}
