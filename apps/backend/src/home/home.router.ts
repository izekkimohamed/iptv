import { Input, Query, Router } from 'nestjs-trpc';
import { HomeService } from './home.service';
import z from 'zod';
import { zodMovieSchema, zodMoviesList } from 'src/movies/schema';
import { zodChannelsList, zodChannelsSchema } from 'src/channels/schema';
import { zodSerieSchema, zodseriesList } from 'src/series/schema';

const MovieSchema = z.object({
  id: z.number(),
  streamId: z.number(),
  name: z.string(),
  streamType: z.literal('movie'),
  streamIcon: z.string(),
  rating: z.string(),
  added: z.string(),
  categoryId: z.number(),
  playlistId: z.number(),
  containerExtension: z.string(),
  url: z.string(),
});

const SeriesSchema = z.object({
  id: z.number(),
  streamId: z.number(),
  name: z.string(),
  streamType: z.literal('series'),
  streamIcon: z.string(),
  rating: z.string(),
  added: z.string(),
  categoryId: z.number(),
  playlistId: z.number(),
  containerExtension: z.string(),
  url: z.string(),
});

const ChannelSchema = z.object({
  id: z.number(),
  name: z.string(),
  streamType: z.literal('live'),
  streamId: z.number(),
  streamIcon: z.string(),
  categoryId: z.number(),
  playlistId: z.number(),
  isFavorite: z.boolean(),
  url: z.string(),
});

const GlobalSearchResponseSchema = z.object({
  movies: z.array(zodMovieSchema).nullable(),
  channels: z.array(zodChannelsSchema).nullable(),
  series: z.array(zodSerieSchema).nullable(),
});

@Router({ alias: 'home' })
export class HomeRouter {
  constructor(private readonly homeService: HomeService) {}
  @Query({
    output: z.object({
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
    }),
  })
  async getHome() {
    return this.homeService.getPopularMovies();
  }
  @Query({
    input: z.object({
      query: z.string(),
    }),
    output: GlobalSearchResponseSchema,
  })
  async globalSearch(@Input('query') query: string) {
    return this.homeService.globalSearch(query);
  }
}
