import { foreignKey } from "drizzle-orm/pg-core";
import {
  serial,
  text,
  integer,
  index,
  uniqueIndex,
  pgTable,
} from "drizzle-orm/pg-core";
import { categories, playlists } from "src/playlist/schema";
import * as z from "zod";

export const series = pgTable(
  "series",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    seriesId: integer("series_id").notNull(),
    name: text("name").notNull(),
    cover: text("cover").notNull(),
    plot: text("plot"),
    rating: text("rating").notNull(),
    cast: text("cast"),
    genere: text("genre"),
    director: text("director"),
    releaseDate: text("release_date"),
    lastModified: text("last_modified").notNull(),
    backdropPath: text("backdrop_path"),
    youtubeTrailer: text("youtube_trailer"),
    episodeRunTime: text("episode_run_time"),
    categoryId: integer("category_id").notNull(),
    playlistId: integer("playlist_id")
      .references(() => playlists.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    categoryIdx: index("series_category_idx").on(table.categoryId),
    uniqueseries: uniqueIndex("unique_series").on(
      table.seriesId,
      table.categoryId,
      table.playlistId
    ),
  })
);

export const zodSerieSchema = z.object({
  id: z.number(),
  series_id: z.number(),
  name: z.string(),
  cover: z.string(),
  plot: z.string(),
  cast: z.string(),
  director: z.string().nullable(),
  genre: z.string().nullable(),
  releaseDate: z.string().nullable(),
  last_modified: z.string(),
  rating: z.string(),
  backdrop_path: z.string().nullable(),
  youtube_trailer: z.string().nullable(),
  episode_run_time: z.string(),
  category_id: z.string(),
  playlist_id: z.string(),
});

export const zodseriesList = z.array(zodSerieSchema);
export type seriesSelectType = z.infer<typeof zodSerieSchema>;
export type seriesListType = z.infer<typeof zodseriesList>;
