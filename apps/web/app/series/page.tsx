"use client";

import CategoriesSidebar from "@/components/iptv/CategoriesSidebar";
import ItemsDetails from "@/components/iptv/ItemsDetails";
import ItemsList from "@/components/iptv/ItemsList";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { useRouter, useSearchParams } from "next/navigation";

export default function SeriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("categoryId");
  const serieId = searchParams.get("serieId");

  const { selectedPlaylist } = usePlaylistStore();

  const { data: categories, isLoading } =
    trpc.series.getSeriesCategories.useQuery({
      playlistId: selectedPlaylist?.id || 0,
    });
  const { data: series, isLoading: isFetchingSeries } =
    trpc.series.getseries.useQuery(
      {
        categoryId: parseInt(selectedCategoryId || "0"),
        playlistId: selectedPlaylist?.id || 0,
      },
      {
        enabled: !!selectedCategoryId,
      }
    );

  const { data: serie, isLoading: isFetchingSerie } =
    trpc.series.getSerie.useQuery(
      {
        serieId: parseInt(serieId || "0"),
        url: selectedPlaylist?.baseUrl || "",
        username: selectedPlaylist?.username || "",
        password: selectedPlaylist?.password || "",
      },
      {
        enabled: !!serieId,
      }
    );

  const handleCategoryClick = (categoryId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("categoryId", categoryId.toString());
    params.delete("serieId");
    router.push(`?${params.toString()}`);
  };
  const handleserieClick = (serieId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("serieId", serieId.toString());
    router.push(`?${params.toString()}`);
  };
  return (
    <div className='flex overflow-y-auto'>
      <CategoriesSidebar
        categories={categories}
        isLoading={isLoading}
        selectedCategoryId={selectedCategoryId}
        onCategoryClick={handleCategoryClick}
      />
      <div className='flex-1 overflow-y-auto'>
        {!selectedCategoryId && !serieId && (
          <EmptyState
            icon='📺'
            title='No Categories Found'
            description='Please select a category to view series'
            fullScreen
          />
        )}
        {isFetchingSeries || (isFetchingSerie && <LoadingSpinner />)}
        {serieId && serie && (
          <ItemsDetails
            image={serie.info.cover}
            rating={serie.info.rating}
            releasedate={serie.info.releasedate}
            description={serie.info.plot}
            name={serie.info.name}
            tmdb={serie.tmdb}
            seasons={serie.seasons}
            episodes={serie.episodes}
          />
        )}
        <div className='grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3 '>
          {series &&
            !isFetchingSeries &&
            !isFetchingSerie &&
            !serieId &&
            series.map((item) => (
              <ItemsList
                key={item.seriesId}
                streamId={item.seriesId}
                title={item.name}
                image={item.cover}
                onMovieClick={() => handleserieClick(item.seriesId)}
                rating={item.rating}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
