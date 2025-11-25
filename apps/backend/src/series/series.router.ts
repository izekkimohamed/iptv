import { Input, Mutation, Query, Router } from "nestjs-trpc";
import { SeriesService } from "./series.service";
import * as z from "zod";
import { zodseriesList } from "./schema";

@Router({ alias: "series" })
export class SeriesRouter {
  constructor(private readonly seriesService: SeriesService) {}
  @Query({
    input: z.object({
      playlistId: z.number(),
      categoryId: z.number(),
    }),
    output: zodseriesList,
  })
  async getseries(
    @Input("playlistId") playlistId: number,
    @Input("categoryId") categoryId: number
  ) {
    console.log("series");

    return this.seriesService.getSeries(playlistId, categoryId);
  }
  @Query({
    input: z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      serieId: z.number(),
    }),
  })
  async getSerie(
    @Input("url") url: string,
    @Input("username") username: string,
    @Input("password") password: string,
    @Input("serieId") serieId: number
  ) {
    return this.seriesService.getSerie(url, username, password, serieId);
  }

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

  @Query({
    input: z.object({
      playlistId: z.number(),
    }),
  })
  async getSeriesCategories(@Input("playlistId") playlistId: number) {
    return this.seriesService.getSeriesCategories(playlistId);
  }

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
