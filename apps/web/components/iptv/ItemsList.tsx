import { cleanName } from '@/lib/utils';
import { usePlaylistStore } from '@/store/appStore';
import { useWatchedMoviesStore, useWatchedSeriesStore } from '@/store/watchedStore';
import { Film, Play, TrendingUp } from 'lucide-react';
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
      {/* Background Image */}
      {image && (image.endsWith('.png') || image.endsWith('.jpg') || image.endsWith('.jpeg')) ? (
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
          {/* Dark overlay */}
          <div className="h-full flex flex-col gap-1 justify-center items-center text-center text-slate-50 bg-gradient-to-br from-slate-800 to-slate-900">
            <Film className="w-14 h-14 text-slate-600 mx-auto" />
            {cleanName(title)}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-center text-slate-50 bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="text-center space-y-3">
            <Film className="w-14 h-14 text-slate-600 mx-auto" />
            <p className="text-xs truncate  px-3">{cleanName(title)}</p>
          </div>
        </div>
      )}

      {/* Play Button - Center Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
        <div className="p-4 rounded-full bg-amber-500 shadow-lg shadow-amber-600/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
          <Play className="w-7 h-7 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Progress Bar */}
      {progressPct > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-800/80 z-30">
          <div
            className="h-full bg-amber-500 shadow-[inset_0_0_6px_rgba(245,158,11,0.3)]"
            style={{
              width: `${Math.min(progressPct * 100, 100)}%`,
              transition: 'width 0.3s ease-out',
            }}
          />
        </div>
      )}

      {/* Top Right Badges */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 items-end">
        {/* Rating Badge */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-md backdrop-blur-sm ${
            isHighRated
              ? 'bg-emerald-950 border-emerald-600'
              : isMediumRated
                ? 'bg-amber-950 border-amber-600'
                : 'bg-slate-900 border-slate-700'
          }`}
        >
          <div className="text-center">
            <div className="text-xs font-bold text-white">{ratingValue}</div>
            <div
              className={`text-[9px] font-semibold ${
                isHighRated
                  ? 'text-emerald-400'
                  : isMediumRated
                    ? 'text-amber-400'
                    : 'text-slate-500'
              }`}
            >
              /10
            </div>
          </div>
        </div>

        {/* Quality Indicator */}
        {isHighRated && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md border border-emerald-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top</span>
          </div>
        )}
      </div>

      {/* Content - Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm transform translate-y-1 group-hover:translate-y-0 transition-all duration-300 border-t border-white/5">
        <div className="space-y-2">
          <h3 className="text-sm text-center font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-200 truncate transition-colors">
            {cleanName(title)}
          </h3>
        </div>
      </div>

      {/* Border shine on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-300 border border-white rounded-lg" />
    </div>
  );
}

export default ItemsList;
