'use client';

import { Calendar, CheckCircle2, Clock, Play, Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import type { FC } from 'react';

import type { Episode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useWatchedSeriesStore } from '@repo/store';
import { cleanName, formatDate, formatDuration } from '@repo/utils';

interface EpisodeCardProps {
  episode: Episode;
  tmdbPoster?: string;
  fallbackImage: string;
  onSelect: (episode: Episode) => void;
}

export const EpisodeCard: FC<EpisodeCardProps> = ({
  episode,
  tmdbPoster,
  fallbackImage,
  onSelect,
}) => {
  const searchParams = useSearchParams();
  const serieId = searchParams.get('serieId');
  const { getEpisodeProgress } = useWatchedSeriesStore();

  const safeSerieId = serieId ? +serieId : 0;
  const progressData = getEpisodeProgress(safeSerieId, episode.episode_num, episode.season);

  const position = progressData?.position ?? 0;
  const duration = progressData?.duration ?? 0;
  const progress = duration > 0 ? position / duration : 0;
  const progressPercent = Math.min(progress * 100, 100);

  const isWatched = progressPercent >= 95;
  const isInProgress = progress > 0 && !isWatched;

  const imageSrc = episode.info?.movie_image || tmdbPoster || fallbackImage;
  const rating = episode.info?.rating ? Number.parseFloat(episode.info.rating.toString()) : null;
  const isHighRated = rating && rating >= 8.0;

  return (
    <div
      onClick={() => onSelect(episode)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 hover:shadow-2xl hover:shadow-black/60 hover:ring-white/20 active:scale-[0.98]"
      role="button"
      tabIndex={0}
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
        <Image
          src={imageSrc.replace('/w185/', '/w500/') || '/placeholder.svg'}
          alt={episode.title || 'Episode'}
          fill
          className={cn(
            'object-cover transition-all duration-700 group-hover:scale-110',
            isWatched ? 'opacity-50 grayscale' : 'opacity-95 group-hover:opacity-100',
          )}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-50" />

        {/* Play Button Overlay - Cinematic Design */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="relative">
            {/* Pulsing outer ring */}
            <div className="absolute inset-0 animate-ping rounded-full bg-white/30 blur-md" />
            {/* Main button */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 backdrop-blur-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
              <Play className="ml-0.5 h-6 w-6 fill-white text-white drop-shadow-2xl" />
            </div>
          </div>
        </div>

        {/* Status Badges - Top Right */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
          {isWatched && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 ring-1 ring-white/20 backdrop-blur-xl transition-all hover:scale-105">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Watched</span>
            </div>
          )}

          {isInProgress && !isWatched && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1.5 ring-1 ring-white/20 backdrop-blur-xl">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase">Continue</span>
            </div>
          )}

          {isHighRated && !isWatched && !isInProgress && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1.5 ring-1 ring-white/20 backdrop-blur-xl">
              <TrendingUp className="h-3 w-3" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Top</span>
            </div>
          )}
        </div>

        {/* Episode Number - Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <div className="rounded-full bg-black/60 px-3 py-1.5 ring-1 ring-white/20 backdrop-blur-xl">
            <span className="text-xs font-bold tracking-wide text-white">
              E{episode.episode_num}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {isInProgress && (
          <div className="absolute right-0 bottom-0 left-0 h-1 overflow-hidden bg-black/50 backdrop-blur-xl">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-500/50 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Content Section - Refined */}
      <div className="space-y-4 p-5">
        {/* Title and Rating */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h4 className="line-clamp-2 flex-1 text-base leading-tight font-semibold text-white transition-colors duration-300 group-hover:text-white">
              {cleanName(episode.title) || episode.info?.name || `Episode ${episode.episode_num}`}
            </h4>

            {rating && (
              <div className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/15 px-2.5 py-1 backdrop-blur-xl">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Season Badge */}
          <div className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1 backdrop-blur-xl">
            <span className="text-[10px] font-bold tracking-wider text-white/50 uppercase">
              Season {episode.season}
            </span>
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-4">
            {episode.info?.releasedate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-white/40" />
                <span className="text-xs font-medium text-white/40">
                  {formatDate(episode.info.releasedate)}
                </span>
              </div>
            )}
            {episode.info?.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-white/40" />
                <span className="text-xs font-medium text-white/40">
                  {formatDuration(episode.info?.duration)}
                </span>
              </div>
            )}
          </div>

          {isInProgress && duration > 0 && (
            <span className="text-xs font-semibold text-amber-400">
              {Math.floor((duration - position) / 60)}m left
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
