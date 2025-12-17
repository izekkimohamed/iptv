import { getDb } from "@/trpc/db";
import { user } from "@/trpc/schema";
import { eq } from "drizzle-orm";

const ANONYMOUS_ID = "anonymous";
const ANONYMOUS_USER = {
  id: ANONYMOUS_ID,
  name: "Anonymous",
  email: "anonymous@example.com",
};

export async function ensureAnonymousUser() {
  const db = getDb();
  const existing = await db
    .select()
    .from(user)
    .where(eq(user.id, ANONYMOUS_ID));

  if (existing.length === 0) {
    await db.insert(user).values(ANONYMOUS_USER).onConflictDoNothing();
  }
}
