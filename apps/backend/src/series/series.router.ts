import { Input, Mutation, Query, Router } from "nestjs-trpc";
import { SeriesService } from "./series.service";
import * as z from "zod";

@Router({ alias: "series" })
export class SeriesRouter {
  constructor(private readonly seriesService: SeriesService) {}
  // @Query({
  //   input: z.object({
  //     playlistId: z.number(),
  //     catrgoryId: z.number(),
  //   }),
  // })
  // async getseries(
  //   @Input("playlistId") playlistId: number,
  //   @Input("categoryId") categoryId: number
  // ) {
  //   return this.seriesService.getSeries(playlistId, categoryId);
  // }
  // @Query({
  //   input: z.object({
  //     url: z.string(),
  //     username: z.string(),
  //     password: z.string(),
  //     serieId: z.number(),
  //   }),
  // })
  // async getSerie(
  //   @Input("url") url: string,
  //   @Input("username") uername: string,
  //   @Input("password") password: string,
  //   @Input("serieId") movieId: number
  // ) {
  //   return this.seriesService.getSerie(url, uername, password, serieId);
  // }

  @Mutation({
    input: z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    }),
  })
  async createSerie(
    @Input("url") url: string,
    @Input("username") username: string,
    @Input("password") password: string,
    @Input("playlistId") playlistId: number
  ) {
    console.log("createSerie");

    return this.seriesService.createSerie(url, username, password, playlistId);
  }

  @Query()
  async getSeriesCategories() {}
  @Mutation({
    input: z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    }),
  })
  async createSeriesCategories(
    @Input("url") url: string,
    @Input("username") username: string,
    @Input("password") password: string,
    @Input("playlistId") playlistId: number
  ) {
    return this.seriesService.createSeriesCategories(
      url,
      username,
      password,
      playlistId
    );
  }
}
