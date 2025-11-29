"use client";

import CategoriesSidebar from "@/components/iptv/CategoriesSidebar";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Grid,
  List,
  RowComponentProps,
  useDynamicRowHeight,
} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import ItemsList from "@/components/iptv/ItemsList";
import ItemsDetails from "@/components/iptv/ItemsDetails";

export default function ChannelsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("categoryId");
  const movieId = searchParams.get("movieId");
  // Search functionality to be implemented

  const { selectedPlaylist: playlist } = usePlaylistStore();

  const { data: categories, isLoading: isFetchingCategories } =
    trpc.movies.getMoviesCategories.useQuery(
      {
        playlistId: playlist?.id || 0,
      },
      {
        enabled: !!playlist,
      }
    );

  const { data: movies, isLoading: isFetchingMovies } =
    trpc.movies.getMovies.useQuery(
      {
        categoryId: parseInt(selectedCategoryId || "0"),
        playlistId: playlist?.id || 0,
      },
      {
        enabled: !!selectedCategoryId,
      }
    );

  const { data: movie, isLoading: isFetchingMovie } =
    trpc.movies.getMovie.useQuery(
      {
        movieId: parseInt(movieId || "0"),
        url: playlist?.baseUrl || "",
        username: playlist?.username || "",
        password: playlist?.password || "",
      },
      {
        enabled: !!movieId,
      }
    );

  const rowHeight = useDynamicRowHeight({
    defaultRowHeight: 250,
  });

  // Event handlers
  const handleCategoryClick = (categoryId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("categoryId", categoryId.toString());
    params.delete("movieId");
    router.push(`?${params.toString()}`);
  };

  const handleMovieClick = (movieId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("movieId", movieId.toString());
    router.push(`?${params.toString()}`);
  };

  if (!playlist) {
    return (
      <EmptyState
        icon='📺'
        title='No Playlists Found'
        description='Please add a playlist to view channels'
        fullScreen
      />
    );
  }

  return (
    <div className='flex flex-1 overflow-y-auto'>
      <CategoriesSidebar
        categories={categories}
        isLoading={isFetchingCategories}
        selectedCategoryId={selectedCategoryId}
        onCategoryClick={handleCategoryClick}
      />

      <div className='flex-1 overflow-y-auto'>
        {!selectedCategoryId && !movieId && (
          <EmptyState
            icon='📺'
            title='No Categories Found'
            description='Please select a category to view movies'
            fullScreen
          />
        )}
        {isFetchingMovies || (isFetchingMovie && <LoadingSpinner />)}
        {movieId && movie && (
          <ItemsDetails
            image={movie.info.movie_image}
            rating={movie.info.rating}
            releasedate={movie.info.releasedate}
            description={movie.info.plot}
            stream_id={movie.movie_data.stream_id}
            name={movie.movie_data.name}
            container_extension={movie.movie_data.container_extension}
            tmdb={movie.tmdb}
          />
        )}
        {movies && !isFetchingMovies && !isFetchingMovie && !movieId && (
          <div className='p-3'>
            <List
              className='grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3 '
              rowComponent={RowComponent}
              rowCount={movies.length}
              rowHeight={0.3}
              rowProps={{ movies, handleMovieClick }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function RowComponent({
  index,
  movies,
  handleMovieClick,
}: RowComponentProps<{
  movies: Array<{
    id: number;
    streamId: number;
    name: string;
    streamType: string;
    streamIcon: string;
    rating: string;
    added: string;
    categoryId: number;
    playlistId: number;
    containerExtension: string;
    url: string;
  }>;
  handleMovieClick: (movieId: number) => void;
}>) {
  return (
    <ItemsList
      image={movies[index].streamIcon}
      title={movies[index].name}
      rating={movies[index].rating}
      streamId={movies[index].streamId}
      onMovieClick={() => handleMovieClick(movies[index].streamId)}
    />
  );
}
