'use client';

import { Play, Youtube } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

import { TrailersSectionProps } from '@/lib/types';

export const TrailersSection: FC<TrailersSectionProps> = ({ videos, onTrailerClick }) => {
  const youtubeVideos = videos?.filter((v) => v.site === 'YouTube').slice(0, 4) ?? [];

  if (youtubeVideos.length === 0) return null;

  return (
    <section className="space-y-8 px-6 lg:px-12">
      <div className="flex items-center gap-4">
        <div className="h-8 w-1.5 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
        <h2 className="text-3xl font-black tracking-tight text-white">Trailers & Clips</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {youtubeVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => onTrailerClick(video.key)}
            className="group relative cursor-pointer overflow-hidden rounded-sm border border-white/10 bg-white/5 transition-all duration-500 hover:scale-[1.02] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                alt={video.name}
                fill
                className="object-cover opacity-60 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-500 group-hover:bg-primary/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 group-hover:scale-125 group-hover:shadow-primary/40">
                  <Play className="ml-1 h-6 w-6 fill-current" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-linear-to-b from-transparent to-black/40">
              <div className="flex items-start justify-between gap-4">
                <h4 className="line-clamp-2 text-sm font-bold text-white transition-colors group-hover:text-primary">
                  {video.name}
                </h4>
                <div className="rounded-full bg-white/10 p-2 text-white/40 transition-colors group-hover:bg-primary/20 group-hover:text-primary">
                  <Youtube className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
          </div>
        ))}
      </div>
    </section>
  );
};
