import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { CommonService } from "src/common/common.service";
import { DATABASE_CONNECTION } from "src/database/database-connection";
import { categories } from "src/playlist/schema";
import { channels } from "./schema";
import { and, asc, desc, eq, sql } from "drizzle-orm";

@Injectable()
export class ChannelsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase,
    private readonly common: CommonService
  ) {}
  async createChannels(
    url: string,
    username: string,
    password: string,
    playlist: number
  ) {
    const xtream = this.common.xtream(url, username, password);
    const channelsData = await xtream.getChannels();

    // check how many unique category ids there are in channels
    const uniqueCategoryIds = new Set<number>();
    channelsData.forEach((channel) => {
      if (channel.category_id) {
        uniqueCategoryIds.add(Number(channel.category_id));
      }
    });
    //now get the channelsCategories from the the db and list the ids that are not in the db
    const existingCategories = await this.database
      .select({
        selected: categories.categoryId,
      })
      .from(categories);
    const missingCategoryIds = Array.from(uniqueCategoryIds).filter(
      (id) => !existingCategories.map((cat) => cat.selected).includes(id)
    );
    //create the missing categories in the db
    if (missingCategoryIds.length > 0) {
      const newCategories: (typeof categories.$inferInsert)[] =
        missingCategoryIds.map((id) => ({
          playlistId: playlist,
          type: "channels",
          categoryName: `category ${id}`,
          categoryId: id,
        }));
      await this.database.insert(categories).values(newCategories);
    }
    const tempChannels: (typeof channels.$inferInsert)[] = channelsData.map(
      (channel) => ({
        categoryId: +channel.category_id,
        name: channel.name,
        streamType: channel.stream_type,
        streamId: channel.stream_id,
        streamIcon: channel.stream_icon || "",
        playlistId: playlist,
        isFavorite: false,
        url: channel.url || "",
      })
    );
    await this.common.batchInsert(channels, tempChannels, {
      chunkSize: 3000,
      concurrency: 5,
      onProgress: (progress) => {
        console.log(`${progress.percent}% complete`);
      },
    });
  }
  async createChannelsCategories(
    url: string,
    username: string,
    password: string,
    playlist: number
  ) {
    const xtream = this.common.xtream(url, username, password);
    const data = await xtream.getChannelCategories();
    const tempCategories: (typeof categories.$inferInsert)[] = data.map(
      (category) => ({
        playlistId: playlist,
        type: "channels",
        categoryName: category.category_name,
        categoryId: +category.category_id,
      })
    );
    if (!tempCategories.length) return [];

    return await this.database
      .insert(categories)
      .values(tempCategories)
      .onConflictDoUpdate({
        target: [categories.categoryId, categories.playlistId],
        set: {
          categoryName: sql`excluded.category_name`,
          type: sql`excluded.type`,
        },
      });
  }
  async getChannels(
    playlist: number,
    categoryId?: number,
    favorites?: boolean
  ) {
    if (categoryId) {
      return await this.database
        .select()
        .from(channels)
        .where(
          and(
            eq(channels.playlistId, playlist),
            eq(channels.categoryId, categoryId)
          )
        )
        .orderBy(desc(channels.isFavorite), asc(channels.id));
    } else if (favorites) {
      return await this.database
        .select()
        .from(channels)
        .where(
          and(eq(channels.playlistId, playlist), eq(channels.isFavorite, true))
        )
        .orderBy(asc(channels.id));
    }
  }
  async getChannelsCategories(playlist: number) {
    return await this.database
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.playlistId, playlist),
          eq(categories.type, "channels")
        )
      )
      .orderBy(asc(categories.id));
  }
  async getShortEpg(
    url: string,
    username: string,
    password: string,
    channelId: number
  ) {
    const xtream = this.common.xtream(url, username, password);
    const epgData = await xtream.getShortEPG({
      channelId,
    });
    return epgData.epg_listings;
  }

  async toggleFavorite(channelId: number, isFavorite: boolean) {
    const channel = await this.database
      .select()
      .from(channels)
      .where(eq(channels.id, channelId));
    if (channel.length === 0) {
      throw new InternalServerErrorException("Channel not found");
    }
    const updatedChannel = await this.database
      .update(channels)
      .set({ isFavorite })
      .where(eq(channels.id, channelId))
      .returning();
    if (updatedChannel.length === 0) {
      throw new InternalServerErrorException("Error updating channel");
    }
    return updatedChannel[0];
  }
}
