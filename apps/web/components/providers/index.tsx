import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React from 'react';
import TrpcProvider from './TrpcProvider';

export default function Providers({ children }: React.PropsWithChildren) {
  return (
    <TrpcProvider url={process.env.NEXT_PUBLIC_TRPC_URL!}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </TrpcProvider>
  );
}
