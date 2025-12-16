// api/cron/updatePlaylists.ts
import { performPlaylistUpdate } from "@/lib/routes/playlists";
import { getDb } from "@/trpc/db";
import { playlists } from "@/trpc/schema";
import { NextRequest, NextResponse } from "next/server";

export default async function handler(req: NextRequest, res: NextResponse) {
  // Verify the request is from Vercel's cron service
  if (
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    // api/cron/updatePlaylists.ts
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const rows = await db.select().from(playlists);

    const results = [];
    for (const p of rows) {
      try {
        const result = await performPlaylistUpdate({
          url: p.baseUrl,
          username: p.username,
          password: p.password,
          playlistId: p.id,
        });
        results.push({
          playlistId: p.id,
          ...result,
        });
      } catch (error) {
        results.push({
          playlistId: p.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Playlist update completed",
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
