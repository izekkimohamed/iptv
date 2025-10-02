"use client";

import CategoriesSidebar from "@/components/iptv/CategoriesSidebar";
import MovieDetails from "@/components/iptv/MovieDetails";
import MovieList from "@/components/iptv/MovieList";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChannelsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("categoryId");
  const movieId = searchParams.get("movieId");
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    if (movieId && movie) {
      console.log(JSON.stringify(movie, null, 2));
    }
  }, [movie, movieId]);

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
    <div className='flex overflow-y-auto py-1'>
      <CategoriesSidebar
        categories={categories}
        isLoading={isFetchingCategories}
        selectedCategoryId={selectedCategoryId}
        onCategoryClick={handleCategoryClick}
      />

      <div className='flex-1  overflow-y-auto'>
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
          <MovieDetails
            info={movie.info}
            movie_data={movie.movie_data}
            url={movie.url}
          />
        )}
        {/* <div className='bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-10'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
              <div className='flex flex-col sm:flex-row gap-4'>

                <div className='relative'>
                  <input
                    type='text'
                    placeholder='Search movies...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full sm:w-64 px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent'
                  />
                  <svg
                    className='absolute left-3 top-2.5 h-4 w-4 text-gray-300'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div> */}
        {movies && !isFetchingMovies && !isFetchingMovie && !movieId && (
          <MovieList
            movies={movies}
            onMovieClick={(movie) => {
              handleMovieClick(movie.streamId);
            }}
          />
        )}
      </div>
    </div>
  );
}
