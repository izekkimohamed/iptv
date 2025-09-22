import { Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import { AuthMiddleware } from "src/auth/auth.middleware";
import * as z from "zod";
import { ChannelsService } from "./channels.service";
import { zodCategoriesSchema } from "src/playlist/schema";
import { zodChannelsList } from "./schema";

@Router({ alias: "channels" })
@UseMiddlewares(AuthMiddleware)
export class ChannelsRouter {
  constructor(private readonly channelsService: ChannelsService) {}

  @Query({
    input: z.object({
      playlistId: z.number(),
      categoryId: z.number().optional(),
    }),
    output: zodChannelsList,
  })
  async getChannels(
    @Input("playlistId") playlistId: number,
    @Input("categoryId") categoryId: number
  ) {
    return await this.channelsService.getChannels(playlistId, categoryId);
  }

  @Query({
    input: z.object({
      playlistId: z.number(),
    }),
    output: z.array(zodCategoriesSchema),
  })
  async getCategories(@Input("playlistId") playlistId: number) {
    return await this.channelsService.getChannelsCategories(playlistId);
  }

  @Mutation({
    input: z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    }),
  })
  async createChannels(
    @Input("url") url: string,
    @Input("username") username: string,
    @Input("password") password: string,
    @Input("playlistId") playlistId: number
  ) {
    return await this.channelsService.createChannels(
      url,
      username,
      password,
      playlistId
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
  async createChannelsCategories(
    @Input("url") url: string,
    @Input("username") username: string,
    @Input("password") password: string,
    @Input("playlistId") playlistId: number
  ) {
    console.log("Creating categories");
    return this.channelsService.createChannelsCategories(
      url,
      username,
      password,
      playlistId
    );
  }
}
