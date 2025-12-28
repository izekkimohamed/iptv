import { Flame, Play, Star, TrendingUp, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { trpc } from '@/lib/trpc';
import HorizontalCarousel from '@/src/shared/components/common/HorizontalCarousel';
import { usePlaylistStore } from '@/store/appStore';
import { useWatchedMoviesStore, useWatchedSeriesStore } from '@/store/watchedStore';

import { Button } from '../ui/button';

function HomeLanding() {
  const { selectedPlaylist: playlist } = usePlaylistStore();
  const { movies, removeItem } = useWatchedMoviesStore();
  const { series, removeItem: removeSeriesItem, getProgress } = useWatchedSeriesStore();
  const { data: favoriteChannels } = trpc.channels.getChannels.useQuery(
    {
      favorites: true,
      playlistId: playlist?.id || 0,
    },
    {
      enabled: !!playlist,
    },
  );

  const { data: trendingMovies } = trpc.home.getHome.useQuery();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[90vw] space-y-16 px-4 py-10 sm:px-6 lg:px-8">
        {/* Favorite Channels */}
        {favoriteChannels && favoriteChannels.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-amber-700 bg-amber-950 p-3">
                <Star className="h-8 w-8 text-amber-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Favorite Channels{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    ({favoriteChannels.length})
                  </span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">Your most-watched channels</p>
              </div>
            </div>

            <HorizontalCarousel
              scrollBy={600}
              ariaLabelLeft="Scroll favorites left"
              ariaLabelRight="Scroll favorites right"
            >
              {favoriteChannels?.map((channel) => (
                <Link
                  href={`/channels?categoryId=${channel.categoryId}&channelId=${channel.id}`}
                  key={channel.id}
                  className="group"
                >
                  <div className="sm:w-37.5ex-shrink-0 w-30">
                    <div className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 transition-all duration-300 hover:border-amber-500 hover:shadow-[0_8px_16px_-4px_rgba(245,158,11,0.2)]">
                      <Image
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                        fill
                        src={channel.streamIcon || '/icon.png'}
                        alt={channel.name}
                        onError={(e) => {
                          e.currentTarget.src = '/icon.png';
                        }}
                      />
                      <div className="absolute top-2 left-2 rounded-full border border-red-500/60 bg-red-600/80 px-2 py-0.5 text-[10px] font-bold text-white">
                        LIVE
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="rounded-full bg-amber-500 p-2.5 shadow-lg shadow-amber-600/40">
                          <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                        </div>
                      </div>
                    </div>
                    <p className="mt-2.5 truncate text-center text-xs font-semibold text-white transition-colors group-hover:text-amber-300">
                      {channel.name}
                    </p>
                  </div>
                </Link>
              ))}
            </HorizontalCarousel>
          </section>
        )}

        {/* Continue Watching Movies Section */}
        {movies.filter((item) => item.playlistId === playlist?.id || 0).length > 0 && (
          <>
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-red-700 bg-red-950 p-3">
                <Play className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Continue Watching Movies{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    ({movies.filter((i) => i.playlistId === (playlist?.id || 0)).length})
                  </span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">Resume where you left off</p>
              </div>
            </div>
            <HorizontalCarousel
              scrollBy={800}
              ariaLabelLeft="Scroll continue movies left"
              ariaLabelRight="Scroll continue movies right"
            >
              {movies
                .filter((item) => item.playlistId === playlist?.id || 0)
                .map((item) => {
                  const progress =
                    item.position && item.duration ? item.position / item.duration : 0;

                  return (
                    <Link
                      key={item.id}
                      href={`movies?categoryId=${item.categoryId}&movieId=${item.id}&play=true`}
                      className="group relative w-62.5 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-700 transition-all duration-300 hover:border-amber-500 hover:shadow-[0_12px_24px_-8px_rgba(245,158,11,0.2)]"
                    >
                      <div className="relative bg-slate-800">
                        {/* Thumbnail */}
                        <div className="relative h-75 overflow-hidden bg-slate-800">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            fill
                            src={item.poster || '/icon.png'}
                            alt={item.title || 'Untitled'}
                          />
                          {progress > 0 && (
                            <div className="absolute top-2 left-2 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                              Resume • {Math.round(progress * 100)}%
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="rounded-full bg-amber-500 p-2 shadow-lg shadow-amber-600/40">
                              <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {progress > 0 && (
                          <div className="absolute bottom-0 left-0 h-1.5 w-full bg-slate-800/80">
                            <div
                              className="h-full bg-amber-500 shadow-[inset_0_0_6px_rgba(245,158,11,0.3)]"
                              style={{
                                width: `${Math.min(progress * 100, 100)}%`,
                                transition: 'width 0.3s ease-out',
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div className="border-t border-slate-700 bg-slate-900/80 p-3">
                        <p className="truncate text-xs font-semibold text-white transition-colors group-hover:text-amber-300">
                          {item.title}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          removeItem(item.id, playlist?.id || 0);
                        }}
                        className="absolute top-2 right-2 cursor-pointer rounded-full bg-black/20 p-1.5 text-white shadow-md backdrop-blur-sm transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Link>
                  );
                })}
            </HorizontalCarousel>
          </>
        )}

        {/* Continue Watching Series Section */}
        {series.filter((item) => item.playlistId === playlist?.id || 0).length > 0 && (
          <>
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-emerald-700 bg-emerald-950 p-3">
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Continue Watching Series{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    ({series.filter((i) => i.playlistId === (playlist?.id || 0)).length})
                  </span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">Pick up where you left off</p>
              </div>
            </div>
            <HorizontalCarousel
              scrollBy={800}
              ariaLabelLeft="Scroll continue series left"
              ariaLabelRight="Scroll continue series right"
            >
              {series
                .filter((item) => item.playlistId === playlist?.id || 0)
                .map((item) => {
                  const progress = getProgress(item.id, playlist?.id || 0) ?? 0;
                  const episode = item.episodes[item.episodes.length - 1];

                  return (
                    <Link
                      key={item.id}
                      href={`series?categoryId=${item.categoryId}&serieId=${item.id}&seasonId=${episode.seasonId}&episodeNumber=${episode.episodeNumber}`}
                      className="group relative w-62.5 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-700 transition-all duration-300 hover:border-amber-500 hover:shadow-[0_12px_24px_-8px_rgba(245,158,11,0.2)]"
                    >
                      <div className="relative bg-slate-800">
                        {/* Thumbnail */}
                        <div className="relative h-75 overflow-hidden bg-slate-800">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            fill
                            src={item.poster || '/icon.png'}
                            alt={item.title || 'Untitled'}
                          />
                          <div className="absolute top-2 left-2 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                            Resume • S{episode.seasonId}E{episode.episodeNumber}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="rounded-full bg-amber-500 p-2 shadow-lg shadow-amber-600/40">
                              <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {progress > 0 && (
                          <div className="bottom-0 left-0 h-1.5 w-full bg-slate-800/80">
                            <div
                              className="h-full bg-amber-500 shadow-[inset_0_0_6px_rgba(245,158,11,0.3)]"
                              style={{
                                width: `${Math.min(progress * 100, 100)}%`,
                                transition: 'width 0.3s ease-out',
                              }}
                            />
                          </div>
                        )}
                        {/* Title & Episode */}
                        <div className="space-y-1 overflow-hidden border-t border-slate-700 bg-slate-900/80 p-3">
                          <p className="truncate text-xs font-semibold text-white transition-colors group-hover:text-amber-300">
                            {item.title}
                          </p>
                          <p className="text-xs font-semibold text-amber-400">
                            S{episode.seasonId}E{episode.episodeNumber}
                          </p>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          removeSeriesItem(item.id);
                        }}
                        className="absolute top-2 right-2 cursor-pointer rounded-full bg-black/20 p-1.5 text-white shadow-md backdrop-blur-sm transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Link>
                  );
                })}
            </HorizontalCarousel>
          </>
        )}

        {/* Popular Movies Section */}
        {trendingMovies?.movies && trendingMovies.movies.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-red-700 bg-red-950 p-3">
                <Flame className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Popular Movies{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    ({trendingMovies?.movies?.length || 0})
                  </span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">Trending now on StreamMax</p>
              </div>
            </div>

            <HorizontalCarousel
              scrollBy={800}
              ariaLabelLeft="Scroll popular movies left"
              ariaLabelRight="Scroll popular movies right"
            >
              {trendingMovies?.movies?.slice(0, 12).map((movie) => (
                <Link
                  href={`movies/movie?movieId=${movie.id}`}
                  key={movie.id}
                  className="group w-62.5 shrink-0"
                >
                  <div className="relative cursor-pointer overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 transition-all duration-300 hover:border-amber-500 hover:shadow-[0_12px_24px_-8px_rgba(245,158,11,0.2)]">
                    <div className="relative h-100 overflow-hidden">
                      <Image
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                        src={movie.backdropUrl || '/icon.png'}
                        alt={movie.title}
                      />
                      {movie.releaseDate && (
                        <div className="absolute top-2 left-2 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {movie.releaseDate.split('-')[0]}
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="rounded-full bg-amber-500 p-3 shadow-lg shadow-amber-600/40">
                          <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-0 bottom-0 left-0 border-t border-white/5 bg-black/90 p-4">
                      <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-amber-300">
                        {movie.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {movie.releaseDate?.split('-')[0]}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </HorizontalCarousel>
          </section>
        )}

        {/* Popular Series Section */}
        {trendingMovies?.series && trendingMovies.series.length > 0 && (
          <section className="space-y-6 pb-8">
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-emerald-700 bg-emerald-950 p-3">
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Popular Series{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    ({trendingMovies?.series?.length || 0})
                  </span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">Binge-worthy shows trending now</p>
              </div>
            </div>

            <HorizontalCarousel
              scrollBy={800}
              ariaLabelLeft="Scroll popular series left"
              ariaLabelRight="Scroll popular series right"
            >
              {trendingMovies?.series?.slice(0, 12).map((s) => (
                <div key={s.id} className="group w-62.5 shrink-0">
                  <div className="relative cursor-pointer overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 transition-all duration-300 hover:border-amber-500 hover:shadow-[0_12px_24px_-8px_rgba(245,158,11,0.2)]">
                    <div className="relative h-100 overflow-hidden">
                      <Image
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                        src={s.backdropUrl || '/icon.png'}
                        alt={s.name}
                      />
                      {s.firstAirDate && (
                        <div className="absolute top-2 left-2 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {s.firstAirDate.split('-')[0]}
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="rounded-full bg-amber-500 p-3 shadow-lg shadow-amber-600/40">
                          <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-0 bottom-0 left-0 border-t border-white/5 bg-black/90 p-4">
                      <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-amber-300">
                        {s.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{s.firstAirDate?.split('-')[0]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </HorizontalCarousel>
          </section>
        )}
      </div>
    </div>
  );
}

export default HomeLanding;
