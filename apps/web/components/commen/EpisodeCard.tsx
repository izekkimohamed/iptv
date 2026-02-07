'use client';

import { Calendar, CheckCircle2, Clock, Play, Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FC } from 'react';

import { Episode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePlaylistStore, useWatchedSeriesStore } from '@repo/store';
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
  const { selectedPlaylist } = usePlaylistStore();
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

  const rating = episode.info?.rating ? parseFloat(episode.info.rating.toString()) : null;
  const isHighRated = rating && rating >= 8.0;

  return (
    <div
      onClick={() => onSelect(episode)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-linear-to-br from-white/[0.07] to-white/2 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
      role="button"
      tabIndex={0}
    >
      {/* Animated border linear */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-amber-500/20 via-yellow-500/20 to-purple-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

      {/* Card border */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 transition-colors duration-300 group-hover:border-white/30" />

      <div className="relative">
        {/* Thumbnail Section */}
        <div className="relative aspect-4/4 w-full overflow-hidden bg-linear-to-br from-white/5 to-transparent">
          <Image
            src={imageSrc.replace('/w185/', '/w500/')}
            alt={episode.title || 'Episode'}
            fill
            className={cn(
              'object-cover transition-all duration-700 group-hover:scale-110',
              isWatched ? 'opacity-40 grayscale' : 'opacity-90 group-hover:opacity-100',
            )}
          />

          {/* linear overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

          {/* Play Button - More prominent */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div className="relative">
              {/* Pulsing glow */}
              <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/50 blur-xl" />
              {/* Play button */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-xl transition-all duration-300 group-hover:scale-110 group-hover:border-amber-400/50 group-hover:bg-amber-500/20">
                <Play className="ml-1 h-7 w-7 fill-white text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Status Badges - Redesigned */}
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
            {isWatched ? (
              <div className="group/badge flex items-center gap-2 rounded-full border border-emerald-400/30 bg-linear-to-r from-emerald-500/90 to-green-500/90 px-3 py-1.5 shadow-lg backdrop-blur-sm transition-all hover:scale-105">
                <CheckCircle2 className="h-3.5 w-3.5 animate-pulse" />
                <span className="text-[10px] font-black tracking-wider uppercase">Watched</span>
              </div>
            ) : isInProgress ? (
              <div className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-linear-to-r from-amber-500/90 to-orange-500/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </div>
                <span className="text-[10px] font-black tracking-wider uppercase">Continue</span>
              </div>
            ) : null}

            {/* High rated badge */}
            {isHighRated && !isWatched && (
              <div className="flex items-center gap-1.5 rounded-full border border-yellow-400/30 bg-linear-to-r from-yellow-500/90 to-amber-500/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                <TrendingUp className="h-3 w-3" />
                <span className="text-[10px] font-black tracking-wider uppercase">Top Rated</span>
              </div>
            )}
          </div>

          {/* Episode number overlay */}
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 backdrop-blur-md">
              <span className="text-[11px] font-black tracking-wider text-white/90">
                E{episode.episode_num}
              </span>
            </div>
          </div>

          {/* Dynamic Progress Bar - Enhanced */}
          {isInProgress && (
            <div className="absolute right-0 bottom-0 left-0">
              <div className="relative h-1.5 overflow-hidden bg-white/10 backdrop-blur-sm">
                <div
                  className="h-full bg-linear-to-r from-amber-400 via-orange-500 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
                {/* Animated shimmer */}
                <div
                  className="absolute inset-y-0 left-0 w-full bg-linear-to-r from-transparent via-white/30 to-transparent"
                  style={{
                    width: `${progressPercent}%`,
                    animation: 'shimmer 2s infinite',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Info Section - Redesigned */}
        <div className="relative space-y-4 p-5">
          {/* Title and Rating */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h4 className="line-clamp-2 flex-1 truncate text-base leading-tight font-bold text-white transition-all duration-300 group-hover:text-amber-400">
                {cleanName(episode.title) || episode.info?.name || `Episode ${episode.episode_num}`}
              </h4>

              {rating && (
                <div className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Season info with better styling */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-[10px] font-black tracking-wider text-white/60">
                SEASON {episode.season}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[10px] font-medium text-white/40">
                Episode {episode.episode_num}
              </span>
            </div>
          </div>

          {/* Footer Meta - Enhanced layout */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex items-center gap-3">
              {episode.info?.releasedate && (
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-white/30 transition-colors group-hover:text-white/40">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(episode.info.releasedate)}</span>
                </div>
              )}
              {episode.info?.duration && (
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-white/30 transition-colors group-hover:text-white/40">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(episode.info?.duration)}</span>
                </div>
              )}
            </div>

            {/* Watch time remaining for in-progress */}
            {isInProgress && duration > 0 && (
              <span className="text-[10px] font-bold text-amber-400">
                {Math.floor((duration - position) / 60)}m left
              </span>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
