"use client";
import { trpc } from "@/lib/trpc";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  Film,
  Star,
  User,
  ChevronLeft,
  Play,
  Youtube,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { usePlayerStore } from "@/store/player-store";
import { usePlaylistStore } from "@/store/appStore";
import VideoPlayer from "@/components/videoPlayer";

export default function Page() {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId");
  const { selectedPlaylist } = usePlaylistStore();
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [srcUrl, setSrc] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [poster, setPoster] = useState<string>("");
  const [playing, setPlaying] = useState(false);
  const {
    data: movieDetails,
    isLoading,
    error,
  } = trpc.movies.getTmdbMovieDetails.useQuery(
    {
      tmdbId: parseInt(movieId || "0"),
      playlistId: selectedPlaylist?.id || 0,
    },
    {
      enabled: !!movieId && !!selectedPlaylist,
    }
  );

  if (isLoading) {
    return (
      <div className='flex-1 flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950'>
        <div className='space-y-4 text-center'>
          <div className='w-12 h-12 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto' />
          <p className='text-gray-400 font-medium'>Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex-1 flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950'>
        <div className='space-y-4 text-center'>
          <Film className='w-16 h-16 text-red-500/40 mx-auto' />
          <div>
            <p className='text-red-400 font-semibold'>Error loading movie</p>
            <p className='text-gray-400 text-sm'>{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!movieDetails) {
    return (
      <div className='flex-1 flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950'>
        <p className='text-gray-400'>No movie details available</p>
      </div>
    );
  }

  const ratingPercentage = (movieDetails.tmdb.rating / 10) * 100;

  return (
    <div className='flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative'>
      {/* Background Hero */}
      <div
        className='absolute inset-0 bg-center bg-no-repeat bg-cover'
        style={{
          backgroundImage: `url(${movieDetails.tmdb.backdrop})`,
          backgroundAttachment: "fixed",
        }}
      >
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-black/60 to-black/20' />
      </div>

      {/* Content */}
      <div className='relative z-10'>
        {/* Header */}
        <div className='sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-xl'>
          <div className='max-w-7xl mx-auto px-6 py-4'>
            <button
              onClick={() => window.history.back()}
              className='flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-all'
            >
              <ChevronLeft className='w-5 h-5' />
              <span className='font-medium'>Back</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className='max-w-7xl mx-auto px-6 py-12 space-y-16'>
          {/* Hero Section */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start'>
            {/* Poster */}
            <div className='lg:col-span-1 flex justify-center lg:justify-start'>
              <div className='relative group'>
                <div className='absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-500' />
                <Image
                  src={movieDetails.tmdb.poster}
                  alt={movieDetails.tmdb.title}
                  width={300}
                  height={450}
                  className='relative rounded-xl shadow-2xl w-72 h-auto object-cover border border-white/10'
                  priority
                />
              </div>
            </div>

            {/* Info */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Title */}
              <div className='space-y-3'>
                <h1 className='text-5xl font-bold text-white leading-tight'>
                  {movieDetails.tmdb.title}
                </h1>

                {/* Meta Tags */}
                <div className='flex flex-wrap gap-3 items-center'>
                  {/* Rating */}
                  <div className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'>
                    <Star className='w-5 h-5 text-yellow-400 fill-yellow-400' />
                    <span className='font-bold text-yellow-300'>
                      {movieDetails.tmdb.rating?.toFixed(1)}/10
                    </span>
                  </div>

                  {/* Release Date */}
                  <div className='flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10'>
                    <Calendar className='w-5 h-5 text-gray-300' />
                    <span className='text-sm font-medium text-gray-300'>
                      {new Date(
                        movieDetails.tmdb.releaseDate
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Runtime */}
                  <div className='flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10'>
                    <Clock className='w-5 h-5 text-gray-300' />
                    <span className='text-sm font-medium text-gray-300'>
                      {Math.floor(movieDetails.tmdb.runtime / 60)}h{" "}
                      {movieDetails.tmdb.runtime % 60}m
                    </span>
                  </div>
                </div>
              </div>

              {/* Genres */}
              {movieDetails.tmdb.genres &&
                movieDetails.tmdb.genres.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {movieDetails.tmdb.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className='px-3 py-1.5 text-xs font-medium text-blue-300 bg-blue-500/20 rounded-full border border-blue-500/30'
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

              {/* Director */}
              {movieDetails.tmdb.director && (
                <div className='space-y-2'>
                  <h3 className='text-sm font-semibold text-gray-400 uppercase tracking-wider'>
                    Director
                  </h3>
                  <p className='text-white font-medium'>
                    {movieDetails.tmdb.director}
                  </p>
                </div>
              )}

              {/* Overview */}
              <div className='space-y-2 pt-4'>
                <h3 className='text-lg font-semibold text-white'>Synopsis</h3>
                <p className='text-gray-300 leading-relaxed text-base'>
                  {movieDetails.tmdb.overview}
                </p>
              </div>
              {/* videos urls selector */}
              {movieDetails.dbMovies.map((movie) => (
                <button key={movie.id}>
                  <div
                    onClick={() => {
                      setTitle(movieDetails.tmdb.title);
                      setPoster(movieDetails.tmdb.poster);
                      setSrc(movie.url);
                      setPlaying(true);
                    }}
                    className='px-4 py-2 mt-4 border border-white/10 cursor-pointer text-white rounded-lg  transition'
                  >
                    {movie.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cast Section */}
          {movieDetails.tmdb.cast && movieDetails.tmdb.cast.length > 0 && (
            <section className='space-y-6'>
              <div>
                <h2 className='text-3xl font-bold text-white flex items-center gap-3'>
                  <User className='w-8 h-8' />
                  Cast
                </h2>
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                {movieDetails.tmdb.cast.slice(0, 12).map((actor, idx) => (
                  <div
                    key={idx}
                    className='group rounded-lg overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-300 bg-white/5 hover:bg-white/10'
                  >
                    {actor.profilePath ?
                      <div className='relative h-48 overflow-hidden bg-slate-800'>
                        <Image
                          src={actor.profilePath}
                          alt={actor.name}
                          fill
                          className='object-cover group-hover:scale-110 transition-transform duration-300'
                        />
                      </div>
                    : <div className='h-48 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900'>
                        <User className='w-12 h-12 text-gray-600' />
                      </div>
                    }
                    <p className='px-3 py-2 text-xs font-medium text-center text-gray-200 bg-black/40'>
                      {actor.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Videos/Trailers Section */}
          {movieDetails.tmdb.videos && movieDetails.tmdb.videos.length > 0 && (
            <section className='space-y-6 pb-12'>
              <div>
                <h2 className='text-3xl font-bold text-white flex items-center gap-3'>
                  <Youtube className='w-8 h-8' />
                  Videos
                </h2>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {movieDetails.tmdb.videos
                  .filter((v) => v.site === "YouTube")
                  .map((video) => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedTrailer(video.key)}
                      className='relative group cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20'
                    >
                      <Image
                        src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                        alt={video.name}
                        width={400}
                        height={225}
                        className='w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300'
                      />
                      <div className='absolute inset-0 flex items-center justify-center transition-colors bg-black/40 group-hover:bg-black/60'>
                        <div className='p-3 rounded-full bg-red-600'>
                          <Play className='w-6 h-6 text-white fill-white' />
                        </div>
                      </div>
                      <p className='absolute bottom-0 left-0 right-0 px-3 py-2 text-xs font-medium text-white bg-gradient-to-t from-black/80 to-transparent line-clamp-2'>
                        {video.name}
                      </p>
                    </button>
                  ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      {playing && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='absolute inset-0 bg-black/80 backdrop-blur-md '
            onClick={() => setPlaying(false)}
          />
          <div className='relative z-50 w-full max-w-5xl shadow-2xl rounded-xl '>
            <button
              className='absolute z-50 p-2 text-white cursor-pointer rounded-full -top-16 right-5 hover:bg-white/20 transition-colors'
              onClick={() => setPlaying(false)}
            >
              <X size={28} />
            </button>
            <VideoPlayer src={srcUrl} poster={poster} title={title} autoPlay />
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedTrailer && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='absolute inset-0 bg-black/80 backdrop-blur-lg'
            onClick={() => setSelectedTrailer(null)}
          />
          <div className='relative z-50 w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl'>
            <button
              className='absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-lg transition-colors'
              onClick={() => setSelectedTrailer(null)}
            >
              <ChevronLeft className='w-6 h-6 rotate-180' />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${selectedTrailer}?autoplay=1`}
              title='Movie Trailer'
              className='w-full aspect-video'
              allow='autoplay; encrypted-media'
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
