'use client';

import { Calendar, Clock, Play, Star, Tag } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { CastSection } from '@/components/common/CastSection';
import { TrailerModal } from '@/components/common/TrailerModels';
import { TrailersSection } from '@/components/common/TrailersSection';
import { Button } from '@/components/ui/button';
import { useMoviePlayback, useStreamingUrls, useTrailerPlayback } from '@/hooks/useDetails';
import { VideoPlayerModal } from '@/shared/components/common/VideoPlayerModal';
import { usePlaylistStore, useWatchedMoviesStore } from '@repo/store';

interface MovieDetailsProps {
  image: string;
  rating: string;
  description: string;
  stream_id: number;
  container_extension: string;
  name: string;
  tmdb?: any;
}

export default function MovieDetails({
  image,
  rating,
  description,
  stream_id,
  container_extension,
  name,
  tmdb,
}: MovieDetailsProps) {
  const [imgError, setImgError] = useState(false);
  const searchParams = useSearchParams();
  const movieIdParam = searchParams.get('movieId');
  const categoryIdParam = searchParams.get('categoryId');

  const { selectedPlaylist } = usePlaylistStore();
  const { getProgress } = useWatchedMoviesStore();

  const {
    playing,
    handlePlayMovie,
    handleCloseMovie,
  } = useMoviePlayback(searchParams.get('play') === 'true');

  const { trailer, handleTrailerClick, handleCloseTrailer } = useTrailerPlayback(
    tmdb?.videos,
  );

  const { srcUrl } = useStreamingUrls(selectedPlaylist, stream_id.toString(), container_extension);

  if (!selectedPlaylist) return null;

  const backdrop = tmdb?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${tmdb.backdrop_path}`
    : image;

  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
      {/* Cinematic Hero Backdrop */}
      <div className="absolute inset-0 w-full">
        <Image
          src={backdrop}
          alt={name}
          fill
          className="object-cover opacity-50 blur-[1px]"
          priority
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-background/70 " />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 via-50% to-transparent to-100%" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent from-10% via-50% to-100% hidden lg:block" />

      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-[95vw] px-6 pt-[5vh] pb-20 lg:px-16 lg:pt-[5vh] space-y-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">

          {/* Poster Card */}
          <div className="relative h-[480px] w-full max-w-[320px] shrink-0 overflow-hidden rounded-sm border border-white/10 shadow-2xl transition-transform duration-500 hover:scale-[1.02] lg:h-[540px] lg:max-w-[360px]">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 320px, 360px"
              onError={(e) => { e.currentTarget.src = '/icon.png'; }}
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
          </div>

          {/* Info Section */}
          <div className="flex-1 space-y-8 max-w-4xl">
            <div className="space-y-4">


               <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-2xl lg:text-5xl drop-shadow-2xl">
                 {name}
               </h1>

               {tmdb?.tagline && (
                 <p className="text-xl font-medium text-primary/80 italic tracking-tight">
                    {tmdb.tagline}
                 </p>
               )}
                    <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-black text-primary backdrop-blur-md">
                     <Star className="h-4 w-4 fill-current" />
                     {parseFloat(rating).toFixed(1)} / 10
                  </div>
                  {tmdb?.release_date && (
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-bold text-foreground/80 backdrop-blur-md">
                       <Calendar className="h-4 w-4" />
                       {new Date(tmdb.release_date).getFullYear()}
                    </div>
                  )}
                  {tmdb?.runtime && (
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-bold text-foreground/80 backdrop-blur-md">
                       <Clock className="h-4 w-4" />
                       {Math.floor(tmdb.runtime / 60)}h {tmdb.runtime % 60}m
                    </div>
                  )}
               </div>
                {/* Additional Metadata */}
            {tmdb?.genres && (
              <div className="flex flex-wrap gap-2 pt-6">
                {tmdb.genres.map((genre: any) => (
                  <span key={genre.id} className="rounded-sm border border-white/5 bg-white/5 px-3 py-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
            </div>

            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl font-medium">
              {description || tmdb?.overview || "No description available for this title."}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
               <Button
                onClick={handlePlayMovie}
                className="h-16 rounded-sm px-10 text-lg font-black shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
               >
                  <Play className="mr-3 h-6 w-6 fill-current" />
                  Watch Now
               </Button>

               <Button variant="outline" className="h-16 rounded-sm border-white/10 bg-white/5 px-8 text-lg font-bold backdrop-blur-md transition-all hover:bg-white/10 active:scale-95">
                  <Tag className="mr-2 h-5 w-5" />
                  Add to List
               </Button>
            </div>


          </div>
        </div>

        {/* Sections: Cast & Trailers */}

           {tmdb?.cast && <CastSection cast={tmdb.cast} />}
           {tmdb?.videos && <TrailersSection videos={tmdb.videos} onTrailerClick={handleTrailerClick} />}

      </div>

      {/* Modals */}
      <VideoPlayerModal
        isOpen={playing}
        onClose={handleCloseMovie}
        src={srcUrl}
        poster={image}
        title={name}
        autoPlay
        categoryId={categoryIdParam}
        serieId={null}
        movieId={movieIdParam}
        totalEpisodes={0}
      />

      <TrailerModal isOpen={!!trailer} onClose={handleCloseTrailer} trailerId={trailer} />
    </div>
  );
}
