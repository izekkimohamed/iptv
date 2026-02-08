import { Check, Film, Play, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { usePlaylistStore, useWatchedMoviesStore, useWatchedSeriesStore } from '@repo/store';
import { cleanName } from '@repo/utils';

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

  return (
    <div
      key={streamId}
      onClick={onMovieClick}
      className="group relative aspect-[2/3] w-full cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(var(--primary),0.2)]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onMovieClick();
        }
      }}
    >
      {/* Image Layer */}
      <div className="absolute inset-0 h-full w-full">
        {!imageError && image !== '' ? (
          <Image
            src={image}
            alt={cleanName(title)}
            fill
            sizes="20vw"
            className={cn(
              'object-cover transition-transform duration-700 ease-in-out group-hover:scale-110',
              isLoading ? 'scale-105 blur-lg' : 'blur-0 scale-100',
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-white/5 text-muted-foreground">
            <Film className="h-10 w-10 opacity-20" />
            <span className="mt-3 text-[10px] font-bold tracking-widest uppercase opacity-40">
              No Poster
            </span>
          </div>
        )}
        {isLoading && <div className="absolute inset-0 animate-pulse bg-white/5" />}
      </div>

      {/* Cinematic Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Hover Play Button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="h-16 w-16 translate-y-4 rounded-full bg-primary opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex h-full w-full items-center justify-center">
               <Play className="ml-1 h-8 w-8 fill-primary-foreground text-primary-foreground" />
            </div>
         </div>
      </div>

      {/* Content Info */}
      <div className="absolute inset-x-0 bottom-0 p-4 pt-10 bg-gradient-to-t from-black via-black/40 to-transparent">
        <h3 className="line-clamp-2 text-base font-bold text-white drop-shadow-md transition-colors group-hover:text-primary">
          {cleanName(title)}
        </h3>

        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-lg bg-black/40 px-2 py-1 text-[10px] font-black text-amber-400 backdrop-blur-md border border-white/5 shadow-lg">
             <Star className="h-3 w-3 fill-current" />
             {ratingValue}
          </div>

          {progressPct >= 0.9 && (
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-tight">
              <Check className="h-3 w-3" /> Watched
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {progressPct > 0 && progressPct < 0.9 && (
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-1000 group-hover:brightness-125"
            style={{ width: `${progressPct * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default ItemsList;

