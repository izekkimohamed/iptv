import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  playlists: t.router({
    getPlaylists: publicProcedure.output(z.array(z.object({
      id: z.number(),
      userId: z.string(),
      baseUrl: z.string(),
      username: z.string(),
      password: z.string(),
      status: z.string(),
      expDate: z.string(),
      isTrial: z.string(),
      createdAt: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createPlaylist: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
    })).output(z.object({
      id: z.number(),
      userId: z.string(),
      baseUrl: z.string(),
      username: z.string(),
      password: z.string(),
      status: z.string(),
      expDate: z.string(),
      isTrial: z.string(),
      createdAt: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    updatePlaylists: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    deletePlaylist: publicProcedure.input(z.object({
      playlistId: z.number(),
    })).output(z.object({
      success: z.string(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  channels: t.router({
    getChannels: publicProcedure.input(z.object({
      playlistId: z.number(),
      categoryId: z.number().optional(),
      favorites: z.boolean().optional(),
    })).output(z.array(z.object({
      id: z.number(),
      name: z.string(),
      streamType: z.string(),
      streamId: z.number(),
      streamIcon: z.string().optional(),
      categoryId: z.number(),
      playlistId: z.number(),
      isFavorite: z.boolean().default(false),
      url: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getCategories: publicProcedure.input(z.object({
      playlistId: z.number(),
    })).output(z.array(z.object({
      id: z.number(),
      categoryId: z.number(),
      categoryName: z.string(),
      playlistId: z.number(),
      type: z.enum(['channels', 'movies', 'series']),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getShortEpg: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      channelId: z.number(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    toggleFavorite: publicProcedure.input(z.object({
      channelsId: z.number(),
      isFavorite: z.boolean(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createChannels: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createChannelsCategories: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  movies: t.router({
    getMovies: publicProcedure.input(z.object({
      playlistId: z.number(),
      categoryId: z.number(),
    })).output(z.array(z.object({
      id: z.number(),
      streamId: z.number(),
      name: z.string(),
      streamType: z.string(),
      streamIcon: z.string(),
      rating: z.string(),
      added: z.string(),
      categoryId: z.number(),
      playlistId: z.number(),
      containerExtension: z.string(),
      url: z.string(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMovie: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      movieId: z.number(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMovieDetails: publicProcedure.input(z.object({
      tmdbId: z.number().nullable(),
      name: z.string().nullable(),
      year: z.number().nullable(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createMovie: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getMoviesCategories: publicProcedure.input(z.object({
      playlistId: z.number(),
    })).output(z.array(z.object({
      id: z.number(),
      categoryId: z.number(),
      categoryName: z.string(),
      playlistId: z.number(),
      type: z.enum(['channels', 'movies', 'series']),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createMoviesCategories: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  series: t.router({
    getseries: publicProcedure.input(z.object({
      playlistId: z.number(),
      categoryId: z.number(),
    })).output(z.array(z.object({
      id: z.number(),
      seriesId: z.number(),
      name: z.string().nullable(),
      cover: z.string().nullable(),
      plot: z.string().nullable(),
      cast: z.string().nullable(), // since sometimes ""
      director: z.string().nullable(),
      genere: z.string().nullable(), // fix typo if API always sends "genere"
      releaseDate: z.string().nullable(),
      lastModified: z.string().nullable(),
      rating: z.string().nullable(),
      backdropPath: z.string().nullable(),
      youtubeTrailer: z.string().nullable(),
      episodeRunTime: z.string().nullable(),
      categoryId: z.number(),
      playlistId: z.number(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getSerie: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      serieId: z.number(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createSerie: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getSeriesCategories: publicProcedure.input(z.object({
      playlistId: z.number(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createSeriesCategories: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  home: t.router({
    getHome: publicProcedure.output(z.object({
      movies: z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          overview: z.string(),
          releaseDate: z.string(),
          voteAverage: z.number(),
          voteCount: z.number(),
          popularity: z.number(),
          posterUrl: z.string().nullable(),
          backdropUrl: z.string().nullable(),
          genres: z.array(z.string().optional()),
        }),
      ),
      series: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          overview: z.string(),
          firstAirDate: z.string(),
          voteAverage: z.number(),
          voteCount: z.number(),
          popularity: z.number(),
          posterUrl: z.string().nullable(),
          backdropUrl: z.string().nullable(),
          genres: z.array(z.string().optional()),
        }),
      ),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    globalSearch: publicProcedure.input(z.object({
      query: z.string(),
    })).output(z.object({
      movies: z.array(zodMovieSchema).nullable(),
      channels: z.array(zodChannelsSchema).nullable(),
      series: z.array(zodSerieSchema).nullable(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

