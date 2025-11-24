import { foreignKey } from "drizzle-orm/pg-core";
import {
  text,
  serial,
  integer,
  index,
  uniqueIndex,
  pgTable,
} from "drizzle-orm/pg-core";
import { categories, playlists } from "src/playlist/schema";
import * as z from "zod";

export const movies = pgTable(
  "movies",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    streamId: integer("stream_id").notNull(),
    name: text("name").notNull(),
    streamType: text("stream_type").notNull(),
    streamIcon: text("stream_icon").notNull(),
    rating: text("rating").notNull(),
    added: text("added").notNull(),
    categoryId: integer("category_id").notNull(),
    playlistId: integer("playlist_id")
      .references(() => playlists.id, { onDelete: "cascade" })
      .notNull(),
    containerExtension: text("container_extension").notNull(),
    url: text("url").notNull(),
  },
  (table) => ({
    categoryIdx: index("movies_category_idx").on(table.categoryId),
    uniqueMovies: uniqueIndex("unique_movies").on(
      table.streamId,
      table.categoryId,
      table.playlistId
    ),
  })
);

export const zodMovieSchema = z.object({
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
});

export const zodMoviesList = z.array(zodMovieSchema);
export type MoviesSelectType = z.infer<typeof zodMovieSchema>;
export type MoviesListType = z.infer<typeof zodMoviesList>;

export const TmdbVideoSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  site: z.string(),
  type: z.string(),
});

// Genre schema
export const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Cast schema
export const CastSchema = z.object({
  name: z.string(),
  profilePath: z.string().nullable(),
});

// Main schema
export const TMDBSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    overview: z.string().optional(),
    genres: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
    runtime: z.number().optional(),
    releaseDate: z.string().optional(),
    poster: z.string().nullable().optional(),
    backdrop: z.string().nullable().optional(),
    director: z.string().nullable().optional(),
    cast: z
      .array(
        z.object({
          name: z.string(),
          profilePath: z.string().nullable(),
        })
      )
      .optional(),
    videos: z
      .array(
        z.object({
          id: z.string(),
          key: z.string(),
          name: z.string(),
          site: z.string(),
          type: z.string(),
        })
      )
      .optional(),
  })
  .nullable();

export const InfoSchema = z.object({
  movie_image: z.string().url(),
  genre: z.string(),
  plot: z.string(),
  rating: z.string(), // could be z.number().transform(String) if you want strict numbers
  releasedate: z.string(),
  description: z.string(),
});

export const MovieDataSchema = z.object({
  stream_id: z.number(),
  name: z.string(),
  added: z.string(), // looks like a Unix timestamp as string
  category_id: z.string(),
  container_extension: z.string(),
  custom_sid: z.string().nullable(),
  direct_source: z.string(),
});

export const MovieOutputSchema = z.object({
  info: InfoSchema,
  movie_data: MovieDataSchema,
  tmdb: TMDBSchema,
});
