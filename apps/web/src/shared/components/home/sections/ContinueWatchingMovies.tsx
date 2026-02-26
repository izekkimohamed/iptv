'use client';

import { Clock, Play, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import HorizontalCarousel from '@/shared/components/common/HorizontalCarousel';
import { Button } from '@/shared/components/ui/button';
import { usePlaylistStore, useWatchedMoviesStore } from '@repo/store';

function ContinueWatchingMovies() {
  const { selectedPlaylist: playlist } = usePlaylistStore();
  const { movies, removeItem } = useWatchedMoviesStore();

  const playlistId = playlist?.id || 0;
  const filteredMovies = useMemo(
    () => movies.filter((item) => item.playlistId === playlistId),
    [movies, playlistId],
  );

  if (filteredMovies.length === 0) return null;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both space-y-6 delay-200 duration-1000">
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <div className="text-primary flex items-center gap-2.5">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-sm">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">
              Pick up where you left
            </span>
          </div>
          <h2 className="text-foreground text-4xl font-black tracking-tighter sm:text-5xl">
            Continue <span className="text-primary italic">Watching</span>
          </h2>
        </div>
      </div>

      <HorizontalCarousel scrollBy={800}>
        {filteredMovies.map((item) => {
          const progress = item.position && item.duration ? item.position / item.duration : 0;
          return (
            <div key={item.id} className="group relative w-64 shrink-0 lg:w-72">
              <Link
                href={`movies?categoryId=${item.categoryId}&movieId=${item.id}&play=true`}
                className="group-hover:border-primary/30 block overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all duration-500 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    fill
                    sizes="(max-width: 1024px) 256px, 288px"
                    src={item.poster || '/icon.png'}
                    alt={item.title || 'Untitled'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                      {Math.round(progress * 100)}% Complete
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/20 backdrop-blur-md">
                      <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-foreground group-hover:text-primary truncate text-sm font-bold transition-colors">
                    {item.title}
                  </p>
                  {/* Progress Bar */}
                  <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-1000 group-hover:brightness-125"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                </div>
              </Link>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  removeItem(item.id, playlist?.id || 0);
                }}
                className="bg-background text-muted-foreground hover:text-destructive absolute -top-2 -right-2 h-8 w-8 rounded-full border border-white/10 opacity-0 transition-all duration-300 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </HorizontalCarousel>
    </section>
  );
}

export default ContinueWatchingMovies;
