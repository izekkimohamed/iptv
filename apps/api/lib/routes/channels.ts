import { Xtream } from "@iptv/xtream-api";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/trpc/db";
import {
  categories,
  channels,
  zodCategoriesSchema,
  zodChannelsSchema,
} from "@/trpc/schema";
import { publicProcedure, t } from "../trpc";

function xtream(url: string, username: string, password: string) {
  return new Xtream({ url, username, password, preferredFormat: "m3u8" });
}

export const channelsRouter = t.router({
  getChannels: publicProcedure
    .input(
      z.object({
        playlistId: z.number(),
        categoryId: z.number().optional(),
        favorites: z.boolean().optional(),
      })
    )
    .output(z.array(zodChannelsSchema))
    .query(async ({ input }) => {
      const db = getDb();
      if (input.categoryId) {
        const rows = await db
          .select()
          .from(channels)
          .where(
            and(
              eq(channels.playlistId, input.playlistId),
              eq(channels.categoryId, input.categoryId)
            )
          )
          .orderBy(desc(channels.isFavorite), asc(channels.id));
        return rows.map((r) => ({
          ...r,
          streamIcon: r.streamIcon ?? undefined,
          isFavorite: r.isFavorite ?? false,
        }));
      } else if (input.favorites) {
        const rows = await db
          .select()
          .from(channels)
          .where(
            and(
              eq(channels.playlistId, input.playlistId),
              eq(channels.isFavorite, true)
            )
          )
          .orderBy(asc(channels.id));
        return rows.map((r) => ({
          ...r,
          streamIcon: r.streamIcon ?? undefined,
          isFavorite: r.isFavorite ?? false,
        }));
      }
      return [];
    }),
  getCategories: publicProcedure
    .input(
      z.object({
        playlistId: z.number(),
      })
    )
    .output(z.array(zodCategoriesSchema))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.playlistId, input.playlistId),
            eq(categories.type, "channels")
          )
        )
        .orderBy(asc(categories.id));
      return rows.map((r) => ({
        ...r,
        playlistId: r.playlistId ?? input.playlistId,
      }));
    }),
  getShortEpg: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
        channelId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const x = xtream(input.url, input.username, input.password);
      const epgData = await x.getShortEPG({ channelId: input.channelId });
      return epgData.epg_listings;
    }),
  toggleFavorite: publicProcedure
    .input(
      z.object({
        channelsId: z.number(),
        isFavorite: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(channels)
        .where(eq(channels.id, input.channelsId));
      if (existing.length === 0) throw new Error("Channel not found");
      const updated = await db
        .update(channels)
        .set({ isFavorite: input.isFavorite })
        .where(eq(channels.id, input.channelsId))
        .returning();
      if (updated.length === 0) throw new Error("Error updating channel");
      return updated[0];
    }),
  createChannels: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
        playlistId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const x = xtream(input.url, input.username, input.password);
      const data = await x.getChannels();
      const uniqueCategoryIds = new Set<number>();
      data.forEach((ch) => {
        if (ch.category_id) uniqueCategoryIds.add(Number(ch.category_id));
      });
      const existingCategories = await db
        .select({ selected: categories.categoryId })
        .from(categories);
      const missingCategoryIds = Array.from(uniqueCategoryIds).filter(
        (id) => !existingCategories.map((cat) => cat.selected).includes(id)
      );
      if (missingCategoryIds.length > 0) {
        const newCategories = missingCategoryIds.map((id) => ({
          playlistId: input.playlistId,
          type: "channels" as const,
          categoryName: `category ${id}`,
          categoryId: id,
        }));
        await db.insert(categories).values(newCategories);
      }
      const tempChannels = data.map((ch) => ({
        categoryId: +ch.category_id,
        name: ch.name,
        streamType: ch.stream_type,
        streamId: ch.stream_id,
        streamIcon: ch.stream_icon || "",
        playlistId: input.playlistId,
        isFavorite: false,
        url: ch.url || "",
      }));
      const { batchInsert } = await import("@/trpc/common");
      await batchInsert(channels, tempChannels, {
        chunkSize: 3000,
        concurrency: 5,
      });
      return { success: true };
    }),
  createChannelsCategories: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
        playlistId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const x = xtream(input.url, input.username, input.password);
      const data = await x.getChannelCategories();
      const tempCategories = data.map((category) => ({
        playlistId: input.playlistId,
        type: "channels" as const,
        categoryName: category.category_name,
        categoryId: +category.category_id,
      }));
      if (!tempCategories.length) return [];
      await db
        .insert(categories)
        .values(tempCategories)
        .onConflictDoUpdate({
          target: [categories.categoryId, categories.playlistId],
          set: {
            categoryName: sql`excluded.category_name`,
            type: sql`excluded.type`,
          },
        });
      return { success: true };
    }),
});
