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
});

export const zodseriesList = z.array(zodSerieSchema);
export type seriesSelectType = z.infer<typeof zodSerieSchema>;
export type seriesListType = z.infer<typeof zodseriesList>;
