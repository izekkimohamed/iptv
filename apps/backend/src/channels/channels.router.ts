import { Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import * as z from "zod";
import { ChannelsService } from "./channels.service";
import { zodCategoriesSchema } from "../playlist/schema";
import { zodChannelsList } from "./schema";

@Router({ alias: "channels" })
export class ChannelsRouter {
  constructor(private readonly channelsService: ChannelsService) {}

  @Query({
    input: z.object({
      playlistId: z.number(),
      categoryId: z.number().optional(),
      favorites: z.boolean().optional(),
    }),
    output: zodChannelsList,
  })
  async getChannels(
    @Input("categoryId") categoryId: number,
    @Input("favorites") favorites: boolean,
    @Input("playlistId") playlistId: number
  ) {
    return await this.channelsService.getChannels(
      playlistId,
      categoryId,
      favorites
    );
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

  @Query({
    input: z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      channelId: z.number(),
    }),
    // output: z.array(
    //   z.object({
    //     id: z.string(),
    //     epg_id: z.string(),
    //     title: z.string(),
    //     lang: z.string(),
    //     channel_id: z.string(),
    //     description: z.string(),
    //     start: z.string(),
    //     end: z.string(),
    //     start_timestamp: z.string(),
    //     stop_timestamp: z.string(),
    //   })
    // ),
  })
  async getShortEpg(
    @Input("url") url: string,
    @Input("username") username: string,
    @Input("password") password: string,
    @Input("channelId") channelId: number
  ) {
    return await this.channelsService.getShortEpg(
      url,
      username,
      password,
      channelId
    );
  }

  @Mutation({
    input: z.object({
      channelsId: z.number(),
      isFavorite: z.boolean(),
    }),
  })
  async toggleFavorite(
    @Input("channelsId") channelsId: number,
    @Input("isFavorite") isFavorite: boolean
  ) {
    return await this.channelsService.toggleFavorite(channelsId, isFavorite);
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
    return this.channelsService.createChannelsCategories(
      url,
      username,
      password,
      playlistId
    );
  }
}
