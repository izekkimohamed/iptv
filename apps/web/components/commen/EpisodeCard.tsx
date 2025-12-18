'use client';

import { Episode } from '@/lib/types';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import { usePlaylistStore } from '@/store/appStore';
import { useWatchedSeriesStore } from '@/store/watchedStore';
import { Calendar, CheckCircle2, Clock, Play, Star } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FC } from 'react';

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
      className="group relative bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden cursor-pointer transition-all duration-500 hover:border-white/30 hover:shadow-2xl active:scale-95"
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {isWatched ? (
            <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border border-emerald-400/50">
              <CheckCircle2 className="w-3 h-3" /> Finished
            </div>
          ) : isInProgress ? (
            <div className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Resuming
            </div>
          ) : null}
        </div>

        {/* Dynamic Progress Bar */}
        {isInProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
              S{episode.season} • E{episode.episode_num}
            </span>
            {episode.info?.rating && (
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-bold tracking-tighter">
                  {parseFloat(episode.info.rating.toString()).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <h4 className="font-bold text-white text-base leading-tight line-clamp-1 group-hover:text-amber-400 transition-colors">
            {episode.title || episode.info?.name || `Episode ${episode.episode_num}`}
          </h4>
        </div>

        {episode.info?.plot && (
          <p className="text-xs text-white/40 line-clamp-2 leading-relaxed font-medium">
            {episode.info.plot}
          </p>
        )}

        {/* Footer Meta */}
        <div className="pt-4 border-t border-white/5 flex items-center gap-4">
          {episode.info?.releasedate && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/20 uppercase tracking-tight">
              <Calendar size={12} />
              {formatDate(episode.info.releasedate)}
            </div>
          )}
          {episode.info?.duration && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/20 uppercase tracking-tight">
              <Clock size={12} />
              {formatDuration(episode.info?.duration)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
