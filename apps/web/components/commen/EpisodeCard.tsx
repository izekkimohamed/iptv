'use client';

import { Calendar, CheckCircle2, Clock, Play, Star } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FC } from 'react';

import { Episode } from '@/lib/types';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import { usePlaylistStore } from '@/store/appStore';
import { useWatchedSeriesStore } from '@/store/watchedStore';

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

  return (
    <div
      onClick={() => onSelect(episode)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl transition-all duration-500 hover:border-white/30 hover:shadow-2xl active:scale-95"
      role="button"
      tabIndex={0}
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-white/5">
        <Image
          src={imageSrc.replace('/w185/', '/w500/')}
          alt={episode.title || 'Episode'}
          fill
          className={cn(
            'object-cover transition-all duration-700 group-hover:scale-110',
            isWatched ? 'opacity-30 grayscale' : 'opacity-80 group-hover:opacity-100',
          )}
        />

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 scale-75 transform items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-transform group-hover:scale-100">
            <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          {isWatched ? (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-500 px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-xl">
              <CheckCircle2 className="h-3 w-3" /> Finished
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              </span>
              Resuming
            </div>
          ) : null}
        </div>

        {/* Dynamic Progress Bar */}
        {isInProgress && (
          <div className="absolute right-0 bottom-0 left-0 h-1 bg-white/10">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">
              S{episode.season} • E{episode.episode_num}
            </span>
            {episode.info?.rating && (
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-[10px] font-bold tracking-tighter">
                  {parseFloat(episode.info.rating.toString()).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <h4 className="line-clamp-1 text-base leading-tight font-bold text-white transition-colors group-hover:text-amber-400">
            {episode.title || episode.info?.name || `Episode ${episode.episode_num}`}
          </h4>
        </div>

        {episode.info?.plot && (
          <p className="line-clamp-2 text-xs leading-relaxed font-medium text-white/40">
            {episode.info.plot}
          </p>
        )}

        {/* Footer Meta */}
        <div className="flex items-center gap-4 border-t border-white/5 pt-4">
          {episode.info?.releasedate && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-white/20 uppercase">
              <Calendar size={12} />
              {formatDate(episode.info.releasedate)}
            </div>
          )}
          {episode.info?.duration && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-white/20 uppercase">
              <Clock size={12} />
              {formatDuration(episode.info?.duration)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
