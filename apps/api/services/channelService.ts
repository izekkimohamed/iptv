import { batchInsert } from "@/trpc/common";
import { getDb } from "@/trpc/db";
import { channels } from "@/trpc/schema";
import { Xtream } from "@iptv/xtream-api";
import { and, asc, desc, eq } from "drizzle-orm";

export async function getChannelsFromDb(input: {
  playlistId: number;
  categoryId?: number;
  favorites?: boolean;
  skip?: number;
  take?: number;
}) {
  const db = getDb();

  const whereConditions = [eq(channels.playlistId, input.playlistId)];

  if (input.categoryId) {
    whereConditions.push(eq(channels.categoryId, input.categoryId));
  }

  if (input.favorites) {
    whereConditions.push(eq(channels.isFavorite, true));
  }

  const query = db
    .select()
    .from(channels)
    .where(and(...whereConditions))
    .orderBy(desc(channels.isFavorite), asc(channels.createdAt))
    .$dynamic();

  if (input.skip != null) {
    query.offset(input.skip);
  }
  if (input.take != null) {
    query.limit(input.take);
  }

  const result = await query;

  return result.map((c) => ({
    ...c,
    streamIcon: c.streamIcon ?? undefined,
    isFavorite: c.isFavorite ?? false,
  }));
}

export async function fetchAndPrepareChannels(
  playlistId: number,
  xtreamClient: Xtream,
) {
  const db = getDb();

  let fetched: Awaited<ReturnType<typeof xtreamClient.getChannels>>;
  try {
    fetched = await xtreamClient.getChannels();
  } catch {
    throw new Error("Failed to fetch channels from Xtream API");
  }

  const existing = await db
    .select({ streamId: channels.streamId })
    .from(channels)
    .where(eq(channels.playlistId, playlistId));

  const existingStreamIds = new Set(existing.map((c) => c.streamId));
  const fetchedStreamIds = new Set(fetched.map((c) => Number(c.stream_id)));

  const newChannels = fetched
    .filter((c) => !existingStreamIds.has(Number(c.stream_id)))
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

  const toDelete = existing
    .filter((c) => !fetchedStreamIds.has(c.streamId))
    .map((c) => ({ streamId: c.streamId, playlistId }));

  return { newChannels, toDelete };
}

export async function insertChannels(
  newChannels: (typeof channels.$inferInsert)[],
) {
  if (newChannels.length === 0) return;

  await batchInsert(channels, newChannels, {
    chunkSize: 3000,
    concurrency: 5,
  });
}

export async function toggleChannelFavorite(
  channelId: number,
  isFavorite: boolean,
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
