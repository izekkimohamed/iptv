import { QueryClient } from '@tanstack/react-query';
import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import superjson from 'superjson';

import type { AppRouter } from '../../api/lib/router';

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 15,
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
        transformer: superjson,
      }),
    ],
  });
};
