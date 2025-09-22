import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { CommonService } from "src/common/common.service";
import { DATABASE_CONNECTION } from "src/database/database-connection";
import { playlists } from "./schema";

@Injectable()
export class PlaylistService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase,
    private readonly common: CommonService
  ) {}

  async createPlaylist(
    url: string,
    username: string,
    password: string,
    userId: string
  ) {
    const xtream = this.common.xtream(url, username, password);
    const data = await xtream.getProfile();
    if (!data) {
      throw new InternalServerErrorException(
        "Failed to get profile from xtream"
      );
    }
    const playlist = await this.database
      .insert(playlists)
      .values({
        baseUrl: url,
        expDate: data.exp_date,
        isTrial: data.is_trial,
        password: data.password,
        username: data.username,
        status: data.status,
        userId,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return {
      ...playlist[0],
    };
  }
  async getPlaylists(userId: string) {
    const data = await this.database
      .select()
      .from(playlists)
      .where(eq(playlists.userId, userId));

    return data;
  }
}
