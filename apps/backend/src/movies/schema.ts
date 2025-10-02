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
