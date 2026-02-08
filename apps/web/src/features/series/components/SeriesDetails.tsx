'use client';

import { Calendar, Play, Star, Tag, Tv } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import { CastSection } from '@/components/common/CastSection';
import { EpisodesSection } from '@/components/common/EpisodesSection';
import { TrailerModal } from '@/components/common/TrailerModels';
import { TrailersSection } from '@/components/common/TrailersSection';
import { Button } from '@/components/ui/button';
import { useTrailerPlayback } from '@/hooks/useDetails';
import { ItemsDetailsProps } from '@/lib/types';
import { usePlaylistStore, useWatchedSeriesStore } from '@repo/store';

type SeriesDetailsProps = Omit<ItemsDetailsProps, 'container_extension'> & {
  seasons: NonNullable<ItemsDetailsProps['seasons']>;
  episodes: NonNullable<ItemsDetailsProps['episodes']>;
};

export default function SeriesDetails({
  description,
  image,
  name,
  rating,
  stream_id,
  seasons,
  episodes,
  tmdb,
}: SeriesDetailsProps) {
  const [imgError, setImgError] = useState(false);
  const searchParams = useSearchParams();
  const serieId = searchParams.get('serieId');
  const urlSeasonId = searchParams.get('seasonId');
  const urlEpisodeNumber = searchParams.get('episodeNumber');

  const { selectedPlaylist } = usePlaylistStore();
  const { series: watchedSeries } = useWatchedSeriesStore();
  const episodesSectionRef = useRef<any>(null);

  if (!selectedPlaylist) return null;

  const { trailer, handleTrailerClick, handleCloseTrailer } = useTrailerPlayback(tmdb?.videos);

  const episodeToPlay = useMemo(() => {
    if (!serieId) return null;

    const serieIdNum = parseInt(serieId);
    const urlSeasonIdNum = urlSeasonId ? parseInt(urlSeasonId) : 1;
    const urlEpisodeNum = urlEpisodeNumber ? parseInt(urlEpisodeNumber) : 1;

    const watchedSerieItem = watchedSeries.find((s) => s.id === serieIdNum);

    if (watchedSerieItem && watchedSerieItem.episodes.length > 0) {
      const lastEpisode = watchedSerieItem.episodes[watchedSerieItem.episodes.length - 1];
      return {
        seasonId: lastEpisode.seasonId,
        episodeNumber: lastEpisode.episodeNumber,
        isResume: true,
      };
    } else {
      return {
        seasonId: urlSeasonIdNum,
        episodeNumber: urlEpisodeNum,
        isResume: false,
      };
    }
  }, [serieId, urlSeasonId, urlEpisodeNumber, watchedSeries]);

  const handlePlayMovie = () => {
    if (episodeToPlay) {
      const episode = episodes[episodeToPlay.seasonId]?.find(
        (ep) => ep.episode_num === episodeToPlay.episodeNumber,
      );
      if (episode && episodesSectionRef.current) {
        episodesSectionRef.current.playEpisode(episode);
      }
    }
  };

  const backdrop = tmdb?.backdrop || image;

  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
      {/* Cinematic Hero Backdrop */}
      <div className="absolute inset-0  w-full">
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
      <div className="relative z-10 mx-auto max-w-[95vw] px-6 pt-[5vh] pb-20 lg:px-16 lg:pt-[5vh]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">

          {/* Poster Card */}
          <div className="relative h-[400px] w-full max-w-[280px] shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-transform duration-500 hover:scale-[1.02] lg:h-[460px] lg:max-w-[320px]">
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
               <div className="flex flex-wrap items-center gap-4">

               <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl drop-shadow-2xl">
                 {name}
               </h1>


            </div>
               {tmdb?.title && tmdb.title !== name && (
                 <p className="text-xl font-medium text-primary/80 italic tracking-tight">
                    {tmdb.title}
                 </p>
               )}
               <div className="flex gap-4">
                    {tmdb?.releaseDate && (
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-bold text-foreground/80 backdrop-blur-md">
                       <Calendar className="h-4 w-4" />
                       {new Date(tmdb.releaseDate).getFullYear()}
                    </div>
                  )}
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-bold text-foreground/80 backdrop-blur-md">
                     <Tv className="h-4 w-4" />
                     {seasons.length} Seasons
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-black text-primary backdrop-blur-md">
                     <Star className="h-4 w-4 fill-current" />
                     {rating ? parseFloat(rating).toFixed(1) : '0.0'} / 10
                  </div>

               </div>
                     {/* Additional Metadata */}
            {tmdb?.genres && (
              <div className="flex flex-wrap gap-2 ">
                {tmdb.genres.map((genre: any) => (
                  <span key={genre.id} className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
               </div>

            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl font-medium">
              {description || tmdb?.overview || "No description available for this series."}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
               <Button
                onClick={handlePlayMovie}
                className="h-16 rounded-2xl px-10 text-lg font-black shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
               >
                  <Play className="mr-3 h-6 w-6 fill-current" />
                  {episodeToPlay?.isResume ? 'Resume' : 'Start Watching'}
               </Button>

               <Button variant="outline" className="h-16 rounded-2xl border-white/10 bg-white/5 px-8 text-lg font-bold backdrop-blur-md transition-all hover:bg-white/10 active:scale-95">
                  <Tag className="mr-2 h-5 w-5" />
                  Add to List
               </Button>
            </div>


          </div>
        </div>

        {/* Sections */}
        <div className="mt-10 space-y-10">
           {/* Episodes Section - Main Attraction for Series */}
           <div data-episodes-section>
             <EpisodesSection
                ref={episodesSectionRef}
                seasons={seasons}
                episodes={episodes}
                tmdbPoster={tmdb?.poster || undefined}
                fallbackImage={image}
                containerExtension={'mp4'}
                streamId={stream_id}
                image={image}
                tmdb={tmdb}
              />
           </div>

           {tmdb?.cast && <CastSection cast={tmdb.cast} />}
           {tmdb?.videos && <TrailersSection videos={tmdb.videos} onTrailerClick={handleTrailerClick} />}
        </div>
      </div>
      <TrailerModal isOpen={!!trailer} onClose={handleCloseTrailer} trailerId={trailer} />

    </div>
  );
}

