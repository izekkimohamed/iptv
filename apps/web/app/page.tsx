"use client";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useDebounce } from "@/hooks/useDebounce";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import {
  useWatchedMoviesStore,
  useWatchedSeriesStore,
} from "@/store/watchedStore";
import { Play, Search, X, Sparkles, Zap, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type FilterType = "all" | "channels" | "movies" | "series";

const filters = [
  { id: "all", label: "All", icon: "🎯" },
  { id: "channels", label: "Channels", icon: "📺" },
  { id: "movies", label: "Movies", icon: "🎬" },
  { id: "series", label: "Series", icon: "📺" },
] as const;

export default function IPTVHomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { selectedPlaylist: playlist } = usePlaylistStore();
  const { movies, removeItem } = useWatchedMoviesStore();
  const { series, removeItem: removeSeriesItem } = useWatchedSeriesStore();
  const { data: favoriteChannels } = trpc.channels.getChannels.useQuery(
    {
      favorites: true,
      playlistId: playlist?.id || 0,
    },
    {
      enabled: !!playlist,
    }
  );

  const { data: trendingMovies } = trpc.home.getHome.useQuery();
  const { data: globalSearchResults, isLoading: isGlobalSearchLoading } =
    trpc.home.globalSearch.useQuery(
      { query: debouncedSearchQuery, playlistId: playlist?.id || 0 },
      { enabled: debouncedSearchQuery.trim().length > 0 }
    );

  const getFilteredResults = () => {
    if (!globalSearchResults) return { channels: [], movies: [], series: [] };

    return {
      channels:
        activeFilter === "all" || activeFilter === "channels" ?
          globalSearchResults.channels
        : [],
      movies:
        activeFilter === "all" || activeFilter === "movies" ?
          globalSearchResults.movies
        : [],
      series:
        activeFilter === "all" || activeFilter === "series" ?
          globalSearchResults.series
        : [],
    };
  };

  const filteredResults = getFilteredResults();
  const hasResults =
    (filteredResults.channels?.length ?? 0) > 0 ||
    (filteredResults.movies?.length ?? 0) > 0 ||
    (filteredResults.series?.length ?? 0) > 0;

  // Home Page
  if (!searchQuery.trim().length) {
    return (
      <div className='h-screen flex flex-col overflow-hidden '>
        {/* Header - Fixed */}
        <div className='flex-shrink-0 py-6 border-b border-white/5 '>
          <div className='max-w-2xl mx-auto px-4'>
            <div className='relative group'>
              <div className='absolute inset-0 bg-slate-950/50 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse' />
              <div className='relative rounded-full px-6 py-3 flex items-center gap-4 border border-blue-500/20 group-hover:border-blue-500/50 transition-all duration-300'>
                <Search className='w-10 h-5 text-blue-400 flex-shrink-0' />
                <input
                  type='text'
                  placeholder='Search channels, movies, series...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm font-medium'
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className='text-gray-400 hover:text-blue-400 transition-colors flex-shrink-0'
                  >
                    <X className='w-10 h-5' />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto '>
          <div className='max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16'>
            {/* Favorite Channels */}
            {favoriteChannels && favoriteChannels.length > 0 && (
              <section className='space-y-6'>
                <div className='flex items-center gap-4'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-r from-yellow-1000 to-orange-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition' />
                    <div className='relative p-3 bg-gradient-to-r  from-yellow-300/30 to-orange-300/30 rounded-xl border border-amber-400'>
                      <Star className='w-10 h-10 text-white  stroke-white' />
                    </div>
                  </div>
                  <div>
                    <h2 className='text-3xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent'>
                      Favorite Channels
                    </h2>
                    <p className='text-sm text-gray-400 mt-1'>
                      Your most-watched channels
                    </p>
                  </div>
                </div>

                <div className='flex overflow-x-auto gap-4 p-4  rounded-xl border border-white/10 '>
                  {favoriteChannels?.map((channel) => (
                    <Link
                      href={`/channels?categoryId=${channel.categoryId}&channelId=${channel.id}`}
                      key={channel.id}
                      className='group'
                    >
                      <div className='w-[150px] flex-shrink-0'>
                        <div className='relative rounded-xl overflow-hidden aspect-square bg-slate-800 cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300'>
                          <Image
                            className='w-full h-full group-hover:scale-110 transition-transform duration-300'
                            fill
                            src={channel.streamIcon || "/icon.png"}
                            alt={channel.name}
                            onError={(e) => {
                              e.currentTarget.src = "/icon.png";
                            }}
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center '>
                            <div className='p-2 bg-blue-600/80 rounded-full'>
                              <Play className='w-10 h-10 text-white fill-white' />
                            </div>
                          </div>
                        </div>
                        <p className='mt-2 text-white font-semibold text-center text-xs truncate group-hover:text-blue-400 transition-colors'>
                          {channel.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {/* continue Watching Movies Section */}
            {movies.length > 0 && (
              <>
                <h2 className='text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                  Continue Watching Movies
                </h2>
                <div className='flex overflow-x-auto gap-4 p-4 rounded-xl border border-white/10 '>
                  {movies.map((item) => {
                    const progress =
                      item.position && item.duration ?
                        item.position / item.duration
                      : 0;

                    return (
                      <Link
                        key={item.id}
                        href={`movies?categoryId=${item.categoryId}&movieId=${item.id}&play=true`}
                        className='relative group'
                      >
                        <div className='w-[200px] flex-shrink-0 '>
                          <div className='relative rounded-lg overflow-hidden bg-slate-800 cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300'>
                            {/* Thumbnail */}
                            <div className='relative h-[300px] overflow-hidden'>
                              <Image
                                className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                                fill
                                src={item.poster || "/icon.png"}
                                alt={item.title || "Untitled"}
                              />
                            </div>

                            {/* Progress Bar */}
                            {progress > 0 && (
                              <div className='absolute bottom-0 left-0 w-full h-1 bg-slate-700'>
                                <div
                                  className='h-full bg-blue-500 transition-all duration-300 rounded'
                                  style={{
                                    width: `${Math.min(progress * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Title */}
                          <p className='mt-2 text-white font-semibold text-center text-xs truncate group-hover:text-blue-400 transition-colors'>
                            {item.title}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeItem(item.id);
                          }}
                          className='absolute top-2 right-2 bg-slate-950 text-white rounded-full p-1 hover:bg-slate-900 border border-white/10 cursor-pointer transition'
                        >
                          <X className='w-4 h-4' />
                        </button>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
            {/* continue Watching Series Section */}
            {series.length > 0 && (
              <>
                <h2 className='text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent'>
                  Continue Watching Series
                </h2>
                <div className='flex overflow-x-auto gap-4 p-4 rounded-xl border border-white/10 '>
                  {series.map((item) => {
                    const progress =
                      item.position && item.duration ?
                        item.position / item.duration
                      : 0;

                    return (
                      <Link
                        key={item.id}
                        href={`series?categoryId=${item.categoryId}&serieId=${item.id}&resumeSeries=true&poster=${item.poster}&title=${item.title}&src=${item.src}&seasonId=${item.seasonId}&episodeNumber=${item.episodeNumber}`}
                        className='relative group'
                      >
                        <div className='w-[200px] flex-shrink-0 '>
                          <div className='relative rounded-lg overflow-hidden bg-slate-800 cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300'>
                            {/* Thumbnail */}
                            <div className='relative h-[300px] overflow-hidden'>
                              <Image
                                className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                                fill
                                src={item.poster || "/icon.png"}
                                alt={item.title || "Untitled"}
                              />
                            </div>

                            {/* Progress Bar */}
                            {progress > 0 && (
                              <div className='absolute bottom-0 left-0 w-full h-1 bg-slate-700'>
                                <div
                                  className='h-full bg-blue-500 transition-all duration-300 rounded'
                                  style={{
                                    width: `${Math.min(progress * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Title */}
                          <p className='mt-2 text-white font-semibold text-center text-xs truncate group-hover:text-blue-400 transition-colors'>
                            {item.title}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeSeriesItem(item.id);
                          }}
                          className='absolute top-2 right-2 bg-slate-950 text-white rounded-full p-1 hover:bg-slate-900 border border-white/10 cursor-pointer transition'
                        >
                          <X className='w-4 h-4' />
                        </button>
                        {/* add overlay to show the season and episode */}
                        <div className='absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs rounded px-2 py-1'>
                          S{item.seasonId}E{item.episodeNumber}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {/* Movies Section */}
            {trendingMovies?.movies && trendingMovies.movies.length > 0 && (
              <section className='space-y-6'>
                {/* Title Header (No Change) */}
                <div className='flex items-center gap-4'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition' />
                    <div className='relative p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/30'>
                      <Play className='w-10 h-10 text-white' />
                    </div>
                  </div>
                  <div>
                    <h2 className='text-3xl font-bold bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent'>
                      Popular Movies
                    </h2>
                    <p className='text-sm text-gray-400 mt-1'>
                      Trending now on StreamMax
                    </p>
                  </div>
                </div>

                {/* Movies List - MODIFIED FOR HORIZONTAL SCROLL */}
                <div className='flex overflow-x-auto gap-4 p-4  rounded-xl border border-white/10 '>
                  {trendingMovies?.movies?.slice(0, 12).map((movie) => (
                    // Add a fixed-width wrapper for each item
                    <Link
                      href={`movies/movie?movieId=${movie.id}`}
                      key={movie.id}
                      className='group w-[250px] flex-shrink-0'
                    >
                      <div className='relative rounded-lg overflow-hidden bg-slate-800 cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300'>
                        <div className='relative h-[400px]  overflow-hidden'>
                          <Image
                            className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                            fill
                            src={movie.backdropUrl || "/icon.png"}
                            alt={movie.title}
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                            <div className='p-2 bg-blue-600 rounded-full'>
                              <Play className='w-10 h-10 text-white fill-white' />
                            </div>
                          </div>
                        </div>
                        <div className='absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent'>
                          <p className='text-white font-semibold text-xs truncate group-hover:text-blue-300 transition-colors'>
                            {movie.title}
                          </p>
                          <p className='text-gray-400 text-xs mt-1'>
                            {movie.releaseDate?.split("-")[0]}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Series Section */}
            {trendingMovies?.series && trendingMovies.series.length > 0 && (
              <section className='space-y-6 pb-8'>
                {/* Title Header (No Change) */}
                <div className='flex items-center gap-4'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition' />
                    <div className='relative p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30'>
                      <Play className='w-10 h-10 text-white' />
                    </div>
                  </div>
                  <div>
                    <h2 className='text-3xl font-bold bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent'>
                      Popular Series
                    </h2>
                    <p className='text-sm text-gray-400 mt-1'>
                      Binge-worthy shows
                    </p>
                  </div>
                </div>

                {/* Series List - MODIFIED FOR HORIZONTAL SCROLL */}
                <div className='flex overflow-x-auto gap-4 p-4  rounded-xl border border-white/10 '>
                  {trendingMovies?.series?.slice(0, 12).map((s) => (
                    // Add a fixed-width wrapper for each item
                    <div key={s.id} className='group w-[250px] flex-shrink-0'>
                      <div className='relative rounded-lg overflow-hidden bg-slate-800 cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300'>
                        <div className='relative h-[400px] overflow-hidden'>
                          <Image
                            className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                            fill
                            src={s.backdropUrl || "/icon.png"}
                            alt={s.name}
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                            <div className='p-2 bg-blue-600 rounded-full'>
                              <Play className='w-10 h-10 text-white fill-white' />
                            </div>
                          </div>
                        </div>
                        <div className='absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent'>
                          <p className='text-white font-semibold text-xs truncate group-hover:text-blue-300 transition-colors'>
                            {s.name}
                          </p>
                          <p className='text-gray-400 text-xs mt-1'>
                            {s.firstAirDate?.split("-")[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Search Results Page
  return (
    <div className='h-screen flex flex-col overflow-hidden '>
      {/* Header - Fixed */}
      <div className='flex-shrink-0 py-6 border-b border-white/5 '>
        <div className='max-w-2xl mx-auto px-4'>
          <div className='relative group'>
            <div className='absolute inset-0 bg-slate-950/50 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse' />
            <div className='relative  rounded-full px-6 py-3 flex items-center gap-4 border border-blue-500/20 group-hover:border-blue-500/50 transition-all duration-300'>
              <Search className='w-10 h-5 text-blue-400 flex-shrink-0' />
              <input
                type='text'
                placeholder='Search channels, movies, series...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm font-medium'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className='text-gray-400 hover:text-blue-400 transition-colors flex-shrink-0'
                >
                  <X className='w-10 h-5' />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto '>
        <div className='max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10'>
          {/* Search Header */}
          <div className='flex items-center justify-between gap-4'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <Sparkles className='w-10 h-5 text-blue-400' />
                <span className='text-sm font-semibold text-blue-400'>
                  SEARCH RESULTS
                </span>
              </div>
              <h2 className='text-4xl font-bold text-white'>
                Results for{" "}
                <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                  "{searchQuery}"
                </span>
              </h2>
              <p className='text-gray-400 mt-2'>
                Found{" "}
                <span className='text-blue-400 font-semibold'>
                  {(filteredResults.channels?.length || 0) +
                    (filteredResults.movies?.length || 0) +
                    (filteredResults.series?.length || 0)}
                </span>{" "}
                results
              </p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className='flex gap-2 flex-wrap'>
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 border ${
                  activeFilter === filter.id ?
                    "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-400/50 shadow-lg shadow-blue-500/20"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <span className='text-base'>{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className='space-y-14'>
            {isGlobalSearchLoading && (
              <div className='flex justify-center py-20'>
                <LoadingSpinner />
              </div>
            )}

            {!isGlobalSearchLoading && !hasResults && (
              <div className='text-center py-20'>
                <div className='text-8xl mb-6 opacity-40'>🔍</div>
                <h3 className='text-2xl font-bold text-white mb-2'>
                  No Results Found
                </h3>
                <p className='text-gray-400 text-lg max-w-md mx-auto'>
                  We couldn't find anything matching "
                  <span className='text-blue-400 font-semibold'>
                    {searchQuery}
                  </span>
                  ". Try a different search term.
                </p>
              </div>
            )}

            {/* Channels Section */}
            {(filteredResults.channels || []).length > 0 && (
              <section className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30'>
                      <Play className='w-10 h-5 text-purple-300' />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>
                      Channels{" "}
                      <span className='text-gray-500'>
                        ({filteredResults.channels?.length || 0})
                      </span>
                    </h3>
                  </div>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                  {(filteredResults.channels || []).map((channel) => (
                    <Link
                      href={`/channels?categoryId=${channel.categoryId}&channelId=${channel.id}`}
                      key={channel.id}
                      className='group'
                    >
                      <div className='relative rounded-xl overflow-hidden bg-slate-800 cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300 h-full'>
                        <div className='relative aspect-square overflow-hidden'>
                          <Image
                            className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                            fill
                            src={channel.streamIcon || "/icon.png"}
                            alt={channel.name}
                            onError={(e) => {
                              e.currentTarget.src = "/icon.png";
                            }}
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                            <div className='p-3 bg-blue-600 rounded-full'>
                              <Play className='w-10 h-5 text-white fill-white' />
                            </div>
                          </div>
                          <div className='absolute top-2 right-2 px-2 py-1 bg-red-600 rounded-full'>
                            <span className='text-xs font-bold text-white flex items-center gap-1'>
                              <span className='w-2 h-2 bg-white rounded-full animate-pulse' />
                              LIVE
                            </span>
                          </div>
                        </div>
                        <div className='p-3 bg-gradient-to-t from-black to-transparent'>
                          <p className='text-white font-semibold text-sm truncate group-hover:text-blue-300 transition-colors'>
                            {channel.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Movies Section */}
            {(filteredResults.movies || []).length > 0 && (
              <section className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg border border-red-500/30'>
                      <Play className='w-10 h-5 text-red-300' />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>
                      Movies{" "}
                      <span className='text-gray-500'>
                        ({(filteredResults.movies || []).length})
                      </span>
                    </h3>
                  </div>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                  {(filteredResults.movies || []).map((movie) => (
                    <Link
                      href={`/movies?categoryId=${movie.categoryId}&movieId=${movie.streamId}`}
                      key={movie.id}
                      className='group'
                    >
                      <div className='relative rounded-xl overflow-hidden bg-slate-800 cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300 h-full'>
                        <div className='relative aspect-[2/3] overflow-hidden'>
                          <Image
                            className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                            fill
                            src={movie.streamIcon || "/icon.png"}
                            alt={movie.name}
                            onError={(e) => {
                              e.currentTarget.src = "/icon.png";
                            }}
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                            <div className='p-3 bg-blue-600 rounded-full'>
                              <Play className='w-10 h-5 text-white fill-white' />
                            </div>
                          </div>
                        </div>
                        <div className='p-3 bg-gradient-to-t from-black to-transparent'>
                          <p className='text-white font-semibold text-sm truncate group-hover:text-blue-300 transition-colors'>
                            {movie.name}
                          </p>
                          <p className='text-yellow-400 text-xs mt-1 font-bold'>
                            ⭐ {parseFloat(movie.rating || "0").toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Series Section */}
            {(filteredResults.series || []).length > 0 && (
              <section className='space-y-6 pb-8'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30'>
                      <Play className='w-10 h-5 text-green-300' />
                    </div>
                    <h3 className='text-2xl font-bold text-white'>
                      Series{" "}
                      <span className='text-gray-500'>
                        ({(filteredResults.series || []).length})
                      </span>
                    </h3>
                  </div>
                </div>

                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                  {(filteredResults.series || []).map((series) => (
                    <Link
                      href={`/series?categoryId=${series.categoryId}&serieId=${series.seriesId}`}
                      key={series.id}
                      className='group'
                    >
                      <div className='relative rounded-xl overflow-hidden bg-slate-800 cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300 h-full'>
                        <div className='relative aspect-[2/3] overflow-hidden'>
                          <Image
                            className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                            fill
                            src={series.cover || "/icon.png"}
                            alt={series.name}
                            onError={(e) => {
                              e.currentTarget.src = "/icon.png";
                            }}
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                            <div className='p-3 bg-blue-600 rounded-full'>
                              <Play className='w-10 h-5 text-white fill-white' />
                            </div>
                          </div>
                        </div>
                        <div className='p-3 bg-gradient-to-t from-black to-transparent'>
                          <p className='text-white font-semibold text-sm truncate group-hover:text-blue-300 transition-colors'>
                            {series.name}
                          </p>
                          <p className='text-yellow-400 text-xs mt-1 font-bold'>
                            ⭐ {parseFloat(series.rating || "0").toFixed(1)}
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
    </div>
  );
}
