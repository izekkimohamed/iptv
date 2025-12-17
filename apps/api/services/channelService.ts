import { batchInsert } from "@/trpc/common";
import { getDb } from "@/trpc/db";
import { channels } from "@/trpc/schema";
import { Xtream } from "@iptv/xtream-api";
import { eq } from "drizzle-orm";

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

  const toDelete = existing.filter((c) => !fetchedMap.has(Number(c.streamId)));

  return { newChannels, toDelete };
}

export async function insertChannels(
  newChannels: (typeof channels.$inferInsert)[]
) {
  if (newChannels.length === 0) return;

  const db = getDb();
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
