import { AppRouter } from "@repo/trpc/router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { cookies } from "next/headers";

export const createServerTrpcClient = () => {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: process.env.TRPC_URL!,
        async headers() {
          const cookieStore = await cookies();
          return {
            cookie: cookieStore.toString(),
          };
        },
      }),
    ],
  });
};

// Helper function to get the client
export const serverTrpc = () => createServerTrpcClient();
