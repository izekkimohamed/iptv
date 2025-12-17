import { appRouter } from "@/lib/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const runtime = "nodejs";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, x-trpc-source",
    "Access-Control-Allow-Credentials": "true",
  };
}

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
    responseMeta() {
      return {
        headers: getCorsHeaders(req),
      };
    },
  });

export { handler as GET, handler as POST };

export const OPTIONS = (req: Request) =>
  new Response(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
