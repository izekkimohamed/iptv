import { describe, it, expect, vi } from "vitest";
import { fetchAndPrepareChannels } from "./channelService";
import { Xtream } from "@iptv/xtream-api";
import { getDb } from "@/trpc/db";
import { channels } from "@/trpc/schema";
import { eq } from "drizzle-orm";

// Mock the database and Xtream client
vi.mock("@/trpc/db", () => ({
  getDb: vi.fn(() => ({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => []), // Mock no existing channels initially
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => {}),
    })),
  })),
}));

vi.mock("@/trpc/common", () => ({
  batchInsert: vi.fn(),
}));

vi.mock("@iptv/xtream-api", () => ({
  Xtream: vi.fn(() => ({
    getChannels: vi.fn(() => [
      {
        stream_id: 1,
        category_id: "10",
        name: "Channel 1",
        stream_type: "live",
        stream_icon: "icon1.png",
        url: "url1",
      },
      {
        stream_id: 2,
        category_id: "10",
        name: "Channel 2",
        stream_type: "live",
        stream_icon: "icon2.png",
        url: "url2",
      },
    ]),
  })),
}));

describe("channelService", () => {
  it("should correctly identify new channels and channels to delete", async () => {
    const playlistId = 1;
    const xtreamClient = new Xtream("http://localhost", "user", "pass");

    // Mock existing channels in the database
    (getDb as any).mockReturnValue({
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => [
            {
              id: 101,
              streamId: 1,
              playlistId: 1,
              categoryId: 10,
              name: "Channel 1",
              streamType: "live",
              streamIcon: "icon1.png",
              isFavorite: false,
              url: "url1",
            },
            {
              id: 103,
              streamId: 3,
              playlistId: 1,
              categoryId: 10,
              name: "Channel 3",
              streamType: "live",
              streamIcon: "icon3.png",
              isFavorite: false,
              url: "url3",
            },
          ]),
        })),
      })),
      delete: vi.fn(() => ({
        where: vi.fn(() => {}),
      })),
    });

    // Mock fetched channels from Xtream API
    (xtreamClient.getChannels as any).mockResolvedValue([
      {
        stream_id: 1,
        category_id: "10",
        name: "Channel 1",
        stream_type: "live",
        stream_icon: "icon1.png",
        url: "url1",
      },
      {
        stream_id: 2,
        category_id: "10",
        name: "Channel 2",
        stream_type: "live",
        stream_icon: "icon2.png",
        url: "url2",
      },
    ]);

    const { newChannels, toDelete } = await fetchAndPrepareChannels(
      playlistId,
      xtreamClient
    );

    expect(newChannels).toEqual([
      {
        categoryId: 10,
        name: "Channel 2",
        streamType: "live",
        streamId: 2,
        streamIcon: "icon2.png",
        playlistId: 1,
        isFavorite: false,
        url: "url2",
      },
    ]);

    expect(toDelete).toEqual([3]); // Channel 3 should be marked for deletion
  });
});
