import {
  text,
  integer,
  index,
  uniqueIndex,
  boolean,
  serial,
  pgTable,
} from "drizzle-orm/pg-core";
import { categories, playlists } from "src/playlist/schema";
import * as z from "zod";
export const channels = pgTable(
  "channels",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    streamType: text("stream_type").notNull(),
    streamId: integer("stream_id").notNull(),
    streamIcon: text("stream_icon"),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.categoryId, { onDelete: "cascade" }),
    playlistId: integer("playlist_id").references(() => playlists.id, {
      onDelete: "cascade",
    }),
    isFavorite: boolean("is_favorite").default(false),
    url: text("url").notNull(),
  },
  (table) => ({
    categoryIdx: index("channels_category_idx").on(table.categoryId),
    uniqueChannel: uniqueIndex("unique_channel").on(
      table.streamId,
      table.categoryId
    ),
    favoriteIdx: index("favorite_idx").on(table.isFavorite),
  })
);

export const zodChannelsType = z.object({
  id: z.number(),
  name: z.string(),
  streamType: z.string(),
  streamId: z.number(),
  streamIcon: z.string().optional(),
  categoryId: z.number(),
  playlistId: z.number().optional(),
  isFavorite: z.boolean().default(false),
  url: z.string(),
});

export const zodChannelsList = z.array(zodChannelsType);
export type ChannelsSelectType = z.infer<typeof zodChannelsType>;
export type ChannelsListType = z.infer<typeof zodChannelsList>;
