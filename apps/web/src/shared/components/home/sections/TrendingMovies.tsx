'use client';

import { Flame, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import HorizontalCarousel from '@/shared/components/common/HorizontalCarousel';
import { trpc } from '@/shared/lib/trpc';

function TrendingMovies() {
  const { data: trendingMovies } = trpc.home.getHome.useQuery();

  if (!trendingMovies?.movies || trendingMovies.movies.length === 0) return null;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both space-y-6 delay-400 duration-1000">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="text-primary flex items-center gap-2">
            <Flame className="h-5 w-5" />
            <span className="text-xs font-bold tracking-widest uppercase">Trending</span>
          </div>
          <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
            Popular Movies
          </h2>
        </div>
      </div>

      <HorizontalCarousel scrollBy={800}>
        {trendingMovies.movies.slice(0, 15).map((movie) => (
          <Link
            href={`movies/movie?movieId=${movie.id}`}
            key={movie.id}
            className="group relative w-48 shrink-0 lg:w-56"
          >
            <div className="group-hover:border-primary/50 relative aspect-[2/3] overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(var(--primary),0.2)]">
              <Image
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                fill
                sizes="(max-width: 1024px) 192px, 224px"
                src={movie.backdropUrl || '/icon.png'}
                alt={movie.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Hover Info */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="mb-2 flex items-center gap-1.5">
                  <div className="border-primary/50 bg-primary/20 text-primary rounded border px-1.5 py-0.5 text-[10px] font-bold">
                    {movie.releaseDate?.split('-')[0] || 'N/A'}
                  </div>
                </div>
                <p className="line-clamp-2 text-sm font-bold text-white">{movie.title}</p>
              </div>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="bg-primary h-16 w-16 translate-y-4 rounded-full opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex h-full w-full items-center justify-center">
                    <Play className="fill-primary-foreground text-primary-foreground ml-1 h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </HorizontalCarousel>
    </section>
  );
}

export default TrendingMovies;
