'use client';

import { LayoutGrid, Play, Rows3, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { trpc } from '@/lib/trpc';
import HorizontalCarousel from '@/src/shared/components/common/HorizontalCarousel';
import { usePlaylistStore } from '@repo/store';

import { Button } from '../ui/button';

interface SearchListProps {
  searchQuery: string;
}

type FilterType = 'all' | 'channels' | 'movies' | 'series';

const filters = [
  { id: 'all', label: 'All', icon: '🎯' },
  { id: 'channels', label: 'Channels', icon: '📺' },
  { id: 'movies', label: 'Movies', icon: '🎬' },
  { id: 'series', label: 'Series', icon: '📺' },
] as const;

function SearchList({ searchQuery }: SearchListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('carousel');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const router = useRouter();

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

  const order: FilterType[] = ['all', 'channels', 'movies', 'series'];

  const highlight = (text: string, query: string) => {
    if (!query) return text;
    const q = query.trim();
    try {
      const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})`, 'ig');
      const parts = String(text).split(regex);
      return parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <span key={i} className="rounded bg-amber-500/20 px-0.5 text-amber-300">
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
      <div className="mx-auto max-w-[90vw] space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-linear-to-br from-amber-500 to-yellow-400 p-2 shadow-lg shadow-amber-500/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">
                Search Results
              </span>
            </div>
            <h2 className="text-4xl leading-tight font-bold text-white md:text-5xl">
              Results for{' '}
              <span className="bg-linear-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                "{searchQuery}"
              </span>
            </h2>
            <p className="mt-3 text-lg text-gray-400">
              Found <span className="font-bold text-amber-400">{counts.all}</span>{' '}
              {counts.all === 1 ? 'result' : 'results'}
            </p>
          </div>
          <Link href="/" className="hidden sm:block">
            <Button className="rounded-xl border border-white/10 bg-white/5 px-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
              Clear Search
            </Button>
          </Link>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-sm">
            <Button
              onClick={() => setViewMode('carousel')}
              className={`rounded-lg px-4 py-2.5 transition-all duration-300 ${
                viewMode === 'carousel'
                  ? 'bg-linear-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <Rows3 className="mr-2 h-4 w-4" />
              Carousel
            </Button>
            <Button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg px-4 py-2.5 transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-linear-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Grid
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`group flex items-center gap-3 rounded-xl border px-5 py-3 font-semibold transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'border-amber-400/40 bg-linear-to-r from-amber-500 to-yellow-500 text-white shadow-xl shadow-amber-500/30'
                  : 'border-white/10 bg-white/5 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-white/10 hover:shadow-lg'
              }`}
            >
              <span className="text-lg">{filter.icon}</span>
              <span className="text-sm">{filter.label}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition-all ${
                  activeFilter === filter.id
                    ? 'bg-white/20 text-white'
                    : 'bg-black/30 text-gray-400 group-hover:bg-black/40'
                }`}
              >
                {counts[filter.id as FilterType]}
              </span>
            </Button>
          ))}
        </div>

        <div className="space-y-14">
          {isGlobalSearchLoading && (
            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="relative h-full animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/10 shadow-xl backdrop-blur-sm"
                  >
                    <div className="animate-shimmer aspect-2/3 bg-linear-to-br from-slate-800 via-slate-700 to-slate-800 bg-size-[200%_200%]" />
                    <div className="p-4">
                      <div className="mb-3 h-4 w-2/3 rounded-lg bg-white/10" />
                      <div className="h-3 w-1/3 rounded-lg bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isGlobalSearchLoading && !hasResults && (
            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-transparent p-16 text-center backdrop-blur-sm">
              <div className="mb-6 text-8xl opacity-40">🔍</div>
              <h3 className="mb-3 text-3xl font-bold text-white">No Results Found</h3>
              <p className="mx-auto max-w-md text-lg leading-relaxed text-gray-400">
                We couldn't find anything matching{' '}
                <span className="font-bold text-amber-400">"{searchQuery}"</span>. Try a different
                search term or browse our suggestions below.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {['football', 'news', 'action', 'comedy', 'drama'].map((suggestion) => (
                  <Link key={suggestion} href={`/?q=${encodeURIComponent(suggestion)}`}>
                    <Button className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all hover:border-amber-400/30 hover:bg-linear-to-r hover:from-amber-500/20 hover:to-yellow-500/20 hover:shadow-lg">
                      {suggestion}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(filteredResults.channels || []).length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-purple-400/30 bg-linear-to-br from-purple-500/20 to-pink-500/20 p-3 shadow-lg shadow-purple-500/20 backdrop-blur-sm">
                    <Play className="h-7 w-7 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Channels</h3>
                    <p className="text-sm text-gray-400">
                      {filteredResults.channels?.length || 0} available
                    </p>
                  </div>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {(filteredResults.channels || []).map((channel) => (
                    <Link
                      href={`/channels?categoryId=${channel.categoryId}&channelId=${channel.id}`}
                      key={channel.id}
                      className="group"
                    >
                      <div className="relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-slate-800/80 to-slate-900/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/30 hover:shadow-2xl hover:shadow-purple-500/20">
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            fill
                            src={channel.streamIcon || '/icon.png'}
                            alt={channel.name}
                            onError={(e) => {
                              e.currentTarget.src = '/icon.png';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black via-black/60 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100">
                            <div className="scale-90 rounded-full bg-linear-to-r from-purple-500 to-pink-500 p-4 shadow-2xl shadow-purple-500/50 transition-transform duration-300 group-hover:scale-100">
                              <Play className="h-8 w-8 fill-white text-white" />
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 rounded-full bg-linear-to-r from-red-600 to-red-500 px-3 py-1.5 shadow-lg shadow-red-500/50 backdrop-blur-sm">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-white shadow-lg shadow-white/50" />
                              LIVE
                            </span>
                          </div>
                        </div>
                        <div className="bg-linear-to-t from-black/90 to-transparent p-4">
                          <p className="truncate text-sm font-bold text-white transition-colors group-hover:text-purple-300">
                            {highlight(channel.name, searchQuery)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <HorizontalCarousel
                  scrollBy={800}
                  ariaLabelLeft="Scroll channels left"
                  ariaLabelRight="Scroll channels right"
                >
                  {(filteredResults.channels || []).map((channel) => (
                    <Link
                      href={`/channels?categoryId=${channel.categoryId}&channelId=${channel.id}`}
                      key={channel.id}
                      className="group w-50 shrink-0"
                    >
                      <div className="relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-slate-800/80 to-slate-900/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/30 hover:shadow-2xl hover:shadow-purple-500/20">
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            fill
                            src={channel.streamIcon || '/icon.png'}
                            alt={channel.name}
                            onError={(e) => {
                              e.currentTarget.src = '/icon.png';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black via-black/60 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100">
                            <div className="scale-90 rounded-full bg-linear-to-r from-purple-500 to-pink-500 p-3 shadow-2xl shadow-purple-500/50 transition-transform duration-300 group-hover:scale-100">
                              <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
                            </div>
                          </div>
                          <div className="absolute top-3 right-3 rounded-full bg-linear-to-r from-red-600 to-red-500 px-2.5 py-1 shadow-lg shadow-red-500/50 backdrop-blur-sm">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-white">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-white shadow-lg shadow-white/50" />
                              LIVE
                            </span>
                          </div>
                        </div>
                        <div className="bg-linear-to-t from-black/90 to-transparent p-3">
                          <p className="truncate text-xs font-bold text-white transition-colors group-hover:text-purple-300">
                            {highlight(channel.name, searchQuery)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </HorizontalCarousel>
              )}
            </section>
          )}

          {(filteredResults.movies || []).length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-amber-400/30 bg-linear-to-br from-amber-500/20 to-yellow-500/20 p-3 shadow-lg shadow-amber-500/20 backdrop-blur-sm">
                    <Play className="h-7 w-7 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Movies</h3>
                    <p className="text-sm text-gray-400">
                      {(filteredResults.movies || []).length} available
                    </p>
                  </div>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {(filteredResults.movies || []).map((movie) => (
                    <Link
                      href={`/movies?categoryId=${movie.categoryId}&movieId=${movie.streamId}`}
                      key={movie.id}
                      className="group"
                    >
                      <div className="relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-slate-800/80 to-slate-900/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-amber-400/30 hover:shadow-2xl hover:shadow-amber-500/20">
                        <div className="relative aspect-2/3 overflow-hidden">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            fill
                            src={movie.streamIcon || '/icon.png'}
                            alt={movie.name}
                            onError={(e) => {
                              e.currentTarget.src = '/icon.png';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black via-black/60 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100">
                            <div className="scale-90 rounded-full bg-linear-to-r from-amber-500 to-yellow-500 p-4 shadow-2xl shadow-amber-500/50 transition-transform duration-300 group-hover:scale-100">
                              <Play className="h-8 w-8 fill-white text-white" />
                            </div>
                          </div>
                          {movie.rating && (
                            <div className="absolute top-3 left-3 rounded-full border border-yellow-400/30 bg-linear-to-br from-yellow-500/90 to-amber-600/90 px-3 py-1.5 shadow-lg shadow-yellow-500/30 backdrop-blur-sm">
                              <span className="text-xs font-bold text-white">
                                ⭐ {Number.parseFloat(movie.rating || '0').toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="bg-linear-to-t from-black/90 to-transparent p-4">
                          <p className="truncate text-sm font-bold text-white transition-colors group-hover:text-amber-300">
                            {highlight(movie.name, searchQuery)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <HorizontalCarousel
                  scrollBy={800}
                  ariaLabelLeft="Scroll movies left"
                  ariaLabelRight="Scroll movies right"
                >
                  {(filteredResults.movies || []).map((movie) => (
                    <Link
                      href={`/movies?categoryId=${movie.categoryId}&movieId=${movie.streamId}`}
                      key={movie.id}
                      className="group w-55 shrink-0"
                    >
                      <div className="relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-slate-800/80 to-slate-900/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-amber-400/30 hover:shadow-2xl hover:shadow-amber-500/20">
                        <div className="relative aspect-2/3 overflow-hidden">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            fill
                            src={movie.streamIcon || '/icon.png'}
                            alt={movie.name}
                            onError={(e) => {
                              e.currentTarget.src = '/icon.png';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black via-black/60 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100">
                            <div className="scale-90 rounded-full bg-linear-to-r from-amber-500 to-yellow-500 p-3 shadow-2xl shadow-amber-500/50 transition-transform duration-300 group-hover:scale-100">
                              <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
                            </div>
                          </div>
                          {movie.rating && (
                            <div className="absolute top-3 left-3 rounded-full border border-yellow-400/30 bg-linear-to-br from-yellow-500/90 to-amber-600/90 px-2.5 py-1 shadow-lg shadow-yellow-500/30 backdrop-blur-sm">
                              <span className="text-[10px] font-bold text-white">
                                ⭐ {Number.parseFloat(movie.rating || '0').toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="bg-linear-to-t from-black/90 to-transparent p-3">
                          <p className="truncate text-xs font-bold text-white transition-colors group-hover:text-amber-300">
                            {highlight(movie.name, searchQuery)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </HorizontalCarousel>
              )}
            </section>
          )}

          {(filteredResults.series || []).length > 0 && (
            <section className="space-y-6 pb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-blue-400/30 bg-linear-to-br from-blue-500/20 to-cyan-500/20 p-3 shadow-lg shadow-blue-500/20 backdrop-blur-sm">
                    <Play className="h-7 w-7 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Series</h3>
                    <p className="text-sm text-gray-400">
                      {(filteredResults.series || []).length} available
                    </p>
                  </div>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {(filteredResults.series || []).map((series) => (
                    <div
                      key={series.id}
                      onClick={() => {
                        router.push(
                          `/series?categoryId=${series.categoryId}&seriesId=${series.seriesId}`,
                        );
                      }}
                      className="group cursor-pointer"
                    >
                      <div className="relative h-full overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-slate-800/80 to-slate-900/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20">
                        <div className="relative aspect-2/3 overflow-hidden">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            fill
                            src={series.cover || '/icon.png'}
                            alt={series.name ?? ''}
                            onError={(e) => {
                              e.currentTarget.src = '/icon.png';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black via-black/60 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100">
                            <div className="scale-90 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 p-4 shadow-2xl shadow-blue-500/50 transition-transform duration-300 group-hover:scale-100">
                              <Play className="h-8 w-8 fill-white text-white" />
                            </div>
                          </div>
                          {series.rating && (
                            <div className="absolute top-3 left-3 rounded-full border border-yellow-400/30 bg-linear-to-br from-yellow-500/90 to-amber-600/90 px-3 py-1.5 shadow-lg shadow-yellow-500/30 backdrop-blur-sm">
                              <span className="text-xs font-bold text-white">
                                ⭐ {Number.parseFloat(series.rating || '0').toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="bg-linear-to-t from-black/90 to-transparent p-4">
                          <p className="truncate text-sm font-bold text-white transition-colors group-hover:text-blue-300">
                            {highlight(series.name ?? '', searchQuery)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <HorizontalCarousel
                  scrollBy={800}
                  ariaLabelLeft="Scroll series left"
                  ariaLabelRight="Scroll series right"
                >
                  {(filteredResults.series || []).map((series) => (
                    <div
                      key={series.id}
                      onClick={() => {
                        router.push(
                          `/series?categoryId=${series.categoryId}&seriesId=${series.seriesId}`,
                        );
                      }}
                      className="group w-55 shrink-0 cursor-pointer"
                    >
                      <div className="relative h-full overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-slate-800/80 to-slate-900/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20">
                        <div className="relative aspect-2/3 overflow-hidden">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            fill
                            src={series.cover || '/icon.png'}
                            alt={series.name ?? ''}
                            onError={(e) => {
                              e.currentTarget.src = '/icon.png';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black via-black/60 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100">
                            <div className="scale-90 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 p-3 shadow-2xl shadow-blue-500/50 transition-transform duration-300 group-hover:scale-100">
                              <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
                            </div>
                          </div>
                          {series.rating && (
                            <div className="absolute top-3 left-3 rounded-full border border-yellow-400/30 bg-linear-to-br from-yellow-500/90 to-amber-600/90 px-2.5 py-1 shadow-lg shadow-yellow-500/30 backdrop-blur-sm">
                              <span className="text-[10px] font-bold text-white">
                                ⭐ {Number.parseFloat(series.rating || '0').toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="bg-linear-to-t from-black/90 to-transparent p-3">
                          <p className="truncate text-xs font-bold text-white transition-colors group-hover:text-blue-300">
                            {highlight(series.name ?? '', searchQuery)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </HorizontalCarousel>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchList;
