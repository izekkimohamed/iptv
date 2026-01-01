import { batchInsert } from "@/trpc/common";
import { getDb } from "@/trpc/db";
import { categories } from "@/trpc/schema";
import { Xtream, XtreamCategory } from "@iptv/xtream-api";
import { eq, sql } from "drizzle-orm";

export type CategoryType = "channels" | "movies" | "series";

export async function fetchAndPrepareCategories(playlistId: number) {
  const db = getDb();
  const existing = await db
    .select({ categoryId: categories.categoryId, type: categories.type })
    .from(categories)
    .where(eq(categories.playlistId, playlistId));

  return {
    existing,
    byType: {
      channels: existing.filter((c) => c.type === "channels"),
      movies: existing.filter((c) => c.type === "movies"),
      series: existing.filter((c) => c.type === "series"),
    },
    idSets: {
      channels: new Set(
        existing.filter((c) => c.type === "channels").map((c) => c.categoryId)
      ),
      movies: new Set(
        existing.filter((c) => c.type === "movies").map((c) => c.categoryId)
      ),
      series: new Set(
        existing.filter((c) => c.type === "series").map((c) => c.categoryId)
      ),
    },
  };
}

export function buildMissingCategories<
  T extends { categoryId: number | string },
>(
  items: T[],
  type: CategoryType,
  playlistId: number,
  existingIds: Set<number>
) {
  return Array.from(
    new Map(
      items.map((item) => [
        item.categoryId,
        {
          playlistId,
          type,
          categoryName: `category ${item.categoryId}`,
          categoryId: +item.categoryId,
        },
      ])
    ).values()
  ).filter((category) => !existingIds.has(category.categoryId));
}

export async function insertMissingCategories(
  categoriesToCreate: (typeof categories.$inferInsert)[]
) {
  if (categoriesToCreate.length === 0) return;

  await batchInsert(categories, categoriesToCreate, {
    chunkSize: 3000,
    concurrency: 5,
  });
}

export async function fetchAndCreateCategoriesByType(
  xtreamClient: Xtream,
  type: CategoryType,
  playlistId: number
) {
  let fetchedCategories: XtreamCategory[] = [];

  if (type === "channels") {
    fetchedCategories = await xtreamClient.getChannelCategories();
  } else if (type === "movies") {
    fetchedCategories = await xtreamClient.getMovieCategories();
  } else if (type === "series") {
    fetchedCategories = await xtreamClient.getShowCategories();
  }

  const tempCategories = fetchedCategories.map((cat) => ({
    playlistId,
    type,
    categoryName: cat.category_name,
    categoryId: +cat.category_id,
  }));

  if (!tempCategories.length) return { success: true, data: [] };

  const db = getDb();
  await db
    .insert(categories)
    .values(tempCategories)
    .onConflictDoUpdate({
      target: [categories.categoryId, categories.playlistId],
      set: {
        categoryName: sql`excluded.category_name`,
        type: sql`excluded.type`,
      },
    });

  return { success: true, data: tempCategories };
}
