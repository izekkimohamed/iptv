'use client';
import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';

import CategoriesSidebar from '@/shared/components/common/CategoriesSidebar';
import { trpc } from '@/shared/lib/trpc';
import { usePlaylistStore } from '@repo/store';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';

function LayoutContent({
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
