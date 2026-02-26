'use client';

import { Play, TrendingUp } from 'lucide-react';
import Image from 'next/image';

import HorizontalCarousel from '@/shared/components/common/HorizontalCarousel';
import { trpc } from '@/shared/lib/trpc';

function TrendingSeries() {
  const { data: trendingMovies } = trpc.home.getHome.useQuery();

  if (!trendingMovies?.series || trendingMovies.series.length === 0) return null;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both space-y-6 pb-12 delay-500 duration-1000">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="text-primary flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-bold tracking-widest uppercase">Binge-worthy</span>
          </div>
          <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
            Popular Series
          </h2>
        </div>
      </div>

      <HorizontalCarousel scrollBy={800}>
        {trendingMovies.series.slice(0, 15).map((s) => (
          <div key={s.id} className="group relative w-48 shrink-0 lg:w-56">
            <div className="group-hover:border-primary/50 relative aspect-[2/3] overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all duration-500">
              <Image
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                fill
                sizes="(max-width: 1024px) 192px, 224px"
                src={s.backdropUrl || '/icon.png'}
                alt={s.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="line-clamp-2 text-sm font-bold text-white">{s.name}</p>
              </div>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="bg-primary h-12 w-12 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <div className="flex h-full w-full items-center justify-center">
                    <Play className="fill-primary-foreground text-primary-foreground ml-1 h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </HorizontalCarousel>
    </section>
  );
}

export default TrendingSeries;
