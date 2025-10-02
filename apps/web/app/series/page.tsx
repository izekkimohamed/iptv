"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface MovieInfo {
  movie_image: string;
  genre: string;
  plot: string;
  rating: string;
  releasedate: string;
  description: string;
}

interface MovieData {
  stream_id: number;
  name: string;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string | null;
  direct_source: string;
}

interface Cast {
  name: string;
  profilePath: string | null;
}

interface Genre {
  id: number;
  name: string;
}

interface TMDBDetails {
  id: number;
  title: string;
  overview: string;
  genres: Genre[];
  runtime: number;
  releaseDate: string;
  poster: string;
  backdrop: string;
  director: string;
  cast: Cast[];
  videos: any[];
}

interface MovieDetails {
  info: MovieInfo;
  movie_data: MovieData;
  url: string;
  tmdb?: TMDBDetails;
}

export default function MovieDetailsPage() {
  const router = useRouter();
  const [showFullCast, setShowFullCast] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "cast" | "details">(
    "overview"
  );

  // Sample movie details based on your structure
  const movieDetails: MovieDetails = {
    info: {
      movie_image:
        "https://image.tmdb.org/t/p/w500/vt2IJex3qxZVgbr5nZ6zPpioh1A.jpg",
      genre: "Drama,Romance,TV Movie",
      plot: "Anna Colton, jeune avocate spécialisée dans les divorces, a été élevée par sa tante Belle, à laquelle elle est très attachée. Lors d'un week-end passé ensemble dans la maison familiale, elles découvrent que leur voisin, extrêmement bruyant, n'est autre que Sean Castleberry, un célèbre acteur, en tournage à Seattle. Dès la première rencontre, les deux femmes le détestent. Un mois plus tard, Belle annonce à sa nièce qu'elle est fiancée et qu'elle va se marier dans deux semaines avec... Sean Castleberry !",
      rating: "5.784",
      releasedate: "2016-06-11",
      description:
        "Anna Colton, jeune avocate spécialisée dans les divorces, a été élevée par sa tante Belle, à laquelle elle est très attachée. Lors d'un week-end passé ensemble dans la maison familiale, elles découvrent que leur voisin, extrêmement bruyant, n'est autre que Sean Castleberry, un célèbre acteur, en tournage à Seattle. Dès la première rencontre, les deux femmes le détestent. Un mois plus tard, Belle annonce à sa nièce qu'elle est fiancée et qu'elle va se marier dans deux semaines avec... Sean Castleberry !",
    },
    movie_data: {
      stream_id: 653614,
      name: "|FR| Arrêtez ce mariage !",
      added: "1695498047",
      category_id: "1054",
      container_extension: "mp4",
      custom_sid: null,
      direct_source: "",
    },
    url: "http://vision4k.ottcst.org/movie/PUXD2PID7C/G8ANBPML7Q/653614.mp4",
    tmdb: {
      id: 396393,
      title: "Stop the Wedding",
      overview:
        "A meddling man and woman determined to stop a wedding for the good of the bride and groom instead wind up falling in love with each other.",
      genres: [
        { id: 18, name: "Drama" },
        { id: 10749, name: "Romance" },
        { id: 10770, name: "TV Movie" },
      ],
      runtime: 84,
      releaseDate: "2016-06-11",
      poster: "https://image.tmdb.org/t/p/w500/lRpXOyT9LRalrZTXliXyaPVwsqX.jpg",
      backdrop:
        "https://image.tmdb.org/t/p/w1280/bPLCNemf2DsQAUyoYxxc32K0un.jpg",
      director: "Anne Wheeler",
      cast: [
        {
          name: "Rachel Boston",
          profilePath:
            "https://image.tmdb.org/t/p/w500/lXsexhIX8oMhPnO85M0ocL0GhC2.jpg",
        },
        {
          name: "Niall Matter",
          profilePath:
            "https://image.tmdb.org/t/p/w500/9hlmypLILRkaEVOazFdg11nfsJm.jpg",
        },
        {
          name: "Alan Thicke",
          profilePath:
            "https://image.tmdb.org/t/p/w500/2zHmOX2KYnotwD69ceodaWDfPf8.jpg",
        },
        {
          name: "Teryl Rothery",
          profilePath:
            "https://image.tmdb.org/t/p/w500/16rUSnTH56cKatjd6kjEYEfU4cA.jpg",
        },
        {
          name: "Lini Evans",
          profilePath:
            "https://image.tmdb.org/t/p/w500/t9UDBIC4VuHir47FThMSkSfs8B4.jpg",
        },
        {
          name: "David James Lewis",
          profilePath:
            "https://image.tmdb.org/t/p/w500/6i4FD9BsdDacX4Tma41dBWYVCpw.jpg",
        },
        {
          name: "Brenda Crichlow",
          profilePath:
            "https://image.tmdb.org/t/p/w500/2zdDHbJaTdNDTQQowVSsR3qb751.jpg",
        },
        {
          name: "Sage Brocklebank",
          profilePath:
            "https://image.tmdb.org/t/p/w500/7BFFanLsfc2m4FU7Hvw8GDTGOEt.jpg",
        },
      ],
      videos: [],
    },
  };

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
    return name.replace(/^\|[A-Z]\|\s*/, "");
  };

  const getLanguageFlag = (name: string) => {
    if (name.startsWith("|FR|")) return "🇫🇷";
    if (name.startsWith("|EN|")) return "🇺🇸";
    return "🌍";
  };

  const handleWatchMovie = () => {
    // Navigate to video player or open movie stream
    console.log("Playing movie:", movieDetails.url);
    router.push(
      `/player?url=${encodeURIComponent(movieDetails.url)}&title=${encodeURIComponent(movieDetails.tmdb?.title || cleanMovieName(movieDetails.movie_data.name))}`
    );
  };

  return (
    <div className='overflow-y-auto relative  bg-black/50 backdrop-blur-md'>
      {/* Hero Section with Backdrop */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex  gap-2.5 '>
        <div className='flex gap-6 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 p-3'>
          <Image
            src={movieDetails.tmdb?.poster || movieDetails.info.movie_image}
            alt={
              movieDetails.tmdb?.title ||
              cleanMovieName(movieDetails.movie_data.name)
            }
            className='w-auto h-auto object-fill rounded-lg hidden md:block'
            width={350}
            height={250}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className='space-y-6 overflow-y-auto'>
            <div>
              <h3 className='text-2xl font-bold text-white mb-4'>Story</h3>
              <p className='text-gray-200 leading-relaxed text-lg'>
                {movieDetails.info.description}
              </p>
            </div>

            {movieDetails.tmdb?.director && (
              <div>
                <h4 className='text-lg font-semibold text-white mb-2'>
                  Director
                </h4>
                <p className='text-gray-300'>{movieDetails.tmdb.director}</p>
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='text-lg font-semibold text-white mb-3'>
                  Movie Information
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Release Date:</span>
                    <span className='text-white'>
                      {formatDate(movieDetails.info.releasedate)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Rating:</span>
                    <span className='text-yellow-400 flex items-center'>
                      <span className='mr-1'>⭐</span>
                      {movieDetails.info.rating}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Genre:</span>
                    <span className='text-white'>
                      {movieDetails.info.genre.replace(/,/g, " • ")}
                    </span>
                  </div>
                  {movieDetails.tmdb?.runtime && (
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Duration:</span>
                      <span className='text-white'>
                        {formatRuntime(movieDetails.tmdb.runtime)}
                      </span>
                    </div>
                  )}
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
                      {movieDetails.movie_data.stream_id}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Format:</span>
                    <span className='text-green-400'>
                      {movieDetails.movie_data.container_extension.toUpperCase()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Added:</span>
                    <span className='text-white'>
                      {new Date(
                        parseInt(movieDetails.movie_data.added) * 1000
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Category:</span>
                    <span className='text-white'>
                      {movieDetails.movie_data.category_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Tab Navigation */}

        {/* Tab Content */}
        <div className='bg-white/10 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 space-y-3'>
          <div>
            <h3 className='text-2xl font-bold text-white mb-3'>Cast & Crew</h3>

            {movieDetails.tmdb?.cast && movieDetails.tmdb.cast.length > 0 ?
              <div className='flex gap-6 overflow-x-auto pb-4'>
                {(showFullCast ?
                  movieDetails.tmdb.cast
                : movieDetails.tmdb.cast.slice(0, 12)
                ).map((actor, index) => (
                  <div key={index} className='text-center'>
                    <img
                      src={
                        actor.profilePath ||
                        "https://via.placeholder.com/150x225/1a202c/ffffff?text=No+Photo"
                      }
                      alt={actor.name}
                      className='w-full h-32 object-cover rounded-lg mb-2'
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <h4 className='text-white font-medium text-sm truncate'>
                      {actor.name}
                    </h4>
                  </div>
                ))}
              </div>
            : <div className='text-center py-8'>
                <div className='text-4xl mb-4 opacity-50'>👥</div>
                <p className='text-gray-400'>Cast information not available</p>
              </div>
            }

            {movieDetails.tmdb?.cast && movieDetails.tmdb.cast.length > 12 && (
              <div className='text-center mt-6'>
                <button
                  onClick={() => setShowFullCast(!showFullCast)}
                  className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors'
                >
                  {showFullCast ?
                    "Show Less"
                  : `Show All ${movieDetails.tmdb.cast.length} Cast Members`}
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 className='text-2xl font-bold text-white mb-6'>
              Technical Details
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div>
                <h4 className='text-lg font-semibold text-white mb-4'>
                  Streaming Details
                </h4>
                <div className='space-y-3'>
                  <div className='bg-white/5 rounded-lg p-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-gray-400'>Stream URL:</span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(movieDetails.url)
                        }
                        className='text-purple-400 hover:text-purple-300 text-xs bg-purple-500/20 px-2 py-1 rounded'
                      >
                        Copy URL
                      </button>
                    </div>
                    <div className='mt-2 text-xs text-gray-300 font-mono break-all'>
                      {movieDetails.url}
                    </div>
                  </div>

                  <div className='bg-white/5 rounded-lg p-3'>
                    <span className='text-gray-400'>Container Format:</span>
                    <div className='mt-1'>
                      <span className='bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm'>
                        {movieDetails.movie_data.container_extension.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className='bg-white/5 rounded-lg p-3'>
                    <span className='text-gray-400'>Stream ID:</span>
                    <div className='mt-1 text-white font-mono'>
                      {movieDetails.movie_data.stream_id}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className='text-lg font-semibold text-white mb-4'>
                  Movie Metadata
                </h4>
                <div className='space-y-3'>
                  <div className='bg-white/5 rounded-lg p-3'>
                    <span className='text-gray-400'>TMDB ID:</span>
                    <div className='mt-1 text-white'>
                      {movieDetails.tmdb?.id || "Not available"}
                    </div>
                  </div>

                  <div className='bg-white/5 rounded-lg p-3'>
                    <span className='text-gray-400'>Category ID:</span>
                    <div className='mt-1 text-white'>
                      {movieDetails.movie_data.category_id}
                    </div>
                  </div>

                  <div className='bg-white/5 rounded-lg p-3'>
                    <span className='text-gray-400'>Date Added:</span>
                    <div className='mt-1 text-white'>
                      {new Date(
                        parseInt(movieDetails.movie_data.added) * 1000
                      ).toLocaleString()}
                    </div>
                  </div>

                  <div className='bg-white/5 rounded-lg p-3'>
                    <span className='text-gray-400'>Direct Source:</span>
                    <div className='mt-1 text-white'>
                      {movieDetails.movie_data.direct_source || "Not specified"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
      </div>
    </div>
  );
}
