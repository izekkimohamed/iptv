'use client';

import { trpc } from '@/lib/trpc';
import VirtualGrid from '@/src/shared/components/common/VirtualGrid';
import { usePlaylistStore } from '@/store/appStore';
import { useRouter, useSearchParams } from 'next/navigation';

import ItemsList from '@/components/iptv/ItemsList';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MovieDetails from '@/features/movies/components/MovieDetails';

export default function MoviesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get('categoryId');
  const movieId = searchParams.get('movieId');

  const { selectedPlaylist: playlist } = usePlaylistStore();

  const { data: movies, isLoading: isFetchingMovies } = trpc.movies.getMovies.useQuery(
    {
      categoryId: parseInt(selectedCategoryId || '0'),
      playlistId: playlist?.id || 0,
    },
    {
      enabled: !!selectedCategoryId,
    },
  );

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

  // Event handlers

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
      <div className="flex-1 min-h-full overflow-y-auto">
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
            icon="📺"
            title="No Categories Found"
            description="Please select a category to view movies"
            fullScreen
          />
        )}
        {isFetchingMovies || (isFetchingMovie && <LoadingSpinner fullScreen />)}
        {movieId && movie && (
          <MovieDetails
            image={movie.info.movie_image}
            rating={movie.info.rating}
            description={movie.info.plot}
            stream_id={movie.movie_data.stream_id}
            name={movie.movie_data.name}
            container_extension={movie.movie_data.container_extension}
            tmdb={movie.tmdb}
          />
        )}
        {movies && !isFetchingMovies && !isFetchingMovie && !movieId && (
          <div className="bg-gradient-to-b from-slate-900/40 to-slate-950 min-h-full">
            <VirtualGrid
              className="h-full p-5 "
              items={movies}
              renderItem={(movie) => (
                <ItemsList
                  image={movie.streamIcon}
                  title={movie.name}
                  rating={movie.rating}
                  streamId={movie.streamId}
                  onMovieClick={() => handleMovieClick(movie.streamId)}
                  itemType="movie"
                />
              )}
              minItemWidth={230}
              estimateItemHeight={360}
              gapClassName="gap-3"
            />
          </div>
        )}
      </div>
    </>
  );
}
