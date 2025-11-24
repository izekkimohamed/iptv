import { Input, Mutation, Query, Router } from "nestjs-trpc";
import { MoviesService } from "./movies.service";
import * as z from "zod";
import { zodCategoriesSchema } from "../playlist/schema";
import { MovieOutputSchema, zodMoviesList } from "./schema";

@Router({ alias: "movies" })
export class MoviesRouter {
  constructor(private readonly moviesService: MoviesService) {}
  @Query({
    input: z.object({
      playlistId: z.number(),
      categoryId: z.number(),
    }),
    output: zodMoviesList,
  })
  async getMovies(
    @Input("playlistId") playlistId: number,
    @Input("categoryId") categoryId: number
  ) {
    return this.moviesService.getMovies(playlistId, categoryId);
  }

  @Query({
    input: z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      movieId: z.number(),
    }),
    // output: MovieOutputSchema,
  })
  async getMovie(
    @Input("url") url: string,
    @Input("username") uername: string,
    @Input("password") password: string,
    @Input("movieId") movieId: number
  ) {
    return this.moviesService.getMovie(url, uername, password, movieId);
  }
  @Query({
    input: z.object({
      tmdbId: z.number().nullable(),
      name: z.string().nullable(),
      year: z.number().nullable(),
    }),
    // output: z.object({
    //   id: z.number(),
    //   title: z.string(),
    //   overview: z.string(),
    //   genres: z.array(
    //     z.object({
    //       id: z.number(),
    //       name: z.string(),
    //     })
    //   ),
    //   runtime: z.number(),
    //   releaseDate: z.string(),
    //   poster: z.string().nullable(),
    //   backdrop: z.string().nullable(),
    //   director: z.string(),
    //   cast: z.array(
    //     z.object({
    //       name: z.string(),
    //       profilePath: z.string().nullable(),
    //     })
    //   ),
    //   videos: z.array(
    //     z.object({
    //       id: z.string(),
    //       key: z.string(),
    //       site: z.string(),
    //       type: z.string(),
    //       name: z.string(),
    //     })
    //   ),
    // }),
  })
  async getMovieDetails(
    @Input("tmdbId") tmdbId?: number,
    @Input("name") name?: string,
    @Input("year") year?: number
  ) {
    return this.moviesService.getMovieDetails(tmdbId, name, year);
  }

  @Mutation({
    input: z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    }),
  })
  async createMovie(
    @Input("url") url: string,
    @Input("username") username: string,
    @Input("password") password: string,
    @Input("playlistId") playlistId: number
  ) {
    return this.moviesService.createMovie(url, username, password, playlistId);
  }

  @Query({
    input: z.object({
      playlistId: z.number(),
    }),
    output: z.array(zodCategoriesSchema),
  })
  async getMoviesCategories(@Input("playlistId") playlistId: number) {
    return this.moviesService.getMovieCategories(playlistId);
  }
  @Mutation({
    input: z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    }),
  })
  async createMoviesCategories(
    @Input("url") url: string,
    @Input("username") username: string,
    @Input("password") password: string,
    @Input("playlistId") playlistId: number
  ) {
    return this.moviesService.createMovieCategory(
      url,
      username,
      password,
      playlistId
    );
  }
}
