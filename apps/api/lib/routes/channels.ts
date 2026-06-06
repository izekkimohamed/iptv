import {
  buildMissingCategories,
  fetchAndCreateCategoriesByType,
  insertMissingCategories,
} from "@/services/categoryService";
import {
  fetchAndPrepareChannels,
  getChannelsFromDb,
  insertChannels,
  toggleChannelFavorite,
} from "@/services/channelService";
import { getDb } from "@/trpc/db";
import {
  categories,
  channels,
  zodCategoriesSchema,
  zodChannelsSchema,
} from "@/trpc/schema";
import { createXtreamClient } from "@/utils/xtream";
import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, t } from "../trpc";

export const channelsRouter = t.router({
  getChannels: publicProcedure
    .input(
      z.object({
        playlistId: z.number(),
        categoryId: z.number().optional(),
        favorites: z.boolean().optional(),
        skip: z.number().int().min(0).optional(),
        take: z.number().int().min(1).max(200).optional(),
      }),
    )
    .output(z.array(zodChannelsSchema))
    .query(async ({ input }) => {
      return await getChannelsFromDb(input);
    }),

  getChannel: publicProcedure
    .input(z.object({ id: z.number() }))
    .output(zodChannelsSchema.nullable())
    .query(async ({ input }) => {
      const db = getDb();
      const [result] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, input.id))
        .limit(1);
      if (!result) return null;
      return {
        ...result,
        streamIcon: result.streamIcon ?? undefined,
        isFavorite: result.isFavorite ?? false,
      };
    }),

  getCategories: publicProcedure
    .input(z.object({ playlistId: z.number() }))
    .output(z.array(zodCategoriesSchema))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.playlistId, input.playlistId),
            eq(categories.type, "channels"),
          ),
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
      }),
    )
    .query(async ({ input }) => {
      const x = createXtreamClient(input.url, input.username, input.password);
      const epgData = await x.getShortEPG({ channelId: input.channelId });
      return epgData.epg_listings;
    }),

  toggleFavorite: publicProcedure
    .input(
      z.object({
        channelsId: z.number(),
        isFavorite: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      return await toggleChannelFavorite(input.channelsId, input.isFavorite);
    }),

  updateCategoryChannels: publicProcedure
    .input(
      z.object({
        playlistId: z.number(),
        categoryId: z.number(),
        url: z.string(),
        username: z.string(),
        password: z.string(),
      }),
    )
    .output(z.array(zodChannelsSchema))
    .mutation(async ({ input }) => {
      const db = getDb();
      const xtreamClient = createXtreamClient(
        input.url,
        input.username,
        input.password,
      );

      // Fetch channels from Xtream API
      const xtreamChannels = await xtreamClient.getChannels();

      // Filter channels for this category
      const categoryChannels = xtreamChannels.filter(
        (c) => Number(c.category_id) === input.categoryId,
      );

      // Map to our schema
      const mappedChannels = categoryChannels.map((c) => ({
        categoryId: Number(c.category_id),
        name: c.name || "Unknown channel",
        streamType: c.stream_type,
        streamId: c.stream_id,
        streamIcon: c.stream_icon || "",
        playlistId: input.playlistId,
        isFavorite: false,
        url: c.url || "",
      }));

      // Get existing channels for this category to preserve favorites
      const existingChannels = await db
        .select()
        .from(channels)
        .where(
          and(
            eq(channels.playlistId, input.playlistId),
            eq(channels.categoryId, input.categoryId),
          ),
        );

      const existingMap = new Map(
        existingChannels.map((c) => [c.streamId, c.isFavorite]),
      );

      // Preserve favorite status
      const channelsToUpsert = mappedChannels.map((c) => ({
        ...c,
        isFavorite: existingMap.get(c.streamId) ?? false,
      }));

      // Perform delete & insert inside a transaction, returning the inserted rows
      const result = await db.transaction(async (trx) => {
        await trx
          .delete(channels)
          .where(
            and(
              eq(channels.playlistId, input.playlistId),
              eq(channels.categoryId, input.categoryId),
            ),
          );

        if (channelsToUpsert.length === 0) return [];

        const inserted = await trx
          .insert(channels)
          .values(channelsToUpsert)
          .returning();

        return inserted.map((c) => ({
          id: c.id,
          name: c.name,
          streamType: c.streamType,
          streamId: c.streamId,
          categoryId: c.categoryId,
          playlistId: c.playlistId,
          url: c.url,
          streamIcon: c.streamIcon ?? undefined,
          isFavorite: c.isFavorite ?? undefined,
          createdAt: c.createdAt,
        }));
      });

      return result;
    }),

  createChannels: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
        playlistId: z.number(),
      }),
    )
    .output(
      z.object({
        inserted: z.number(),
        channels: z.array(
          z.object({ id: z.number(), streamId: z.number(), name: z.string() }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const xtreamClient = createXtreamClient(
        input.url,
        input.username,
        input.password,
      );

      const { newChannels } = await fetchAndPrepareChannels(
        input.playlistId,
        xtreamClient,
      );

      const categoryData = await buildMissingCategories(
        newChannels,
        "channels",
        input.playlistId,
        new Set(),
      );
      await insertMissingCategories(categoryData);
      await insertChannels(newChannels);

      // Fetch back the inserted channels with their generated IDs
      const streamIds = newChannels.map((c) => c.streamId);
      const db = getDb();
      const inserted = await db
        .select({
          id: channels.id,
          streamId: channels.streamId,
          name: channels.name,
        })
        .from(channels)
        .where(
          and(
            eq(channels.playlistId, input.playlistId),
            inArray(channels.streamId, streamIds),
          ),
        );

      return { inserted: inserted.length, channels: inserted };
    }),

  createChannelsCategories: publicProcedure
    .input(
      z.object({
        url: z.string(),
        username: z.string(),
        password: z.string(),
        playlistId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const xtreamClient = createXtreamClient(
        input.url,
        input.username,
        input.password,
      );
      return await fetchAndCreateCategoriesByType(
        xtreamClient,
        "channels",
        input.playlistId,
      );
    }),
});
