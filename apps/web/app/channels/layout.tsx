'use client';
import { useSearchParams } from 'next/navigation';
import React from 'react';

import CategoriesSidebar from '@/components/common/CategoriesSidebar';
import { trpc } from '@/lib/trpc';
import { usePlaylistStore } from '@repo/store';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchParams = useSearchParams();

  const selectedCategoryId = searchParams.get('categoryId');

  const { selectedPlaylist: playlist } = usePlaylistStore();

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
        selectedCategoryId={selectedCategoryId!}
        categoryType="channels"
      />
      {children}
    </div>
  );
}
