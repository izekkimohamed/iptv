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
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-10 w-10 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">SEARCH RESULTS</span>
            </div>
            <h2 className="text-4xl font-bold text-white">
              Results for{' '}
              <span className="bg-linear-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
                "{searchQuery}"
              </span>
            </h2>
            <p className="mt-2 text-gray-400">
              Found <span className="font-semibold text-amber-400">{counts.all}</span> results
            </p>
          </div>
          <Link href="/" className="hidden sm:block">
            <Button className="border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10">
              Clear
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode('carousel')}
              className={`rounded-lg border px-3 py-2 ${
                viewMode === 'carousel'
                  ? 'border-amber-400/50 bg-linear-to-r from-amber-600 to-yellow-500 text-white'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Rows3 className="mr-2 h-5 w-5" />
              Carousel
            </Button>
            <Button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg border px-3 py-2 ${
                viewMode === 'grid'
                  ? 'border-amber-400/50 bg-linear-to-r from-amber-600 to-yellow-500 text-white'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <LayoutGrid className="mr-2 h-5 w-5" />
              Grid
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-medium transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'border-amber-400/50 bg-linear-to-r from-amber-600 to-yellow-500 text-white shadow-lg shadow-amber-500/20'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <span className="text-base">{filter.icon}</span>
              {filter.label}
              <span className="ml-2 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-xs">
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
                    className="relative h-full animate-pulse overflow-hidden rounded-xl border border-white/10 bg-white/5"
                  >
                    <div className="animate-shimmer aspect-2/3 bg-linear-to-r from-slate-800 via-slate-700 to-slate-800" />
                    <div className="p-3">
                      <div className="mb-2 h-3 w-2/3 rounded bg-white/10" />
                      <div className="h-3 w-1/3 rounded bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isGlobalSearchLoading && !hasResults && (
            <div className="py-20 text-center">
              <div className="mb-6 text-8xl opacity-40">🔍</div>
              <h3 className="mb-2 text-2xl font-bold text-white">No Results Found</h3>
              <p className="mx-auto max-w-md text-lg text-gray-400">
                We couldn't find anything matching "
                <span className="font-semibold text-amber-400">{searchQuery}</span>
                ". Try a different search term.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {['football', 'news', 'action', 'comedy', 'drama'].map((suggestion) => (
                  <Link key={suggestion} href={`/?q=${encodeURIComponent(suggestion)}`}>
                    <Button className="border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10">
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
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-purple-500/30 bg-linear-to-r from-purple-500/20 to-pink-500/20 p-2">
                    <Play className="h-10 w-10 text-purple-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Channels{' '}
                    <span className="text-gray-500">({filteredResults.channels?.length || 0})</span>
                  </h3>
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
                      <div className="relative h-full cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-slate-800 transition-all duration-300 hover:border-white/20">
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            fill
                            src={channel.streamIcon || '/icon.png'}
                            alt={channel.name}
                            onError={(e) => {
                              e.currentTarget.src = '/icon.png';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="rounded-full bg-amber-600 p-3">
                              <Play className="h-10 w-10 fill-white text-white" />
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 rounded-full bg-red-600 px-2 py-1">
                            <span className="flex items-center gap-1 text-xs font-bold text-white">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                              LIVE
                            </span>
                          </div>
                        </div>
                        <div className="bg-linear-to-t from-black to-transparent p-3">
                          <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-amber-300">
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
                      <div className="relative h-full cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-slate-800 transition-all duration-300 hover:border-white/20">
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            fill
                            src={channel.streamIcon || '/icon.png'}
                            alt={channel.name}
                            onError={(e) => {
                              e.currentTarget.src = '/icon.png';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="rounded-full bg-amber-500 p-2.5 shadow-lg shadow-amber-600/40">
                              <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 rounded-full bg-red-600 px-2 py-1">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-white">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                              LIVE
                            </span>
                          </div>
                        </div>
                        <div className="bg-linear-to-t from-black to-transparent p-3">
                          <p className="truncate text-xs font-semibold text-white transition-colors group-hover:text-amber-300">
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
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-red-500/30 bg-linear-to-r from-red-500/20 to-pink-500/20 p-2">
                    <Play className="h-10 w-10 text-red-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Movies{' '}
                    <span className="text-gray-500">({(filteredResults.movies || []).length})</span>
                  </h3>
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
                      <div className="relative h-full cursor-pointer overflow-hidden rounded-xl border border-amber-400/5 bg-slate-800 transition-all duration-300 hover:border-amber-400/20">
                        <div className="relative aspect-2/3 overflow-hidden">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            fill
                            src={movie.streamIcon || '/icon.png'}
                            alt={movie.name}
                            onError={(e) => {
                              e.currentTarget.src = '/icon.png';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="rounded-full bg-amber-600 p-3">
                              <Play className="h-10 w-10 fill-white text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-linear-to-t from-black to-transparent p-3">
                          <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-amber-300">
                            {highlight(movie.name, searchQuery)}
                          </p>
                          <p className="mt-1 text-xs font-bold text-yellow-400">
                            ⭐ {parseFloat(movie.rating || '0').toFixed(1)}
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
                      <div className="relative h-full cursor-pointer overflow-hidden rounded-xl border border-amber-400/5 bg-slate-800 transition-all duration-300 hover:border-amber-400/20">
                        <div className="relative aspect-2/3 overflow-hidden">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            fill
                            src={movie.streamIcon || '/icon.png'}
                            alt={movie.name}
                            onError={(e) => {
                              e.currentTarget.src = '/icon.png';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="rounded-full bg-amber-500 p-2.5 shadow-lg shadow-amber-600/40">
                              <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                            </div>
                          </div>
                          {movie.rating && (
                            <div className="absolute top-2 left-2 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                              ⭐ {parseFloat(movie.rating || '0').toFixed(1)}
                            </div>
                          )}
                        </div>
                        <div className="bg-linear-to-t from-black to-transparent p-3">
                          <p className="truncate text-xs font-semibold text-white transition-colors group-hover:text-amber-300">
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
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-yellow-500/30 bg-linear-to-r from-yellow-500/20 to-amber-500/20 p-2">
                    <Play className="h-10 w-10 text-yellow-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Series{' '}
                    <span className="text-gray-500">({(filteredResults.series || []).length})</span>
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {(filteredResults.series || []).map((series) => (
                  <Link
                    href={`/series?categoryId=${series.categoryId}&serieId=${series.seriesId}`}
                    key={series.id}
                    className="group"
                  >
                    <div className="relative h-full cursor-pointer overflow-hidden rounded-xl border border-amber-400/5 bg-slate-800 transition-all duration-300 hover:border-amber-400/20 hover:shadow-lg hover:shadow-amber-400/20">
                      <div className="relative aspect-2/3 overflow-hidden">
                        <Image
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          fill
                          src={series.cover || '/icon.png'}
                          alt={series.name || series.plot || ''}
                          onError={(e) => {
                            e.currentTarget.src = '/icon.png';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <div className="rounded-full bg-amber-600 p-3">
                            <Play className="h-10 w-10 fill-white text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-linear-to-t from-black to-transparent p-3">
                        <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-amber-300">
                          {highlight(series.name || series.plot || '', searchQuery)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-yellow-400">
                          ⭐ {parseFloat(series.rating || '0').toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchList;
