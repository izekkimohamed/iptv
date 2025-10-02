// components/iptv/MovieDetailsCinematic.tsx
import React, { useState } from "react";
import VideoPlayer from "./VideoPlayer";
import Tmdb from "./Tmdb";
import Image from "next/image";
import { usePlaylistStore } from "@/store/appStore";
import { ChevronLeft } from "lucide-react";

interface CastMember {
  name: string;
  role: string;
  image: string;
}

interface RecommendedMovie {
  id: number;
  title: string;
  image: string;
}

interface Trailer {
  title: string;
  videoUrl: string;
}

interface MovieDetailsCinematicProps {
  info?: {
    movie_image: string;
    genre: string;
    plot: string;
    rating: string;
    releasedate: string;
    description: string;
    duration?: string;
    tmdb_id: string;
  };
  movie_data?: {
    stream_id: number;
    name: string;
    container_extension: string;
  };
  url: string;
  cast?: CastMember[];
  recommended?: RecommendedMovie[];
  trailers?: Trailer[];
}

const MovieDetailsCinematic: React.FC<MovieDetailsCinematicProps> = ({
  info,
  movie_data,
  url,
  cast,
  recommended,
  trailers,
}) => {
  const { selectedPlaylist } = usePlaylistStore();
  const [imageError, setImageError] = useState(false);
  const [playing, setPlaying] = useState(false);
  if (!selectedPlaylist || !info || !movie_data) return;
  const { baseUrl, username, password } = selectedPlaylist;
  const srcUrl = `${baseUrl}/movie/${username}/${password}/${movie_data?.stream_id}.mp4`;

  // update the srcUrl object

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const cleanMovieName = (name: string) => {
    return name.replace(/[^|]*\|/g, "");
  };

  return (
    <div className='relative bg-gradient-to-br from-gray-900 to-black text-white font-mono'>
      {/* Hero Section with Parallax Effect */}
      <div className='relative overflow-hidden '>
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 '
          style={{
            backgroundImage: `url(${info?.movie_image})`,
            // filter: "blur(8px) brightness(0.4)",
          }}
        />

        <div className='absolute inset-0 backdrop-blur-md bg-black/50 z-10' />
        <div className='z-10 relative px-4 '>
          <button className='flex gap-1 bg-black/20 hover:bg-black/50 cursor-pointer text-white p-3 rounded-lg transition-colors backdrop-blur-sm border border-white/20'>
            <ChevronLeft width={20} />
            <span>Back to Movies</span>
          </button>
        </div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3  gap-2.5 relative z-10'>
          <div className='flex flex-col xl:flex-row gap-6 bg-black/20 backdrop-blur-md rounded-xl border border-white/20 p-3 flex-1'>
            {/* Poster and Main Info */}
            <div className='justify-center flex'>
              <Image
                src={info?.movie_image || ""}
                alt={movie_data?.name || "Movie Image"}
                className='w-80 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300'
                width={300}
                height={450}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            {/* Movie Details */}
            <div className='space-y-6 flex-1 flex flex-col justify-between'>
              <h1 className='text-5xl   font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text  text-transparent mb-2'>
                {cleanMovieName(movie_data.name)}
              </h1>
              <div>
                <h3 className='text-xl font-bold text-white mb-4'>Sypnosis</h3>
                <p className='text-gray-200  leading-relaxed text-lg'>
                  {info?.description}
                </p>
              </div>

              {/* {tmdb?.director && (
              <div>
                <h4 className='text-lg font-semibold text-white mb-2'>
                  Director
                </h4>
                <p className='text-gray-300'>{tmdb.director}</p>
              </div>
            )} */}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='text-lg font-semibold text-white mb-3'>
                    Movie Information
                  </h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Release Date:</span>
                      <span className='text-white'>
                        {/* {formatDate(info?.releasedate)} */}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Rating:</span>
                      <span className='text-yellow-400 flex items-center'>
                        <span className='mr-1'>⭐</span>
                        {/* {info.rating} */}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Genre:</span>
                      <span className='text-white'>
                        {info?.genre.replace(/,/g, " • ")}
                      </span>
                    </div>
                    {/* {tmdb?.runtime && (
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Duration:</span>
                      <span className='text-white'>
                        {formatRuntime(tmdb.runtime)}
                      </span>
                    </div>
                  )} */}
                  </div>
                </div>

                <div>
                  <h4 className='text-lg font-semibold text-white mb-3'>
                    Streaming Information
                  </h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Stream ID:</span>
                      <span className='text-white'>
                        {movie_data?.stream_id}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Format:</span>
                      <span className='text-green-400'>
                        {movie_data?.container_extension.toUpperCase()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Added:</span>
                      <span className='text-white'>
                        {/* {new Date(
                        parseInt(movie_data?.added) * 1000
                      ).toLocaleDateString()} */}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Category:</span>
                      <span className='text-white'>
                        {movie_data?.stream_id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className=' flex flex-wrap gap-4 z-20 justify-center'>
                <button
                  className='flex bg-purple-600  hover:bg-purple-700 cursor-pointer text-white px-6 py-3 rounded-lg transition-colors backdrop-blur-sm border border-purple-600/20'
                  disabled={!srcUrl}
                  onClick={() => setPlaying(true)}
                >
                  <svg
                    className='w-5 h-5 mr-2'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M8 5v14l11-7z' />
                  </svg>
                  Watch Movie
                </button>

                <button className='bg-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors backdrop-blur-sm border border-white/20'>
                  Add to Watchlist
                </button>

                <button className='bg-white/20 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors backdrop-blur-sm border border-white/20'>
                  Download Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {playing && (
        <div className='h-3/4  flex w-3/4 mx-auto justify-center items-center z-30 py-4'>
          <VideoPlayer src={srcUrl} />
        </div>
      )}
      {/* Content Sections */}
      {/* {info && movie_data && (
        <Tmdb
          tmdbId={+info.tmdb_id}
          name={movie_data.name}
          year={new Date(info.releasedate).getFullYear()}
        />
      )} */}
    </div>
  );
};

export default MovieDetailsCinematic;
