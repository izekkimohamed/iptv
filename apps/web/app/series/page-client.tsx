'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Tv } from 'lucide-react';
import { Suspense } from 'react';

import SeriesDetails from '@/features/series/components/SeriesDetails';
import CategoriesSidebar from '@/shared/components/common/CategoriesSidebar';
import VirtualGrid from '@/shared/components/common/VirtualGrid';
import ItemsList from '@/shared/components/iptv/ItemsList';
import EmptyState from '@/shared/components/ui/EmptyState';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { trpc } from '@/shared/lib/trpc';
import { usePlaylistStore } from '@repo/store';

function SeriesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategoryId = searchParams.get('categoryId');
  const serieId = searchParams.get('serieId');
  const selectedPlaylist = usePlaylistStore((state) => state.selectedPlaylist);

  const { data: categories, isLoading } = trpc.series.getSeriesCategories.useQuery({
    playlistId: selectedPlaylist?.id || 0,
  });


  const {
    data: infiniteMovies,
    isLoading: isFetchingSeries,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.series.getseries.useInfiniteQuery(
    {
      categoryId: parseInt(selectedCategoryId || '0'),
      playlistId: selectedPlaylist?.id || 0,
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!selectedCategoryId,
    },
  );

  const series = infiniteMovies?.pages.flatMap((page) => page.items) || [];

  const {
    data: serie,
    isLoading: isFetchingSerie,
    error: serieError,
  } = trpc.series.getSerie.useQuery(
    {
      serieId: parseInt(serieId || '0'),
      url: selectedPlaylist?.baseUrl || '',
      username: selectedPlaylist?.username || '',
      password: selectedPlaylist?.password || '',
    },
    {
      enabled: !!serieId,
    },
  );

  const handleserieClick = (serieId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('serieId', serieId.toString());
    router.push(`?${params.toString()}`);
  };
  return (
    <div className="flex h-full">
      <CategoriesSidebar categories={categories} isLoading={isLoading} categoryType="series" />
      <div className="bg-background/50 scrollbar-hide h-full w-full overflow-y-auto backdrop-blur-3xl">
        {serieError && (
          <EmptyState
            icon="📺"
            title="No Series Found"
            description="Please try again later"
            fullScreen
            goBack
          />
        )}
        {!selectedCategoryId && !serieId && (
          <EmptyState
            icon={<Tv className="text-muted-foreground/40 h-12 w-12" />}
            title="No Series Selected"
            description="Please select a category from the sidebar to continue"
            fullScreen
          />
        )}

        {(isFetchingSeries || isFetchingSerie) && (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
        {serieId && serie && (
          <SeriesDetails
            image={serie.info.cover}
            rating={serie.info.rating}
            description={serie.info.plot}
            name={serie.info.name}
            tmdb={serie.tmdb}
            seasons={serie.seasons}
            episodes={serie.episodes}
            stream_id={serie.streamId}
          />
        )}

        {series && !isFetchingSeries && !isFetchingSerie && !serieId && (
          <VirtualGrid
            className="h-full p-3"
            items={series}
            renderItem={(serie) => (
              <ItemsList
                image={serie.cover || ''}
                title={serie.name || ''}
                rating={serie.rating || ''}
                streamId={serie.seriesId}
                onMovieClick={() => handleserieClick(serie.seriesId)}
                itemType="series"
              />
            )}
            onScroll={(e) => {
              const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
              if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            gapClassName="gap-6"
          />
        )}
        {isFetchingNextPage && (
          <div className="flex justify-center p-4">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
}

export function SeriesPageContent() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <SeriesPageInner />
    </Suspense>
  );
}
