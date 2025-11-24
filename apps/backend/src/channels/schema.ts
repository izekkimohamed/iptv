import { foreignKey } from "drizzle-orm/pg-core";
import {
  text,
  integer,
  index,
  uniqueIndex,
  boolean,
  pgTable,
} from "drizzle-orm/pg-core";
import { categories, playlists } from "src/playlist/schema";
import * as z from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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
export type ChannelsSelectType = z.infer<typeof zodChannelsSchema>;
export type ChannelsListType = z.infer<typeof zodChannelsList>;
