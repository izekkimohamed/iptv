import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from "nestjs-trpc";
import { PlaylistService } from "./playlists.service";
import { z } from "zod";
import { AuthMiddleware } from "src/auth/auth.middleware";
import type { UserSession } from "@mguay/nestjs-better-auth";
import { Xtream } from "@iptv/xtream-api";
import { zodPlaylistsSchema } from "./schema";

@Router({ alias: "playlists" })
@UseMiddlewares(AuthMiddleware)
export class PlaylistRouter {
  constructor(private readonly playlistService: PlaylistService) {}

  @Query({
    output: z.array(zodPlaylistsSchema),
  })
  async getPlaylists(@Ctx() context: UserSession) {
    console.log("Getting playlists");
    return await this.playlistService.getPlaylists(context.user.id);
  }

  @Mutation({
    input: z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
    }),

    output: z.object({
      id: z.number(),
      userId: z.string(),
      baseUrl: z.string(),
      username: z.string(),
      password: z.string(),
      status: z.string(),
      expDate: z.string(),
      isTrial: z.string(),
      createdAt: z.string(),
    }),
  })
  async createPlaylist(
    @Input("url") url: string,
    @Input("username") username: string,
    @Input("password") password: string,
    @Ctx() context: UserSession
  ) {
    console.log("Creating playlist");
    return this.playlistService.createPlaylist(
      url,
      username,
      password,
      context.user.id
    );
  }
  @Mutation({
    input: z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    }),
  })
  async updatePlaylists(
    @Input("url") url: string,
    @Input("username") username: string,
    @Input("password") password: string,
    @Input("playlistId") playlistId: number
  ) {
    return this.playlistService.updatePlaylists(
      url,
      username,
      password,
      playlistId
    );
  }
}
