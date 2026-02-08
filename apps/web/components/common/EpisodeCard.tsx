'use client';

import { Calendar, CheckCircle2, Clock, Play, Star } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FC } from 'react';

import { Episode } from '@/lib/types';
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
  const rating = episode.info?.rating ? parseFloat(episode.info.rating.toString()) : null;

  return (
    <div
      onClick={() => onSelect(episode)}
      className="group relative cursor-pointer overflow-hidden rounded-sm bg-white/[0.03] transition-all duration-300 hover:bg-white/[0.06] active:scale-[0.98]"
      role="button"
      tabIndex={0}
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        <Image
          src={imageSrc.replace('/w185/', '/w500/')}
          alt={episode.title || 'Episode'}
          fill
          className={cn(
            'object-cover transition-transform duration-500 group-hover:scale-105',
            isWatched ? 'opacity-40' : 'opacity-100'
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-1 h-6 w-6 fill-current" />
          </div>
        </div>

        {/* Floating Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
            <div className="rounded-sm bg-black/60 px-2 py-1 text-[10px] font-bold text-white/90 backdrop-blur-md">
                E{episode.episode_num}
            </div>
            {isWatched && (
                <div className="flex items-center gap-1 rounded-sm bg-emerald-500/80 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>DONE</span>
                </div>
            )}
        </div>

        {/* Progress Bar */}
        {isInProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="line-clamp-1 text-sm font-bold text-white transition-colors group-hover:text-primary">
              {cleanName(episode.title) || `Episode ${episode.episode_num}`}
            </h4>
            {rating && (
              <div className="flex items-center gap-1 shrink-0 text-amber-400">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
            Season {episode.season} • Episode {episode.episode_num}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-3">
            {episode.info?.releasedate && (
              <div className="flex items-center gap-1 text-[10px] text-white/40">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(episode.info.releasedate)}</span>
              </div>
            )}
            {episode.info?.duration && (
              <div className="flex items-center gap-1 text-[10px] text-white/40">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(episode.info.duration)}</span>
              </div>
            )}
          </div>

          {isInProgress && (
            <span className="text-[10px] font-bold text-primary">
              {Math.max(1, Math.floor((duration - position) / 60))}m left
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
