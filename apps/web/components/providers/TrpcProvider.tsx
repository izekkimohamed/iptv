// In your root layout or provider component
'use client';

import { createTrpcClient, queryClient, trpc } from '@/lib/trpc';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [trpcClient] = useState(
    () => createTrpcClient(`${process.env.NEXT_PUBLIC_TRPC_URL}`), // ← Check this URL
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
