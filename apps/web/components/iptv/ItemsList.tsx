import { Check, Film, Play, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { usePlaylistStore, useWatchedMoviesStore, useWatchedSeriesStore } from '@repo/store';
import { cleanName } from '@repo/utils'; // Assuming cn exists in utils, if not standard clsx/tailwind-merge

interface ItemsListProps {
  streamId: number;
  title: string;
  image: string;
  rating: string;
  onMovieClick: () => void;
  itemType?: 'movie' | 'series';
}

function ItemsList(props: ItemsListProps) {
  const { image, title, rating, streamId, onMovieClick, itemType } = props;

  // Logic
  const ratingValue = Number(rating).toFixed(1);
  const ratingNum = Number(ratingValue);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { selectedPlaylist } = usePlaylistStore();
  const { getProgress: getMovieProgress } = useWatchedMoviesStore();
  const { getProgress: getSeriesProgress } = useWatchedSeriesStore();

  const progressPct =
    itemType === 'movie'
      ? (() => {
          const item = getMovieProgress(streamId, selectedPlaylist?.id || 0);
          if (!item || !item.duration) return 0;
          return Math.min(item.position / item.duration, 1);
        })()
      : itemType === 'series'
        ? Math.min(getSeriesProgress(streamId, selectedPlaylist?.id || 0) || 0, 1)
        : 0;

  // Visual Logic
  const isHighRated = ratingNum >= 7.5;
  const isAvgRated = ratingNum >= 5 && ratingNum < 7.5;

  const ratingColor = isHighRated
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/20'
    : isAvgRated
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/20'
      : 'text-rose-400 border-rose-500/30 bg-rose-500/20';

  return (
    <div
      key={streamId}
      onClick={onMovieClick}
      className="group relative aspect-[2/3] w-full cursor-pointer overflow-hidden rounded-xl bg-neutral-900 shadow-2xl transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] hover:ring-2 hover:ring-amber-500/50"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onMovieClick();
        }
      }}
    >
      {/* 1. IMAGE LAYER */}
      <div className="absolute inset-0 h-full w-full">
        {!imageError && image !== '' ? (
          <Image
            src={image}
            alt={cleanName(title)}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className={cn(
              'object-cover transition-transform duration-700 ease-in-out group-hover:scale-110',
              isLoading ? 'scale-105 blur-lg' : 'blur-0 scale-100',
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-800 text-neutral-600">
            <Film className="h-12 w-12 opacity-20" />
            <span className="mt-2 text-[10px] font-medium tracking-widest uppercase opacity-40">
              No Poster
            </span>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && <div className="absolute inset-0 animate-pulse bg-neutral-800/50" />}
      </div>

      {/* 2. OVERLAY GRADIENT (Cinematic Darkening) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:via-black/40 group-hover:opacity-80" />

      {/* 3. HOVER PLAY BUTTON CENTER */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
        <div className="flex h-16 w-16 scale-50 items-center justify-center rounded-full bg-amber-500/90 text-white shadow-[0_0_30px_rgba(245,158,11,0.6)] backdrop-blur-sm transition-all duration-300 group-hover:scale-100 hover:bg-amber-400">
          <Play className="ml-1 h-7 w-7 fill-current" />
        </div>
      </div>

      {/* 4. CONTENT INFO (Bottom) */}
      <div className="absolute bottom-0 left-0 w-full p-4">
        <h3 className="line-clamp-2 text-lg leading-tight font-bold text-white drop-shadow-md transition-colors group-hover:text-amber-400">
          {cleanName(title)}
        </h3>

        <div className="mt-2 flex items-center justify-between">
          {/* Rating Badge */}
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-2 py-1 backdrop-blur-md',
              ratingColor,
            )}
          >
            <Star className="h-3 w-3 fill-current" />
            <span className="text-xs font-bold">{ratingValue}</span>
          </div>

          {/* Watched Status (Small Checkmark if completed, else nothing) */}
          {progressPct >= 0.9 && (
            <div className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
              <Check className="h-3 w-3" /> Watched
            </div>
          )}
        </div>
      </div>

      {/* 5. PROGRESS BAR (Integrated at bottom) */}
      {progressPct > 0 && progressPct < 0.9 && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-white/10 backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ width: `${progressPct * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default ItemsList;
