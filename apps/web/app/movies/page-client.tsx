'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import MovieDetails from '@/features/movies/components/MovieDetails';
import VirtualGrid from '@/shared/components/common/VirtualGrid';
import ItemsList from '@/shared/components/iptv/ItemsList';
import EmptyState from '@/shared/components/ui/EmptyState';
import LoadingSpinner from '@/shared/components/ui/LoadingSpinner';
import { trpc } from '@/shared/lib/trpc';
import { usePlaylistStore } from '@repo/store';
import { Film } from 'lucide-react';

function MoviesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedPlaylist: playlist } = usePlaylistStore();
  const selectedCategoryId = searchParams.get('categoryId');
  const movieId = searchParams.get('movieId');

  const {
    data: infiniteMovies,
    isLoading: isFetchingMovies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.movies.getMovies.useInfiniteQuery(
    {
      categoryId: parseInt(selectedCategoryId || '0'),
      playlistId: playlist?.id || 0,
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!selectedCategoryId,
    },
  );

  const moviesItems = infiniteMovies?.pages.flatMap((page) => page.items) || [];

  useEffect(() => {
    console.log(moviesItems);
  }, [moviesItems]);

  const {
    data: movie,
    isLoading: isFetchingMovie,
    error: movieError,
  } = trpc.movies.getMovie.useQuery(
    {
      movieId: parseInt(movieId || '0'),
      url: playlist?.baseUrl || '',
      username: playlist?.username || '',
      password: playlist?.password || '',
    },
    {
      enabled: !!movieId,
    },
  );

  const handleMovieClick = (movieId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('movieId', movieId.toString());
    router.push(`?${params.toString()}`);
  };

  if (!playlist) {
    return (
      <EmptyState
        icon="📺"
        title="No Playlists Found"
        description="Please add a playlist to view channels"
        fullScreen
      />
    );
  }

  return (
    <>
      <div className="relative flex-1 overflow-y-auto bg-background/50 backdrop-blur-3xl scrollbar-hide">
        {movieError && (
          <EmptyState
            icon="📺"
            title="No Movies Found"
            description="Please try again later"
            fullScreen
            goBack
          />
        )}
        {!selectedCategoryId && !movieId && (
          <EmptyState
            icon={<Film className="h-12 w-12 text-muted-foreground/40" />}
            title="No Categories Found"
            description="Please select a category from the sidebar to start browsing"
            fullScreen
          />
        )}
        {(isFetchingMovies || isFetchingMovie) && (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
        {movieId && movie && (
          <MovieDetails
            image={movie.info.movie_image}
            rating={movie.info.rating}
            description={movie.info.plot}
            stream_id={movie.movie_data.stream_id}
            container_extension={movie.movie_data.container_extension}
            name={movie.movie_data.name}
            tmdb={movie.tmdb}
          />
        )}
        {moviesItems.length > 0 && !isFetchingMovie && !movieId && (
          <VirtualGrid
            className="h-full p-3"
            items={moviesItems}
            renderItem={(movie) => (
              <ItemsList
                image={movie.streamIcon || ''}
                title={movie.name}
                rating={movie.rating || ''}
                streamId={movie.streamId}
                onMovieClick={() => handleMovieClick(movie.streamId)}
                itemType="movie"
              />
            )}
            gapClassName="gap-6"
            onScroll={(e) => {
              const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
              if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
          />
        )}
        {isFetchingNextPage && (
          <div className="flex justify-center p-4">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </>
  );
}

export function MoviesPageContent() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><LoadingSpinner /></div>}>
      <MoviesPageInner />
    </Suspense>
  );
}
