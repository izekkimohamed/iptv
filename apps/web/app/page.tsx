"use client";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useDebounce } from "@/hooks/useDebounce";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { Clock, Play, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function IPTVHomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay

  const { selectedPlaylist: playlist } = usePlaylistStore();
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
      { query: debouncedSearchQuery }, // Use debounced value instead
      { enabled: debouncedSearchQuery.trim().length > 0 }
    );

  if (!searchQuery.trim().length) {
    return (
      <div className='h-screen flex flex-col  overflow-hidden'>
        {/* Header - Fixed */}
        <div className='flex-shrink-0 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md'>
          <div className='max-w-2xl mx-auto'>
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300' />
              <div className='relative bg-slate-900 rounded-full px-6 py-3 flex items-center gap-4'>
                <Search className='w-5 h-5 text-blue-400 flex-shrink-0' />
                <input
                  type='text'
                  placeholder='Search channels, movies, series...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm'
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className='text-gray-400 hover:text-white transition-colors flex-shrink-0'
                  >
                    <X className='w-5 h-5' />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto'>
          <div className='max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12'>
            {/* Favorite Channels */}
            <section>
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg'>
                  <span className='text-lg'>⭐</span>
                </div>
                <h2 className='text-2xl font-bold text-white'>
                  Favorite Channels
                </h2>
              </div>

              <div className='flex gap-4 overflow-x-auto pb-2 scroll-smooth'>
                {favoriteChannels?.map((channel) => (
                  <Link
                    href={`/channels?categoryId=${channel.categoryId}&channelId=${channel.id}`}
                    key={channel.id}
                    className='min-w-[140px] flex-shrink-0'
                  >
                    <div className='group relative rounded-2xl overflow-hidden aspect-square bg-slate-800 cursor-pointer'>
                      <Image
                        className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                        fill
                        src={channel.streamIcon || "/icon.png"}
                        alt={channel.name}
                        onError={(e) => {
                          e.currentTarget.src = "/icon.png";
                        }}
                      />
                      <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                        <Play className='w-7 h-7 text-white fill-white' />
                      </div>
                    </div>
                    <p className='mt-2 text-white font-semibold text-xs truncate'>
                      {channel.name}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Continue Watching */}
            <section>
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg'>
                  <Clock className='w-5 h-5 text-white' />
                </div>
                <h2 className='text-2xl font-bold text-white'>
                  Continue Watching
                </h2>
              </div>

              <div className='flex gap-4 overflow-x-auto pb-2 scroll-smooth'>
                {/* {[...sampleContinueWatching].map((item, idx) => (
                  <Link
                    href={`/channels?categoryId=${item.categoryId}&channelId=${item.id}`}
                    key={idx}
                    className='min-w-[320px] flex-shrink-0'
                  >
                    <div className='group relative rounded-xl overflow-hidden bg-slate-800 cursor-pointer w-[320px]'>
                      <div className='relative w-[320px] h-[180px] overflow-hidden'>
                        <Image
                          className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-300'
                          fill
                          src={item.streamIcon}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src = "/icon.png";
                          }}
                        />
                        <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                          <button className='p-4 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors'>
                            <Play className='w-8 h-8 text-white fill-white' />
                          </button>
                        </div>
                      </div>
                      <div className='p-3'>
                        <p className='text-white font-semibold text-sm truncate'>
                          {item.name}
                        </p>
                        <div className='mt-2 h-1 bg-slate-700 rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-blue-500 rounded-full'
                            style={{ width: `${item.watchProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))} */}
              </div>
            </section>

            {/* Movies Section */}
            <section>
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg'>
                  <Play className='w-5 h-5 text-white' />
                </div>
                <h2 className='text-2xl font-bold text-white'>
                  Popular Movies
                </h2>
              </div>

              <div className='flex gap-4 px-3 py-1 overflow-x-auto pb-2 scroll-smooth'>
                {trendingMovies?.movies?.map((movie) => (
                  <div key={movie.id} className='min-w-[140px] flex-shrink-0'>
                    <div className='group relative rounded-lg overflow-hidden bg-slate-800 cursor-pointer w-[140px]'>
                      <div className='relative aspect-[2/3] overflow-hidden'>
                        <Image
                          className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                          fill
                          src={movie.backdropUrl || "/icon.png"}
                          alt={movie.title}
                        />
                        <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                          <button className='p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors'>
                            <Play className='w-6 h-6 text-white fill-white' />
                          </button>
                        </div>
                      </div>
                      <div className='p-2'>
                        <p className='text-white font-semibold text-xs truncate'>
                          {movie.title}
                        </p>
                        <p className='text-gray-400 text-xs mt-1'>
                          {movie.releaseDate}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Series Section */}
            <section>
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg'>
                  <Play className='w-5 h-5 text-white' />
                </div>
                <h2 className='text-2xl font-bold text-white'>
                  Popular Series
                </h2>
              </div>

              <div className='flex gap-4 px-5 py-1 overflow-x-auto pb-2 scroll-smooth overflow-ellipsis'>
                {trendingMovies?.series?.map((s) => (
                  <div key={s.id} className='min-w-[140px] flex-shrink-0'>
                    <div className='group relative rounded-lg overflow-hidden bg-slate-800 cursor-pointer w-[140px]'>
                      <div className='relative aspect-[2/3] overflow-hidden'>
                        <Image
                          className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                          fill
                          src={s.backdropUrl || "/icon.png"}
                          alt={s.name}
                        />
                        <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                          <button className='p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors'>
                            <Play className='w-6 h-6 text-white fill-white' />
                          </button>
                        </div>
                      </div>
                      <div className='p-2'>
                        <p className='text-white font-semibold text-xs truncate'>
                          {s.name}
                        </p>
                        <p className='text-gray-400 text-xs mt-1'>
                          {s.firstAirDate}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen flex flex-col overflow-hidden'>
      {/* Header - Fixed */}
      <div className='flex-shrink-0 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md'>
        <div className='max-w-2xl mx-auto'>
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300' />
            <div className='relative bg-slate-900 rounded-full px-6 py-3 flex items-center gap-4'>
              <Search className='w-5 h-5 text-blue-400 flex-shrink-0' />
              <input
                type='text'
                placeholder='Search channels, movies, series...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className='text-gray-400 hover:text-white transition-colors flex-shrink-0'
                >
                  <X className='w-5 h-5' />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto'>
        <div className='max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12'>
          <div className='text-white'>
            <h2 className='text-2xl font-bold mb-4'>Search Results</h2>
            <p>Showing results for "{searchQuery}"</p>
            <div className='space-y-12'>
              {isGlobalSearchLoading && <LoadingSpinner />}
              {/* Channels Section */}
              {globalSearchResults && globalSearchResults?.channels?.length && (
                <section>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg'>
                      <Play className='w-5 h-5 text-white' />
                    </div>
                    <h2 className='text-2xl font-bold text-white'>
                      Channels ({globalSearchResults.channels.length})
                    </h2>
                  </div>

                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                    {globalSearchResults.channels.map((channel) => (
                      <Link
                        href={`/channels?categoryId=${channel.categoryId}&channelId=${channel.id}`}
                        key={channel.id}
                      >
                        <div className='group relative rounded-lg overflow-hidden bg-slate-800 cursor-pointer'>
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
                            <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                              <button className='p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors'>
                                <Play className='w-6 h-6 text-white fill-white' />
                              </button>
                            </div>
                          </div>
                          <div className='p-3'>
                            <p className='text-white font-semibold text-xs truncate'>
                              {channel.name}
                            </p>
                            <p className='text-blue-400 text-xs mt-1'>
                              🔴 LIVE
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Movies Section */}
              {globalSearchResults && globalSearchResults.movies && (
                <section>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg'>
                      <Play className='w-5 h-5 text-white' />
                    </div>
                    <h2 className='text-2xl font-bold text-white'>
                      Movies ({globalSearchResults.movies.length})
                    </h2>
                  </div>

                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                    {globalSearchResults.movies.map((movie) => (
                      <Link
                        href={`movies?categoryId=${movie.categoryId}&movieId=${movie.streamId}`}
                        key={movie.id}
                      >
                        <div className='group relative rounded-lg overflow-hidden bg-slate-800 cursor-pointer'>
                          <div className='relative aspect-[2/3] overflow-hidden'>
                            <Image
                              className='object-fill w-full h-full group-hover:scale-110 transition-transform duration-300'
                              fill
                              src={movie.streamIcon || "/icon.png"}
                              alt={movie.name}
                              onError={(e) => {
                                e.currentTarget.src = "/icon.png";
                              }}
                            />
                            <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                              <button className='p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors'>
                                <Play className='w-6 h-6 text-white fill-white' />
                              </button>
                            </div>
                          </div>
                          <div className='p-3'>
                            <p className='text-white font-semibold text-xs truncate'>
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
              {globalSearchResults && globalSearchResults.series && (
                <section>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg'>
                      <Play className='w-5 h-5 text-white' />
                    </div>
                    <h2 className='text-2xl font-bold text-white'>
                      Series ({globalSearchResults.series.length})
                    </h2>
                  </div>

                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                    {globalSearchResults.series.map((series) => (
                      <Link
                        href={`/play?type=series&id=${series.id}&url=${encodeURIComponent(
                          series.url
                        )}`}
                        key={series.id}
                      >
                        <div className='group relative rounded-lg overflow-hidden bg-slate-800 cursor-pointer'>
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
                            <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                              <button className='p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors'>
                                <Play className='w-6 h-6 text-white fill-white' />
                              </button>
                            </div>
                          </div>
                          <div className='p-3'>
                            <p className='text-white font-semibold text-xs truncate'>
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
    </div>
  );
}
