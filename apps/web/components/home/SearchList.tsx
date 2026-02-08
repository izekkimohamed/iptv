'use client';

import { Home, LayoutGrid, Play, Rows3, Search, Sparkles, Star, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { trpc } from '@/lib/trpc';
import HorizontalCarousel from '@/src/shared/components/common/HorizontalCarousel';
import { usePlaylistStore } from '@repo/store';

import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface SearchListProps {
  searchQuery: string;
}

type FilterType = 'all' | 'channels' | 'movies' | 'series';

const filters = [
  { id: 'all', label: 'All', icon: '🎯' },
  { id: 'channels', label: 'Channels', icon: '📺' },
  { id: 'movies', label: 'Movies', icon: '🎬' },
  { id: 'series', label: 'Series', icon: '📼' },
] as const;

function SearchList({ searchQuery }: SearchListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('carousel');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { selectedPlaylist: playlist } = usePlaylistStore();

  const { data: globalSearchResults, isLoading: isGlobalSearchLoading } =
    trpc.home.globalSearch.useQuery(
      { query: debouncedSearchQuery, playlistId: playlist?.id || 0 },
      { enabled: debouncedSearchQuery.trim().length > 0 },
    );

  const filteredResults = useMemo(() => {
    const channels =
      activeFilter === 'all' || activeFilter === 'channels'
        ? (globalSearchResults?.channels ?? [])
        : [];
    const movies =
      activeFilter === 'all' || activeFilter === 'movies'
        ? (globalSearchResults?.movies ?? [])
        : [];
    const series =
      activeFilter === 'all' || activeFilter === 'series'
        ? (globalSearchResults?.series ?? [])
        : [];
    return { channels, movies, series };
  }, [globalSearchResults, activeFilter]);

  const hasResults =
    (filteredResults.channels?.length ?? 0) > 0 ||
    (filteredResults.movies?.length ?? 0) > 0 ||
    (filteredResults.series?.length ?? 0) > 0;

  const counts = useMemo(
    () => ({
      channels: globalSearchResults?.channels?.length ?? 0,
      movies: globalSearchResults?.movies?.length ?? 0,
      series: globalSearchResults?.series?.length ?? 0,
      all:
        (globalSearchResults?.channels?.length ?? 0) +
        (globalSearchResults?.movies?.length ?? 0) +
        (globalSearchResults?.series?.length ?? 0),
    }),
    [globalSearchResults],
  );

  const highlight = (text: string, query: string) => {
    if (!query) return text;
    const q = query.trim();
    try {
      const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})`, 'ig');
      const parts = String(text).split(regex);
      return parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <span key={i} className="rounded bg-primary/20 px-1 text-primary">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      );
    } catch {
      return text;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[95vw] space-y-10 px-6 py-12 lg:px-12">
        {/* Search Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-primary">
              <Sparkles className="h-6 w-6 fill-primary glow-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Instant Discovery</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-foreground sm:text-6xl">
              Found <span className="text-primary italic">"{searchQuery}"</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Found {counts.all} matching titles across your library
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-sm border border-white/5 bg-white/5 p-1.5 backdrop-blur-xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('carousel')}
              className={cn(
                'rounded-sm px-4 transition-all duration-300',
                viewMode === 'carousel' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-white/5'
              )}
            >
              <Rows3 className="mr-2 h-4 w-4" />
              Carousel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-sm px-4 transition-all duration-300',
                viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-white/5'
              )}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Grid
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as FilterType)}
              className={cn(
                'flex items-center gap-2.5 rounded-sm border px-5 py-2.5 text-sm font-bold transition-all duration-300',
                activeFilter === filter.id
                  ? 'border-primary/50 bg-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]'
                  : 'border-white/5 bg-white/5 text-muted-foreground hover:border-white/10 hover:bg-white/10 hover:text-foreground'
              )}
            >
              <span className="text-lg opacity-80">{filter.icon}</span>
              {filter.label}
              <span className={cn(
                'ml-1 rounded-full px-2 py-0.5 text-[10px] font-black',
                activeFilter === filter.id ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
              )}>
                {counts[filter.id as FilterType]}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-16">
          {isGlobalSearchLoading && (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-[2/3] rounded-sm bg-white/5" />
                  <div className="h-4 w-3/4 rounded-sm bg-white/5" />
                </div>
              ))}
            </div>
          )}

          {!isGlobalSearchLoading && !hasResults && (
            <div className="relative flex flex-col items-center justify-center py-24 text-center">
              {/* Background Glow */}
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                <div className="h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
              </div>

              <div className="relative z-10 mb-10">
                 <div className="relative flex h-40 w-40 items-center justify-center rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl transition-transform duration-500 hover:scale-105">
                    <div className="absolute inset-0 rounded-[2.5rem] bg-linear-to-tr from-primary/20 to-transparent opacity-50" />
                    <Search className="h-20 w-20 text-primary/30" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-2xl">
                    <X className="h-6 w-6" />
                 </div>
              </div>

              <h3 className="relative z-10 text-4xl font-black tracking-tighter text-foreground mb-4">
                No <span className="text-primary">Matches</span> Found
              </h3>
              <p className="relative z-10 max-w-sm text-sm font-medium leading-relaxed text-muted-foreground/60 mb-10">
                We couldn't find anything matching "<span className="text-foreground">{searchQuery}</span>".
                Double check your spelling or try searching for a different category.
              </p>

              <Link href="/">
                 <Button className="relative z-10 group h-14 rounded-sm px-10 text-base font-black uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/40">
                    <Home className="mr-3 h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                    Return Home
                 </Button>
              </Link>
            </div>
          )}

          {/* Render Sections */}
          {['channels', 'movies', 'series'].map((type) => {
            const results = filteredResults[type as keyof typeof filteredResults] || [];
            if (results.length === 0) return null;

            return (
              <section key={type} className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                  <h3 className="text-2xl font-black capitalize tracking-tight text-foreground">
                    {type} <span className="text-muted-foreground/40 ml-2">({results.length})</span>
                  </h3>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {results.map((item: any) => (
                      <Link
                        key={item.id}
                        href={type === 'channels' ? `/channels?categoryId=${item.categoryId}&channelId=${item.id}` : type === 'movies' ? `/movies?categoryId=${item.categoryId}&movieId=${item.streamId}` : `/series?categoryId=${item.categoryId}&serieId=${item.seriesId}`}
                        className="group relative"
                      >
                         <div className="relative aspect-[2/3] overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                            <Image
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              fill
                              src={type === 'channels' ? (item.streamIcon || '/icon.png') : type === 'movies' ? (item.streamIcon || '/icon.png') : (item.cover || '/icon.png')}
                              alt={item.name}
                              onError={(e) => { e.currentTarget.src = '/icon.png'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                            {item.rating && (
                              <div className="absolute top-3 left-3 flex items-center gap-1 rounded-sm bg-black/40 px-2 py-1 text-[10px] font-black text-amber-400 backdrop-blur-md border border-white/5">
                                 <Star className="h-3 w-3 fill-current" />
                                 {parseFloat(item.rating).toFixed(1)}
                              </div>
                            )}

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                               <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                  <Play className="ml-1 h-8 w-8 fill-current" />
                               </div>
                            </div>
                         </div>
                         <div className="mt-3">
                            <p className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                              {highlight(item.name || item.plot || '', searchQuery)}
                            </p>
                         </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <HorizontalCarousel scrollBy={800}>
                    {results.map((item: any) => (
                      <Link
                        key={item.id}
                        href={type === 'channels' ? `/channels?categoryId=${item.categoryId}&channelId=${item.id}` : type === 'movies' ? `/movies?categoryId=${item.categoryId}&movieId=${item.streamId}` : `/series?categoryId=${item.categoryId}&serieId=${item.seriesId}`}
                        className="group relative w-48 shrink-0 lg:w-56"
                      >
                         <div className="relative aspect-[2/3] overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]">
                            <Image
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              fill
                              src={type === 'channels' ? (item.streamIcon || '/icon.png') : type === 'movies' ? (item.streamIcon || '/icon.png') : (item.cover || '/icon.png')}
                              alt={item.name}
                              onError={(e) => { e.currentTarget.src = '/icon.png'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                               <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-2xl">
                                  <Play className="ml-0.5 h-6 w-6 fill-current" />
                               </div>
                            </div>
                         </div>
                         <p className="mt-3 truncate text-sm font-bold transition-colors group-hover:text-primary">
                            {highlight(item.name || item.plot || '', searchQuery)}
                         </p>
                      </Link>
                    ))}
                  </HorizontalCarousel>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SearchList;

