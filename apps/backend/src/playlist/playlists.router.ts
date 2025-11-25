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
import { zodPlaylistsSchema } from "./schema";

@Router({ alias: "playlists" })
export class PlaylistRouter {
  constructor(private readonly playlistService: PlaylistService) {}

  @Query({
    output: z.array(zodPlaylistsSchema),
  })
  async getPlaylists() {
    console.log("Getting playlists");
    return await this.playlistService.getPlaylists();
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
    @Input("password") password: string
  ) {
    console.log("Creating playlist");
    return this.playlistService.createPlaylist(url, username, password);
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
  @Mutation({
    input: z.object({
      playlistId: z.number(),
    }),
    output: z.object({
      success: z.string(),
    }),
  })
  async deletePlaylist(@Input("playlistId") playlistId: number) {
    console.log("Deleting playlist");
    return this.playlistService.deletePlaylist(playlistId);
  }
}
