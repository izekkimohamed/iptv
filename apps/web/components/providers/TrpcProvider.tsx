'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

import { createTrpcClient, queryClient, trpc } from '@/lib/trpc';

interface TrpcProviderProps extends PropsWithChildren {
  url: string;
}

export default function TrpcProvider({ children, url }: TrpcProviderProps) {
  const client = createTrpcClient(url);

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
