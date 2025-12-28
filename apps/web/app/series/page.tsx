'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import CategoriesSidebar from '@/components/commen/CategoriesSidebar';
import ItemsList from '@/components/iptv/ItemsList';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SeriesDetails from '@/features/series/components/SeriesDetails';
import { trpc } from '@/lib/trpc';
import VirtualGrid from '@/src/shared/components/common/VirtualGrid';
import { usePlaylistStore } from '@/store/appStore';
import { useRecentUpdateStore } from '@/store/recentUpdate';

export default function SeriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const { selectedPlaylist } = usePlaylistStore();

  const selectedCategoryId = searchParams.get('categoryId');
  const serieId = searchParams.get('serieId');

  const newSeries = useSearchParams().get('new');
  const selectedPlaylist = usePlaylistStore((state) => state.selectedPlaylist);
  const recentSeries = useRecentUpdateStore((state) => state.getLatestUpdate(selectedPlaylist?.id));
  const newSeriesData = recentSeries?.newItems.series || [];

  const { data: categories, isLoading } = trpc.series.getSeriesCategories.useQuery({
    playlistId: selectedPlaylist?.id || 0,
  });
  const { data: series, isLoading: isFetchingSeries } = trpc.series.getseries.useQuery(
    {
      categoryId: parseInt(selectedCategoryId || '0'),
      playlistId: selectedPlaylist?.id || 0,
    },
    {
      enabled: !!selectedCategoryId && !!selectedPlaylist,
    },
  );

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
    <div className="flex flex-1 overflow-y-auto">
      <CategoriesSidebar
        categories={categories}
        isLoading={isLoading}
        selectedCategoryId={selectedCategoryId}
        categoryType="series"
      />
      <div className="min-h-full flex-1 overflow-y-auto">
        {serieError && (
          <EmptyState
            icon="📺"
            title="No Series Found"
            description="Please try again later"
            fullScreen
            goBack
          />
        )}
        {!selectedCategoryId && !serieId && !newSeries && (
          <EmptyState
            icon="📺"
            title="No Categories Found"
            description="Please select a category to view series"
            fullScreen
          />
        )}
        {(isFetchingSeries || isFetchingSerie) && <LoadingSpinner fullScreen />}
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
          <div className="min-h-full bg-linear-to-b from-slate-900/40 to-slate-950">
            <VirtualGrid
              className="h-full p-5"
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
              minItemWidth={230}
              estimateItemHeight={360}
              gapClassName="gap-3"
            />
          </div>
        )}

        {newSeriesData.length > 0 &&
          !series &&
          !isFetchingSeries &&
          !isFetchingSerie &&
          !serieId && (
            <div className="min-h-full bg-linear-to-b from-slate-900/40 to-slate-950">
              <VirtualGrid
                className="h-full p-5"
                items={newSeriesData}
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
                minItemWidth={230}
                estimateItemHeight={360}
                gapClassName="gap-3"
              />
            </div>
          )}
      </div>
    </div>
  );
}
