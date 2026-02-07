import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const t = initTRPC.create({
  transformer: superjson, // ✅ MUST MATCH CLIENT
});
export const publicProcedure = t.procedure;
