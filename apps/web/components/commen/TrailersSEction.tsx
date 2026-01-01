import { Play, Youtube } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

import { TrailersSectionProps } from '@/lib/types';

export const TrailersSection: FC<TrailersSectionProps> = ({ videos, onTrailerClick }) => {
  const youtubeVideos = videos?.filter((v) => v.site === 'YouTube').slice(0, 6) ?? [];

  if (youtubeVideos.length === 0) return null;

  return (
    <section className="space-y-6 p-10">
      <div className="flex items-center gap-4">
        <div className="h-8 w-1 rounded-full bg-red-600" />
        <h2 className="text-2xl font-bold tracking-tight text-white">Trailers & Clips</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos &&
          videos
            .filter((v) => v.site === 'YouTube')
            .slice(0, 4)
            .map((video) => (
              <div
                key={video.id}
                onClick={() => onTrailerClick(video.key)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-neutral-900 transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                    alt={video.name}
                    fill
                    className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all group-hover:bg-black/40">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-red-600">
                      <Play className="ml-1 h-5 w-5 fill-white text-white" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="line-clamp-2 text-sm font-semibold text-white group-hover:text-red-400">
                      {video.name}
                    </h4>
                    <Youtube className="h-5 w-5 shrink-0 text-neutral-600 group-hover:text-red-600" />
                  </div>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
};
