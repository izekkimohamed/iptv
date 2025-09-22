import {
  createTRPCReact,
  CreateTRPCReact,
  httpBatchLink,
} from "@trpc/react-query";
import { AppRouter } from "@repo/trpc/router";
import { QueryClient } from "@tanstack/react-query";

export const trpc: CreateTRPCReact<AppRouter, object> = createTRPCReact<
  AppRouter,
  object
>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 15, // 15 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

export const createTrpcClient = (url: string) => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  });
};
