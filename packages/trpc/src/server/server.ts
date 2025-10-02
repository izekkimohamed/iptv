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
      type: z.enum(["channels", "movies", "series"]),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getShortEpg: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      channelId: z.number(),
    })).output(z.array(
      z.object({
        id: z.string(),
        epg_id: z.string(),
        title: z.string(),
        lang: z.string(),
        channel_id: z.string(),
        description: z.string(),
        start: z.string(),
        end: z.string(),
        start_timestamp: z.string(),
        stop_timestamp: z.string(),
      })
    )).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
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
    })).output(z.object({
      id: z.number(),
      title: z.string(),
      overview: z.string(),
      genres: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
        })
      ),
      runtime: z.number(),
      releaseDate: z.string(),
      poster: z.string().nullable(),
      backdrop: z.string().nullable(),
      director: z.string(),
      cast: z.array(
        z.object({
          name: z.string(),
          profilePath: z.string().nullable(),
        })
      ),
      videos: z.array(
        z.object({
          id: z.string(),
          key: z.string(),
          site: z.string(),
          type: z.string(),
          name: z.string(),
        })
      ),
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
      type: z.enum(["channels", "movies", "series"]),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createMoviesCategories: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  series: t.router({
    createSerie: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getSeriesCategories: publicProcedure.query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    createSeriesCategories: publicProcedure.input(z.object({
      url: z.string(),
      username: z.string(),
      password: z.string(),
      playlistId: z.number(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

