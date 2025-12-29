import {
  buildMissingCategories,
  fetchAndCreateCategoriesByType,
  insertMissingCategories,
} from "@/services/categoryService";
import {
  fetchAndPrepareChannels,
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
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, t } from "../trpc";

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

      // const [p] = await db
      //   .select()
      //   .from(playlists)
      //   .where(eq(playlists.id, input.playlistId));

      // const updatedTime = new Date(p.updatedAt);

      // const newChannels = await db
      //   .select()
      //   .from(channels)
      //   .where(
      //     eq(
      //       sql`DATE(${channels.createdAt})`,
      //       sql`DATE(${updatedTime.toISOString().split("T")[0]})`
      //     )
      //   );

      // console.log("new Channels", JSON.stringify(newChannels));

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
      const x = createXtreamClient(input.url, input.username, input.password);
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
      return await toggleChannelFavorite(input.channelsId, input.isFavorite);
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
      const xtreamClient = createXtreamClient(
        input.url,
        input.username,
        input.password
      );

      const { newChannels } = await fetchAndPrepareChannels(
        input.playlistId,
        xtreamClient
      );

      const categoryData = await buildMissingCategories(
        newChannels,
        "channels",
        input.playlistId,
        new Set()
      );
      await insertMissingCategories(categoryData);
      await insertChannels(newChannels);

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
      const xtreamClient = createXtreamClient(
        input.url,
        input.username,
        input.password
      );
      return await fetchAndCreateCategoriesByType(
        xtreamClient,
        "channels",
        input.playlistId
      );
    }),
});
