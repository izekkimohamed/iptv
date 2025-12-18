import { cleanName } from '@/lib/utils';
import { usePlaylistStore } from '@/store/appStore';
import { useWatchedMoviesStore, useWatchedSeriesStore } from '@/store/watchedStore';
import { Film, Play } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

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
  const [loaded, setLoaded] = useState(false);
  const { selectedPlaylist } = usePlaylistStore();
  const { getProgress: getMovieProgress } = useWatchedMoviesStore();
  const { getProgress: getSeriesProgress } = useWatchedSeriesStore();
  const type = itemType;
  const progressPct =
    type === 'movie'
      ? (() => {
          const item = getMovieProgress(streamId, selectedPlaylist?.id || 0);
          if (!item || !item.duration) return 0;
          return Math.min(item.position / item.duration, 1);
        })()
      : type === 'series'
        ? Math.min(getSeriesProgress(streamId, selectedPlaylist?.id || 0) || 0, 1)
        : 0;

  // Determine rating tier
  const isHighRated = ratingNum >= 8;
  const isMediumRated = ratingNum >= 6 && ratingNum < 8;

  return (
    <div
      key={streamId}
      onClick={onMovieClick}
      className="relative h-[320px] rounded-lg overflow-hidden cursor-pointer group border border-slate-700 hover:border-amber-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_40px_-8px_rgba(245,158,11,0.3)]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onMovieClick();
        }
      }}
    >
      {/* Background Poster Image */}
      <div className="absolute inset-0 z-0">
        {image && (image.startsWith('http') || image.startsWith('/')) ? (
          <>
            <Image
              src={image}
              alt={cleanName(title)}
              fill
              className="transition-all duration-500 group-hover:scale-105"
              priority={false}
              onLoad={() => setLoaded(true)}
              onError={(e) => {
                e.currentTarget.src = './icon.png';

                e.currentTarget.height = 0;

                e.currentTarget.width = 0;

                e.currentTarget.style.display = 'none';

                e.currentTarget.style.visibility = 'hidden';
              }}
            />

            {!loaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-800 to-slate-900" />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white/2">
            <Film className="w-12 h-12 text-white/10" />
          </div>
        )}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col p-2">
        {/* Top Row: Rating & Play Status */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            <span className="text-sm font-black text-white/90">
              <span className="text-amber-400">{ratingValue}</span>{' '}
              <span className="text-white/40 font-bold ml-0.5">IMDB</span>
            </span>
          </div>

          {progressPct > 0 && (
            <div className="flex items-center gap-1.5 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[9px] font-black text-green-400 uppercase tracking-tighter">
                Resuming
              </span>
            </div>
          )}
        </div>

        {/* Center: Play Icon (Visible on Hover) */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom: Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white text-center leading-tight line-clamp-2 drop-shadow-md">
            {cleanName(title)}
          </h3>
        </div>
      </div>

      {/* Progress Bar (Matches the "Live Clock" green accent style) */}
      {progressPct > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
          <div
            className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-500"
            style={{ width: `${progressPct * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default ItemsList;
