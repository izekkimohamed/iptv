import { Episode } from '@/lib/types';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import { usePlaylistStore } from '@/store/appStore';
import { useWatchedSeriesStore } from '@/store/watchedStore';
import { Calendar, CheckCircle2, Clock, Flame, Play, Star } from 'lucide-react';
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
  const position =
    getEpisodeProgress(safeSerieId, episode.episode_num, episode.season)?.position ?? 0;
  const duration =
    getEpisodeProgress(safeSerieId, episode.episode_num, episode.season)?.duration ?? 0;

  const progress = duration > 0 ? position / duration : 0;
  const progressPercent = Math.min(progress * 100, 100);

  const isWatched = progressPercent >= 95;
  const isInProgress = progress > 0;

  const imageSrc = episode.info?.movie_image || tmdbPoster || fallbackImage;

  // Determine rating level for visual indicator
  const rating = episode.info?.rating ? parseFloat(episode.info.rating.toString()) : 0;
  const isHighRated = rating >= 8;

  return (
    <div
      onClick={() => onSelect(episode)}
      className="relative group cursor-pointer rounded-lg overflow-hidden border border-slate-700 bg-slate-900/20 transition-all duration-300 hover:border-amber-500 hover:shadow-[0_12px_32px_-8px_rgba(245,158,11,0.25)] hover:-translate-y-2 active:translate-y-0"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(episode);
        }
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900/20">
        <Image
          src={imageSrc.replace('/w185/', '/w500/')}
          alt={`Season ${episode.season} Episode ${episode.episode_num}`}
          fill
          className={cn(
            'object-cover transition-all duration-500 group-hover:scale-110',
            isWatched ? 'opacity-50 saturate-200' : '',
          )}
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-3 rounded-full bg-amber-500 shadow-lg shadow-amber-600/30 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>

        {/* Top-right badges */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
          {/* Watched Badge */}
          {isWatched && (
            <div className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-sm border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Watched
            </div>
          )}

          {/* High Rating Badge */}
          {isHighRated && !isWatched && (
            <div className="bg-orange-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-sm border border-orange-500/30">
              <Flame className="w-3.5 h-3.5" /> Hot
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isInProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-800/80 backdrop-blur-sm">
            <div
              className="h-full bg-amber-500 shadow-[inset_0_0_8px_rgba(245,158,11,0.3)]"
              style={{
                width: `${progressPercent}%`,
                transition: 'width 0.3s ease-out',
              }}
            />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Episode Header */}
        <div className="space-y-1">
          <span className="text-amber-400 text-xs font-bold tracking-wider uppercase block">
            Season {episode.season} • Episode {episode.episode_num}
          </span>
          <h4 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-amber-200 transition-colors">
            {episode.title || episode.info?.name || `Episode ${episode.episode_num}`}
          </h4>
        </div>

        {/* Plot Summary */}
        {episode.info?.plot && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{episode.info.plot}</p>
        )}

        {/* Footer with Metadata and Rating */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {episode.info?.releasedate && (
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-slate-600" />
                {formatDate(episode.info.releasedate)}
              </span>
            )}
            {formatDuration(episode.info?.duration || episode.info?.duration_secs) && (
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-slate-600" />
                {formatDuration(episode.info?.duration || episode.info?.duration_secs)}
              </span>
            )}
          </div>

          {/* Rating Badge */}
          {episode.info?.rating && episode.info.rating > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-950 rounded-md border border-amber-900/50 flex-shrink-0 backdrop-blur-sm">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{parseFloat(episode.info.rating.toString()).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover shine effect */}
      <div className="absolute -inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none border border-white rounded-lg" />
    </div>
  );
};
