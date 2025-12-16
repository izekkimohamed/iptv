import { getDb } from "@/trpc/db";
import { playlists } from "@/trpc/schema";
import { performPlaylistUpdate } from "./lib/routes/playlists";

async function updateAllPlaylists() {
  const db = getDb();
  const rows = await db.select().from(playlists);
  for (const p of rows) {
    await performPlaylistUpdate({
      url: p.baseUrl,
      username: p.username,
      password: p.password,
      playlistId: p.id,
    });
  }
}

function msUntilNext(hour: number, minute: number) {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

export async function register() {
  const g = globalThis as unknown as { __playlistUpdateScheduled?: boolean };
  if (g.__playlistUpdateScheduled) return;
  g.__playlistUpdateScheduled = true;
  const run = async () => {
    try {
      await updateAllPlaylists();
    } catch {}
  };
  const delay = msUntilNext(3, 0);
  setTimeout(() => {
    run();
    setInterval(run, 24 * 60 * 60 * 1000);
  }, delay);
}

