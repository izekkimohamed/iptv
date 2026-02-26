'use client';

import { Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useDebounce } from '@/shared/hooks/useDebounce';
import { trpc } from '@/shared/lib/trpc';
import { usePlaylistStore } from '@repo/store';

import {
  SearchEmptyState,
  SearchFilters,
  SearchLoadingSkeleton,
  SearchResultsSection,
} from './search';

interface SearchListProps {
  searchQuery: string;
}

type FilterType = 'all' | 'channels' | 'movies' | 'series';

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
              Found <span className="text-primary italic">&quot;{searchQuery}&quot;</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Found {counts.all} matching titles across your library
              </p>
            </div>
          </div>

          <SearchFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        <div className="space-y-16">
          {isGlobalSearchLoading && <SearchLoadingSkeleton />}

          {!isGlobalSearchLoading && !hasResults && (
            <SearchEmptyState searchQuery={searchQuery} />
          )}

          {/* Render Sections */}
          {['channels', 'movies', 'series'].map((type) => {
            const results = filteredResults[type as keyof typeof filteredResults] || [];
            return (
              <SearchResultsSection
                key={type}
                type={type as 'channels' | 'movies' | 'series'}
                results={results}
                query={searchQuery}
                viewMode={viewMode}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SearchList;
