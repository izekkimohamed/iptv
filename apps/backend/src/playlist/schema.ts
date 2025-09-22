import { index } from "drizzle-orm/pg-core";
import {
  pgTable,
  integer,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "src/database/schema";
import * as z from "zod";

// Define the allowed output formats as an enum in PostgreSQL
export const playlists = pgTable("playlists", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  username: text("username").notNull(),
  password: text("password").notNull(),
  baseUrl: text("base_url").notNull(),
  status: text("status").notNull(),
  expDate: text("exp_date").notNull(), // Storing as timestamp
  isTrial: text("is_trial").notNull().default("0"),
  createdAt: text("created_at").notNull(),
});

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
});

export type PlaylistsType = z.infer<typeof zodPlaylistsSchema>;

export const categories = pgTable(
  "categories",
  {
    categoryId: integer("category_id").primaryKey(),
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
  })
);

export const zodCategoriesSchema = z.object({
  categoryId: z.number(),
  categoryName: z.string(),
  playlistId: z.number(),
  type: z.enum(["channels", "movies", "series"]),
});
export const zodCategoriesList = z.array(zodCategoriesSchema);
export type CategoriesType = z.infer<typeof zodCategoriesSchema>;
