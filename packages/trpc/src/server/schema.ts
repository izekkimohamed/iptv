import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import * as z from "zod";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const playlists = pgTable("playlists", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  password: text("password").notNull(),
  baseUrl: text("base_url").notNull(),
  status: text("status").notNull(),
  expDate: text("exp_date").notNull(),
  isTrial: text("is_trial").notNull().default("0"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const categories = pgTable(
  "categories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    categoryId: integer("category_id").notNull(),
    categoryName: text("category_name").notNull(),
    playlistId: integer("playlist_id").references(() => playlists.id, {
      onDelete: "cascade",
    }),
    type: text("type", { enum: ["channels", "movies", "series"] }).notNull(),
  },
  (table) => ({
    playlistIdx: index("playlist_idx").on(table.playlistId),
    typeIdx: index("type_idx").on(table.type),
    playlistTypeIdx: index("playlist_type_idx").on(
      table.playlistId,
      table.type
    ),
    uniqueCategoryPerPlaylist: uniqueIndex("unique_category_per_playlist").on(
      table.categoryId,
      table.playlistId
    ),
  })
);

export const channels = pgTable(
  "channels",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    streamType: text("stream_type").notNull(),
    streamId: integer("stream_id").notNull(),
    streamIcon: text("stream_icon"),
    categoryId: integer("category_id").notNull(),
    playlistId: integer("playlist_id")
      .references(() => playlists.id, { onDelete: "cascade" })
      .notNull(),
    isFavorite: boolean("is_favorite").default(false),
    url: text("url").notNull(),
  },
  (t) => [
    index("channels_category_idx").on(t.categoryId),
    uniqueIndex("unique_channel").on(t.streamId, t.categoryId, t.playlistId),
    index("favorite_idx").on(t.isFavorite),
  ]
);

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

export const zodPlaylistsSchema = z.object({
  id: z.number(),
  userId: z.string(),
  baseUrl: z.string(),
  username: z.string(),
  password: z.string(),
  status: z.string(),
  expDate: z.string(),
  isTrial: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const zodCategoriesSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  categoryName: z.string(),
  playlistId: z.number(),
  type: z.enum(["channels", "movies", "series"]),
});

export const zodChannelsSchema = z.object({
  id: z.number(),
  name: z.string(),
  streamType: z.string(),
  streamId: z.number(),
  streamIcon: z.string().optional(),
  categoryId: z.number(),
  playlistId: z.number(),
  isFavorite: z.boolean().default(false),
  url: z.string(),
});
export const zodChannelsList = z.array(zodChannelsSchema);

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

export const zodSerieSchema = z.object({
  id: z.number(),
  seriesId: z.number(),
  name: z.string().nullable(),
  cover: z.string().nullable(),
  plot: z.string().nullable(),
  cast: z.string().nullable(),
  director: z.string().nullable(),
  genere: z.string().nullable(),
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
