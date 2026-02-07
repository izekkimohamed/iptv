'use client';

import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React from 'react';

import { TrpcProvider } from './TrpcProvider';

export default function Providers({ children }: React.PropsWithChildren) {
  return (
    <TrpcProvider>
      <NuqsAdapter>{children}</NuqsAdapter>
    </TrpcProvider>
  );
}
