'use client';

import CategoriesSidebar from '@/components/commen/CategoriesSidebar';
import ItemsDetails from '@/components/iptv/ItemsDetails';
import ItemsList from '@/components/iptv/ItemsList';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { trpc } from '@/lib/trpc';
import { usePlaylistStore } from '@/store/appStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { List, RowComponentProps } from 'react-window';

export default function SeriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get('categoryId');
  const serieId = searchParams.get('serieId');

  const { selectedPlaylist } = usePlaylistStore();

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
      <div className="flex-1 min-h-full overflow-y-auto ">
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
            icon="📺"
            title="No Categories Found"
            description="Please select a category to view series"
            fullScreen
          />
        )}
        {isFetchingSeries || (isFetchingSerie && <LoadingSpinner fullScreen />)}
        {serieId && serie && (
          <ItemsDetails
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
          <div className="bg-gradient-to-b from-slate-900/40 to-slate-950 min-h-full">
            <List
              className="p-5 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3 "
              rowComponent={RowComponent}
              rowCount={series.length}
              rowHeight={0.3}
              rowProps={{ series, handleserieClick }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function RowComponent({
  index,
  series,
  handleserieClick,
}: RowComponentProps<{
  series: Array<{
    id: number;
    seriesId: number;
    name: string | null;
    cover: string | null;
    plot: string | null;
    cast: string | null;
    director: string | null;
    genere: string | null;
    releaseDate: string | null;
    lastModified: string | null;
    rating: string | null;
    backdropPath: string | null;
    youtubeTrailer: string | null;
    episodeRunTime: string | null;
    categoryId: number;
    playlistId: number;
  }>;
  handleserieClick: (serieId: number) => void;
}>) {
  return (
    <ItemsList
      image={series[index].cover || ''}
      title={series[index].name || ''}
      rating={series[index].rating || ''}
      streamId={series[index].seriesId}
      onMovieClick={() => handleserieClick(series[index].seriesId)}
    />
  );
}
