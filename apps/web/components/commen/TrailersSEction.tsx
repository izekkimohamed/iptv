import { Play } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

import { TrailersSectionProps } from '@/lib/types';

import { Button } from '../ui/button';

export const TrailersSection: FC<TrailersSectionProps> = ({ videos, onTrailerClick }) => {
  const youtubeVideos = videos?.filter((v) => v.site === 'YouTube').slice(0, 6) ?? [];

  if (youtubeVideos.length === 0) return null;

  return (
    <div className="mt-16 space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-red-700 bg-red-950 p-3">
          <Play className="h-6 w-6 text-red-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Trailers</h2>
          <p className="mt-1 text-sm text-slate-400">Watch promotional videos</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {youtubeVideos.map((video) => (
          <Button
            key={video.id}
            onClick={() => onTrailerClick(video.key)}
            className="group relative h-[200] cursor-pointer overflow-hidden rounded-lg border border-white/10 transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onTrailerClick(video.key);
              }
            }}
          >
            <Image
              src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
              alt={video.name}
              width={400}
              height={225}
              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/60">
              <div className="rounded-full bg-red-600 p-3">
                <Play className="h-6 w-6 fill-white text-white" />
              </div>
            </div>
            <p className="absolute right-0 bottom-0 left-0 line-clamp-2 bg-linear-to-t from-black/80 to-transparent px-3 py-2 text-xs font-medium text-white">
              {video.name}
            </p>
          </Button>
        ))}
      </div>
    </div>
  );
};
