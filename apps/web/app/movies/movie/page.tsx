'use client';
import {
  Calendar,
  ChevronDown, // 💡 Imported for the dropdown
  ChevronLeft,
  Clock,
  Film,
  Play,
  User,
  Youtube,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { TrailerModal } from '@/components/commen/TrailerModels';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { VideoPlayerModal } from '@/src/shared/components/common/VideoPlayerModal';
import { usePlaylistStore } from '@repo/store';

export default function Page() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const movieId = searchParams.get('movieId');
  const { selectedPlaylist } = usePlaylistStore();
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [srcUrl, setSrc] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [poster, setPoster] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dbMovieId, setDbMovieId] = useState<string>('');
  const [playing, setPlaying] = useState(false);
  // 💡 NEW STATE for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    data: movieDetails,
    isLoading,
    error,
  } = trpc.movies.getTmdbMovieDetails.useQuery(
    {
      tmdbId: parseInt(movieId || '0'),
      playlistId: selectedPlaylist?.id || 0,
    },
    {
      enabled: !!movieId && !!selectedPlaylist,
    },
  );

  // 💡 Use useMemo to track the currently selected movie source for dropdown display
  const currentMovieSource = useMemo(() => {
    if (
      !movieDetails ||
      movieDetails.length === 0 ||
      !movieDetails[0].dbMovies ||
      movieDetails[0].dbMovies.length === 0
    )
      return null;
    return (
      movieDetails[0].dbMovies.find((movie) => movie.url === srcUrl) || movieDetails[0].dbMovies[0]
    );
  }, [movieDetails, srcUrl]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-500" />
          <p className="font-medium text-gray-400">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="space-y-4 text-center">
          <Film className="mx-auto h-16 w-16 text-red-500/40" />
          <div>
            <p className="font-semibold text-red-400">Error loading movie</p>
            <p className="text-sm text-gray-400">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!movieDetails || movieDetails.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-400">No movie details available</p>
      </div>
    );
  }

  // Helper function to set movie state and start playing
  const handlePlayMovie = (movie: any) => {
    setTitle(movieDetails[0].tmdb.title);
    setPoster(movieDetails[0].tmdb.poster || '');
    setSrc(movie.url);
    setCategoryId(movie.categoryId.toString());
    setDbMovieId(movie.streamId.toString());
    setPlaying(true);
    setIsDropdownOpen(false); // Close dropdown on selection
  };

  const hasMultipleSources = movieDetails[0].dbMovies.length > 1;

  return (
    <div className="relative flex-1 overflow-y-auto">
      {/* Background Hero */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${movieDetails[0].tmdb.backdrop})`,
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-black/60 to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <Button
              onClick={() => window.history.back()}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white transition-all hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl space-y-16 px-6 py-12">
          {/* Hero Section */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-12">
            {/* Poster */}
            <div className="flex justify-center lg:col-span-1 lg:justify-start">
              <div className="group relative">
                <div className="absolute -inset-2 rounded-xl bg-amber-500/50 opacity-40 blur transition duration-500 group-hover:opacity-70" />
                <Image
                  src={
                    movieDetails[0].tmdb.poster ||
                    'https://via.placeholder.com/300x450?text=No+Poster'
                  }
                  alt={movieDetails[0].tmdb.title}
                  width={300}
                  height={450}
                  className="relative h-auto w-72 rounded-xl border border-white/10 object-cover shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6 lg:col-span-2">
              {/* Title */}
              <div className="space-y-3">
                <h1 className="text-5xl leading-tight font-bold text-white">
                  {movieDetails[0].tmdb.title}
                </h1>

                {/* Meta Tags */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Rating - TODO: Add rating to schema */}
                  {/* <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-yellow-300">
                      {movieDetails[0].tmdb.rating?.toFixed(1)}/10
                    </span>
                  </div> */}

                  {/* Release Date */}
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                    <Calendar className="h-5 w-5 text-gray-300" />
                    <span className="text-sm font-medium text-gray-300">
                      {new Date(movieDetails[0].tmdb.releaseDate || '').toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </span>
                  </div>

                  {/* Runtime */}
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                    <Clock className="h-5 w-5 text-gray-300" />
                    <span className="text-sm font-medium text-gray-300">
                      {Math.floor((movieDetails[0].tmdb.runtime || 0) / 60)}h{' '}
                      {(movieDetails[0].tmdb.runtime || 0) % 60}m
                    </span>
                  </div>
                </div>
              </div>

              {/* Genres */}
              {movieDetails[0].tmdb.genres && movieDetails[0].tmdb.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movieDetails[0].tmdb.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div className="space-y-2 pt-4">
                <h3 className="text-lg font-semibold text-white">Synopsis</h3>
                <p className="text-base leading-relaxed text-gray-300">
                  {movieDetails[0].tmdb.overview}
                </p>
              </div>

              {/* 💡 REFACTORED: Primary Play Button and Source Selector Dropdown */}
              {movieDetails[0].dbMovies.length > 0 ? (
                <div className="flex items-center gap-4 pt-4">
                  {/* Primary Play Button */}
                  <Button
                    onClick={() => handlePlayMovie(movieDetails[0].dbMovies[0])}
                    className="flex transform items-center gap-2 rounded-full bg-amber-600 px-8 py-3 text-lg font-bold text-white shadow-lg shadow-amber-500/50 transition duration-300 hover:scale-[1.02] hover:bg-amber-700"
                  >
                    <Play className="h-5 w-5 fill-white" />
                    Watch Now
                  </Button>

                  {/* Source Selector Dropdown */}
                  {hasMultipleSources && (
                    <div className="relative">
                      <Button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white transition duration-200 hover:bg-white/20"
                      >
                        <span className="max-w-37.5 truncate">
                          Source: {currentMovieSource?.name || 'Select Source'}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isDropdownOpen ? 'rotate-180' : 'rotate-0'
                          }`}
                        />
                      </Button>

                      {isDropdownOpen && (
                        <div className="absolute left-0 z-30 mt-2 max-h-60 w-56 origin-top-left overflow-y-auto rounded-lg border border-white/20 bg-slate-900 shadow-xl">
                          {movieDetails[0].dbMovies.map((movie) => (
                            <div
                              key={movie.id}
                              onClick={() => handlePlayMovie(movie)}
                              className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                                movie.url === currentMovieSource?.url
                                  ? 'bg-amber-600/50 font-semibold text-white'
                                  : 'text-gray-200 hover:bg-white/10'
                              }`}
                            >
                              {movie.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 py-6 text-gray-400">
                  <p className="text-lg font-semibold text-red-400">No videos available</p>
                  <span>We are working to add a source soon!</span>
                </div>
              )}
              {/* 💡 END REFACTORED SECTION */}
            </div>
          </div>

          {/* Cast Section */}
          {movieDetails[0].tmdb.cast && movieDetails[0].tmdb.cast.length > 0 && (
            <section className="space-y-6">
              <div>
                <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
                  <User className="h-8 w-8 text-white" />
                  Cast
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {movieDetails[0].tmdb.cast.slice(0, 12).map((actor, idx) => (
                  <div
                    key={idx}
                    className="group overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all duration-300 hover:border-amber-500/50 hover:bg-white/10"
                  >
                    {actor.profilePath ? (
                      <div className="relative h-48 overflow-hidden bg-slate-800">
                        <Image
                          src={actor.profilePath}
                          alt={actor.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-linear-to-br from-slate-800 to-slate-900">
                        <User className="h-12 w-12 text-gray-600" />
                      </div>
                    )}
                    <p className="bg-black/40 px-3 py-2 text-center text-xs font-medium text-gray-200">
                      {actor.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Videos/Trailers Section */}
          {movieDetails[0].tmdb.videos && movieDetails[0].tmdb.videos.length > 0 && (
            <section className="space-y-6 pb-12">
              <div>
                <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
                  <Youtube className="h-8 w-8 text-red-500" />
                  Videos & Trailers
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {movieDetails[0].tmdb.videos
                  .filter((v) => v.site === 'YouTube')
                  .map((video) => (
                    <Button
                      key={video.id}
                      onClick={() => setSelectedTrailer(video.key)}
                      className="group relative h-[200] cursor-pointer overflow-hidden rounded-lg border border-white/10 transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20"
                    >
                      <Image
                        src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                        alt={video.name}
                        width={400}
                        height={225}
                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/60">
                        <div className="rounded-full bg-red-600 p-3">
                          <Play className="h-6 w-6 fill-white text-white" />
                        </div>
                      </div>
                      <p className="absolute right-0 bottom-0 left-0 line-clamp-2 bg-linear-to-t from-black/80 to-transparent px-3 py-2 text-xs font-medium text-white">
                        {video.name}
                      </p>
                    </Button>
                  ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Modals */}
      <VideoPlayerModal
        isOpen={playing}
        onClose={() => setPlaying(false)}
        src={srcUrl}
        poster={poster}
        title={title}
        autoPlay
        categoryId={categoryId}
        serieId={null}
        movieId={dbMovieId}
        totalEpisodes={0}
      />

      {/* Video Modal (Trailer) */}
      {selectedTrailer && (
        <TrailerModal
          isOpen={!!selectedTrailer}
          onClose={() => setSelectedTrailer(null)}
          trailerId={selectedTrailer}
        />
      )}
    </div>
  );
}
