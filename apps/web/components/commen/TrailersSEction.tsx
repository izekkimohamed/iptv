import { TrailersSectionProps } from '@/lib/types';
import { Play } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';
import { Button } from '../ui/button';

export const TrailersSection: FC<TrailersSectionProps> = ({ videos, onTrailerClick }) => {
  const youtubeVideos = videos?.filter((v) => v.site === 'YouTube').slice(0, 6) ?? [];

  if (youtubeVideos.length === 0) return null;

  return (
    <div className="mt-16 space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-950 rounded-lg border border-red-700">
          <Play className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Trailers</h2>
          <p className="text-sm text-slate-400 mt-1">Watch promotional videos</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {youtubeVideos.map((video) => (
          <Button
            key={video.id}
            onClick={() => onTrailerClick(video.key)}
            className="relative h-[200] group cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
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
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center transition-colors bg-black/40 group-hover:bg-black/60">
              <div className="p-3 rounded-full bg-red-600">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
            <p className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs font-medium text-white bg-gradient-to-t from-black/80 to-transparent line-clamp-2">
              {video.name}
            </p>
          </Button>
        ))}
      </div>
    </div>
  );
};
