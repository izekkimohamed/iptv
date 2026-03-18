import { batchInsert } from "@/trpc/common";
import { getDb } from "@/trpc/db";
import { channels } from "@/trpc/schema";
import { Xtream } from "@iptv/xtream-api";
import { and, asc, desc, eq, gt } from "drizzle-orm";

export async function getChannelsFromDb(input: {
  playlistId: number;
  categoryId?: number;
  favorites?: boolean;
  cursor?: number | null;
  limit?: number;
}) {
  const db = getDb();
  const limit = input.limit ?? 50;
  const cursor = input.cursor;

  const whereConditions = [eq(channels.playlistId, input.playlistId)];

  if (input.categoryId) {
    whereConditions.push(eq(channels.categoryId, input.categoryId));
  }

  if (input.favorites) {
    whereConditions.push(eq(channels.isFavorite, true));
  }

  if (cursor) {
    whereConditions.push(gt(channels.id, cursor));
  }

  const result = await db
    .select()
    .from(channels)
    .where(and(...whereConditions))
    .orderBy(asc(channels.id)) // Use ID for cursor-based pagination
    .limit(limit + 1);

  let nextCursor: typeof cursor | undefined = undefined;
  if (result.length > limit) {
    const nextItem = result.pop();
    nextCursor = nextItem?.id;
  }

  return {
    items: result.map((c) => ({
      ...c,
      streamIcon: c.streamIcon ?? undefined,
      isFavorite: c.isFavorite ?? undefined,
    })),
    nextCursor,
  };
}

export async function fetchAndPrepareChannels(
  playlistId: number,
  xtreamClient: Xtream
) {
  const db = getDb();
  const fetched = await xtreamClient.getChannels();
  const existing = await db
    .select({ streamId: channels.streamId })
    .from(channels)
    .where(eq(channels.playlistId, playlistId));

  const fetchedMap = new Map(fetched.map((c) => [c.stream_id, c]));
  const existingMap = new Map(existing.map((c) => [c.streamId, c]));

  const newChannels = fetched
    .filter((c) => !existingMap.has(Number(c.stream_id)))
    .map((c) => ({
      categoryId: +c.category_id,
      name: c.name || "Unknown channel",
      streamType: c.stream_type,
      streamId: c.stream_id,
      streamIcon: c.stream_icon || "",
      playlistId,
      isFavorite: false,
      url: c.url || "",
    }));

  const toDelete = fetched
    .filter((c) => !fetchedMap.has(Number(c.stream_id)))
    .map((c) => ({
      categoryId: +c.category_id,
      name: c.name || "Unknown channel",
      streamType: c.stream_type,
      streamId: c.stream_id,
      streamIcon: c.stream_icon || "",
      playlistId,
      isFavorite: false,
      url: c.url || "",
    }));

  return { newChannels, toDelete };
}

export async function insertChannels(
  newChannels: (typeof channels.$inferInsert)[]
) {
  if (newChannels.length === 0) return;

  await batchInsert(channels, newChannels, {
    chunkSize: 3000,
    concurrency: 5,
  });
}

export async function toggleChannelFavorite(
  channelId: number,
  isFavorite: boolean
) {
  const db = getDb();
  const existing = await db
    .select()
    .from(channels)
    .where(eq(channels.id, channelId));

  if (existing.length === 0) throw new Error("Channel not found");

  const updated = await db
    .update(channels)
    .set({ isFavorite })
    .where(eq(channels.id, channelId))
    .returning();

  if (updated.length === 0) throw new Error("Error updating channel");
  return updated[0];
}
