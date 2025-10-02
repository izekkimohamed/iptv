// components/iptv/MovieList.tsx
import Image from "next/image";
import React from "react";

interface Movie {
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
}

interface MovieListProps {
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

const MovieList: React.FC<MovieListProps> = ({ movies, onMovieClick }) => {
  if (!movies || movies.length === 0) {
    return <p className='p-4 text-gray-500'>No movies available</p>;
  }
  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const cleanMovieName = (name: string) => {
    return name.replace(/^\|[A-Z]{2}\|\s*/, "");
  };
  return (
    <div className='grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3 p-4 overflow-y-auto'>
      {movies.map((movie) => (
        <div
          key={movie.streamId}
          onClick={() => onMovieClick(movie)}
          className='bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer group  relative h-[400]'
        >
          <div
            className='absolute inset-0 flex items-center justify-center bg-black/50
          backdrop-filter backdrop-blur-sm
          '
          >
            <p className='line-clamp-2 text-white text-center font-semibold text-sm'>
              {movie.name}
            </p>
          </div>
          <Image
            fill
            src={movie.streamIcon}
            alt={cleanMovieName(movie.name)}
            className='w-auto h-auto object-cover'
            sizes={"230px"}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
            <div className='bg-white/20 rounded-full p-3'>
              <svg
                className='w-8 h-8 text-white'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M8 5v14l11-7z' />
              </svg>
            </div>
          </div>
          <div className='absolute top-2 right-2 flex space-x-2'>
            <div className='flex items-center bg-black/60 text-yellow-400 text-xs px-2 py-1 rounded-full'>
              <span>⭐</span>
              <span className='ml-1'>{movie.rating}</span>
            </div>
          </div>

          <div className='p-4 absolute bottom-0 left-0 right-0 bg-black/60 backdrop-filter backdrop-blur-md h-20'>
            <h3 className='font-semibold text-center text-white text-sm mb-2 line-clamp-2'>
              {cleanMovieName(movie.name)}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieList;
