'use client';

import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import HorizontalCarousel from '@/shared/components/common/HorizontalCarousel';
import { trpc } from '@/shared/lib/trpc';
import { usePlaylistStore } from '@repo/store';

function FavoriteChannels() {
  const { selectedPlaylist: playlist } = usePlaylistStore();

  const { data: favoriteChannels = [] } = trpc.channels.getChannels.useQuery(
    {
      favorites: true,
      playlistId: playlist?.id || 0,
    },
    {
      enabled: !!playlist,
    },
  );

  if (favoriteChannels.length === 0) return null;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both space-y-6 delay-100 duration-1000">
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <div className="text-primary flex items-center gap-2.5">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-sm">
              <Star className="fill-primary h-4 w-4" />
            </div>
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">
              Your Selection
            </span>
          </div>
          <h2 className="text-foreground text-4xl font-black tracking-tighter sm:text-5xl">
            Favorite <span className="text-primary italic">Channels</span>
          </h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-foreground/80 text-2xl font-black tabular-nums">
            {favoriteChannels.length}
          </p>
          <p className="text-muted-foreground/40 text-[10px] font-bold tracking-widest uppercase">
            Total Channels
          </p>
        </div>
      </div>

      <HorizontalCarousel scrollBy={600}>
        {favoriteChannels.map((channel) => (
          <Link
            href={`/channels?categoryId=${channel.categoryId}&channelId=${channel.id}`}
            key={channel.id}
            className="group relative flex w-32 shrink-0 flex-col gap-3 sm:w-40"
          >
            <div className="group-hover:border-primary/50 relative aspect-square overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all">
              <Image
                className="h-full w-full object-contain p-4"
                fill
                sizes="(max-width: 640px) 128px, 160px"
                src={channel.streamIcon || '/icon.png'}
                alt={channel.name}
                onError={(e) => {
                  e.currentTarget.src = '/icon.png';
                }}
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-sm bg-red-500 px-2 py-0.5 text-[9px] font-black tracking-widest text-white">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                LIVE
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full">
                  <svg className="ml-1 h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="group-hover:text-primary truncate text-center text-sm font-semibold transition-colors">
              {channel.name}
            </p>
          </Link>
        ))}
      </HorizontalCarousel>
    </section>
  );
}

export default FavoriteChannels;
