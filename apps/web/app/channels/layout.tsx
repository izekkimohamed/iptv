'use client';
import React, { Suspense } from 'react';

import CategoriesSidebar from '@/shared/components/common/CategoriesSidebar';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { trpc } from '@/shared/lib/trpc';
import { usePlaylistStore } from '@repo/store';

function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { selectedPlaylist: playlist } = usePlaylistStore();

  // Only pass credentials if we have a playlist - getCategories doesn't need them
  const { data: categories, isLoading: isFetchingCategories } =
    trpc.channels.getCategories.useQuery(
      {
        playlistId: playlist?.id || 0,
      },
      {
        enabled: !!playlist,
      },
    );

  return (
    <div className="flex h-full overflow-hidden">
      <CategoriesSidebar
        categories={categories}
        isLoading={isFetchingCategories}
        categoryType="channels"
      />
      {children}
    </div>
  );
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><LoadingSpinner /></div>}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
