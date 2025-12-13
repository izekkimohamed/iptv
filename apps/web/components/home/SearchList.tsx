import { useDebounce } from '@/hooks/useDebounce';
import { trpc } from '@/lib/trpc';
import { usePlaylistStore } from '@/store/appStore';
import { Play, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
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
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { selectedPlaylist: playlist } = usePlaylistStore();

  const { data: globalSearchResults, isLoading: isGlobalSearchLoading } =
    trpc.home.globalSearch.useQuery(
      { query: debouncedSearchQuery, playlistId: playlist?.id || 0 },
      { enabled: debouncedSearchQuery.trim().length > 0 },
    );

  const getFilteredResults = () => {
    if (!globalSearchResults) return { channels: [], movies: [], series: [] };

    return {
      channels:
        activeFilter === 'all' || activeFilter === 'channels' ? globalSearchResults.channels : [],
      movies: activeFilter === 'all' || activeFilter === 'movies' ? globalSearchResults.movies : [],
      series: activeFilter === 'all' || activeFilter === 'series' ? globalSearchResults.series : [],
    };
  };

  const filteredResults = getFilteredResults();
  const hasResults =
    (filteredResults.channels?.length ?? 0) > 0 ||
    (filteredResults.movies?.length ?? 0) > 0 ||
    (filteredResults.series?.length ?? 0) > 0;

  return (
    <div className="flex-1 overflow-y-auto ">
      <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-10 h-10 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">SEARCH RESULTS</span>
            </div>
            <h2 className="text-4xl font-bold text-white">
              Results for{' '}
              <span className="bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
                "{searchQuery}"
              </span>
            </h2>
            <p className="text-gray-400 mt-2">
              Found{' '}
              <span className="text-amber-400 font-semibold">
                {(filteredResults.channels?.length || 0) +
                  (filteredResults.movies?.length || 0) +
                  (filteredResults.series?.length || 0)}
              </span>{' '}
              results
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 border ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-amber-400/50 shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-base">{filter.icon}</span>
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="space-y-14">
          {isGlobalSearchLoading && (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          )}

          {!isGlobalSearchLoading && !hasResults && (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 opacity-40">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Results Found</h3>
              <p className="text-gray-400 text-lg max-w-md mx-auto">
                We couldn't find anything matching "
                <span className="text-amber-400 font-semibold">{searchQuery}</span>
                ". Try a different search term.
              </p>
            </div>
          )}

          {(filteredResults.channels || []).length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                    <Play className="w-10 h-10 text-purple-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Channels{' '}
                    <span className="text-gray-500">({filteredResults.channels?.length || 0})</span>
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {(filteredResults.channels || []).map((channel) => (
                  <Link
                    href={`/channels?categoryId=${channel.categoryId}&channelId=${channel.id}`}
                    key={channel.id}
                    className="group"
                  >
                    <div className="relative rounded-xl overflow-hidden bg-slate-800 cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300 h-full">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                          fill
                          src={channel.streamIcon || '/icon.png'}
                          alt={channel.name}
                          onError={(e) => {
                            e.currentTarget.src = '/icon.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="p-3 bg-amber-600 rounded-full">
                            <Play className="w-10 h-10 text-white fill-white" />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded-full">
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            LIVE
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-t from-black to-transparent">
                        <p className="text-white font-semibold text-sm truncate group-hover:text-amber-300 transition-colors">
                          {channel.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(filteredResults.movies || []).length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg border border-red-500/30">
                    <Play className="w-10 h-10 text-red-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Movies{' '}
                    <span className="text-gray-500">({(filteredResults.movies || []).length})</span>
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {(filteredResults.movies || []).map((movie) => (
                  <Link
                    href={`/movies?categoryId=${movie.categoryId}&movieId=${movie.streamId}`}
                    key={movie.id}
                    className="group"
                  >
                    <div className="relative rounded-xl overflow-hidden bg-slate-800 cursor-pointer border border-amber-400/5 hover:border-amber-400/20 transition-all duration-300 h-full">
                      <div className="relative aspect-[2/3] overflow-hidden">
                        <Image
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                          fill
                          src={movie.streamIcon || '/icon.png'}
                          alt={movie.name}
                          onError={(e) => {
                            e.currentTarget.src = '/icon.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="p-3 bg-amber-600 rounded-full">
                            <Play className="w-10 h-10 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-t from-black to-transparent">
                        <p className="text-white font-semibold text-sm truncate group-hover:text-amber-300 transition-colors">
                          {movie.name}
                        </p>
                        <p className="text-yellow-400 text-xs mt-1 font-bold">
                          ⭐ {parseFloat(movie.rating || '0').toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(filteredResults.series || []).length > 0 && (
            <section className="space-y-6 pb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-lg border border-yellow-500/30">
                    <Play className="w-10 h-10 text-yellow-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Series{' '}
                    <span className="text-gray-500">({(filteredResults.series || []).length})</span>
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {(filteredResults.series || []).map((series) => (
                  <Link
                    href={`/series?categoryId=${series.categoryId}&serieId=${series.seriesId}`}
                    key={series.id}
                    className="group"
                  >
                    <div className="relative rounded-xl overflow-hidden bg-slate-800 cursor-pointer border border-amber-400/5 hover:border-amber-400/20 transition-all duration-300 h-full hover:shadow-lg hover:shadow-amber-400/20">
                      <div className="relative aspect-[2/3] overflow-hidden">
                        <Image
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                          fill
                          src={series.cover || '/icon.png'}
                          alt={series.name}
                          onError={(e) => {
                            e.currentTarget.src = '/icon.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="p-3 bg-amber-600 rounded-full">
                            <Play className="w-10 h-10 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-t from-black to-transparent">
                        <p className="text-white font-semibold text-sm truncate group-hover:text-amber-300 transition-colors">
                          {series.name}
                        </p>
                        <p className="text-yellow-400 text-xs mt-1 font-bold">
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
