'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import CategoriesSidebar from '@/components/commen/CategoriesSidebar';
import { trpc } from '@/lib/trpc';
import { usePlaylistStore } from '@repo/store';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategoryId = searchParams.get('categoryId');

  const { selectedPlaylist: playlist } = usePlaylistStore();

  const { data: categories, isLoading: isFetchingCategories } =
    trpc.movies.getMoviesCategories.useQuery(
      {
        playlistId: playlist?.id || 0,
      },
      {
        enabled: !!playlist,
      },
    );
  const handleCategoryClick = (categoryId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('categoryId', categoryId.toString());
    params.delete('movieId');
    router.replace(`/movies?${params.toString()}`);
  };
  return (
    <div className="flex flex-1 overflow-y-auto">
      <CategoriesSidebar
        categories={categories}
        isLoading={isFetchingCategories}
        selectedCategoryId={selectedCategoryId}
        categoryType="movies"
      />
      {children}
    </div>
  );
}
