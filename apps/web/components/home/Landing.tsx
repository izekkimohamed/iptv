'use client';

import { Flame, Play, Star, TrendingUp, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { trpc } from '@/lib/trpc';
import HorizontalCarousel from '@/src/shared/components/common/HorizontalCarousel';
import { usePlaylistStore, useWatchedMoviesStore, useWatchedSeriesStore } from '@repo/store';

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
      <div className="mx-auto max-w-[90vw] space-y-20 px-4 py-12 sm:px-6 lg:px-8">
        {/* Favorite Channels */}
        {favoriteChannels && favoriteChannels.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="relative rounded-2xl border border-amber-500/30 bg-linear-to-br from-amber-950 to-amber-900/50 p-4 shadow-lg shadow-amber-900/30">
                <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-xl" />
                <Star className="relative h-9 w-9 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              </div>
              <div>
                <h2 className="bg-linear-to-r from-white to-slate-300 bg-clip-text text-4xl font-bold text-transparent">
                  Favorite Channels{' '}
                  <span className="text-sm font-semibold text-slate-500">
                    ({favoriteChannels.length})
                  </span>
                </h2>
                <p className="mt-1.5 text-sm font-medium text-slate-400">
                  Your most-watched channels
                </p>
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
                    <div className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-700/50 bg-slate-800 shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/30">
                      <Image
                        className="h-full w-full transition-transform duration-500 group-hover:scale-110"
                        fill
                        src={channel.streamIcon || '/icon.png'}
                        alt={channel.name}
                        onError={(e) => {
                          e.currentTarget.src = '/icon.png';
                        }}
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-red-400/60 bg-linear-to-r from-red-600 to-red-500 px-2.5 py-1 shadow-lg shadow-red-600/40">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                        <span className="text-[10px] font-bold tracking-wide text-white uppercase">
                          Live
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/70 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="rounded-full bg-linear-to-br from-amber-400 to-amber-600 p-3 shadow-2xl ring-4 shadow-amber-600/50 ring-amber-400/30 transition-transform duration-300 group-hover:scale-110">
                          <Play className="ml-0.5 h-5 w-5 fill-white text-white drop-shadow-lg" />
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 truncate text-center text-sm font-semibold text-slate-200 transition-colors group-hover:text-amber-400">
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
          <section className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="relative rounded-2xl border border-red-500/30 bg-linear-to-br from-red-950 to-red-900/50 p-4 shadow-lg shadow-red-900/30">
                <div className="absolute inset-0 rounded-2xl bg-red-400/10 blur-xl" />
                <Play className="relative h-9 w-9 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
              </div>
              <div>
                <h2 className="bg-linear-to-r from-white to-slate-300 bg-clip-text text-4xl font-bold text-transparent">
                  Continue Watching Movies{' '}
                  <span className="text-sm font-semibold text-slate-500">
                    ({movies.filter((i) => i.playlistId === (playlist?.id || 0)).length})
                  </span>
                </h2>
                <p className="mt-1.5 text-sm font-medium text-slate-400">
                  Resume where you left off
                </p>
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
                      className="group relative w-62.5 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-700/50 shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/30"
                    >
                      <div className="relative bg-slate-800">
                        <div className="relative h-75 overflow-hidden bg-slate-800">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            fill
                            src={item.poster || '/icon.png'}
                            alt={item.title || 'Untitled'}
                          />
                          {progress > 0 && (
                            <div className="absolute top-3 left-3 rounded-full border border-white/20 bg-black/80 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md">
                              Resume • {Math.round(progress * 100)}%
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/80 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="rounded-full bg-linear-to-br from-amber-400 to-amber-600 p-3 shadow-2xl ring-4 shadow-amber-600/50 ring-amber-400/30 transition-transform duration-300 group-hover:scale-110">
                              <Play className="ml-0.5 h-6 w-6 fill-white text-white drop-shadow-lg" />
                            </div>
                          </div>
                        </div>

                        {progress > 0 && (
                          <div className="absolute bottom-0 left-0 h-2 w-full overflow-hidden bg-slate-900/60 backdrop-blur-sm">
                            <div
                              className="h-full bg-linear-to-r from-amber-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                              style={{
                                width: `${Math.min(progress * 100, 100)}%`,
                                transition: 'width 0.3s ease-out',
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-700/50 bg-linear-to-b from-slate-900/95 to-slate-950/95 p-4 backdrop-blur-sm">
                        <p className="truncate text-sm font-semibold text-slate-100 transition-colors group-hover:text-amber-400">
                          {item.title}
                        </p>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          removeItem(item.id, playlist?.id || 0);
                        }}
                        className="absolute top-3 right-3 cursor-pointer rounded-full border border-white/10 bg-black/60 p-2 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-red-400/50 hover:bg-red-500/80"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Link>
                  );
                })}
            </HorizontalCarousel>
          </section>
        )}

        {/* Continue Watching Series Section */}
        {series.filter((item) => item.playlistId === playlist?.id || 0).length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="relative rounded-2xl border border-emerald-500/30 bg-linear-to-br from-emerald-950 to-emerald-900/50 p-4 shadow-lg shadow-emerald-900/30">
                <div className="absolute inset-0 rounded-2xl bg-emerald-400/10 blur-xl" />
                <TrendingUp className="relative h-9 w-9 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              </div>
              <div>
                <h2 className="bg-linear-to-r from-white to-slate-300 bg-clip-text text-4xl font-bold text-transparent">
                  Continue Watching Series{' '}
                  <span className="text-sm font-semibold text-slate-500">
                    ({series.filter((i) => i.playlistId === (playlist?.id || 0)).length})
                  </span>
                </h2>
                <p className="mt-1.5 text-sm font-medium text-slate-400">
                  Pick up where you left off
                </p>
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
                      className="group relative w-62.5 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-700/50 shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/30"
                    >
                      {/* Enhanced series card design */}
                      <div className="relative bg-slate-800">
                        <div className="relative h-75 overflow-hidden bg-slate-800">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            fill
                            src={item.poster || '/icon.png'}
                            alt={item.title || 'Untitled'}
                          />
                          <div className="absolute top-3 left-3 rounded-full border border-white/20 bg-black/80 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md">
                            Resume • S{episode.seasonId}E{episode.episodeNumber}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/80 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="rounded-full bg-linear-to-br from-amber-400 to-amber-600 p-3 shadow-2xl ring-4 shadow-amber-600/50 ring-amber-400/30 transition-transform duration-300 group-hover:scale-110">
                              <Play className="ml-0.5 h-6 w-6 fill-white text-white drop-shadow-lg" />
                            </div>
                          </div>
                        </div>

                        {progress > 0 && (
                          <div className="absolute bottom-0 left-0 h-2 w-full overflow-hidden bg-slate-900/60 backdrop-blur-sm">
                            <div
                              className="h-full bg-linear-to-r from-amber-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                              style={{
                                width: `${Math.min(progress * 100, 100)}%`,
                                transition: 'width 0.3s ease-out',
                              }}
                            />
                          </div>
                        )}

                        <div className="space-y-1.5 overflow-hidden border-t border-slate-700/50 bg-linear-to-b from-slate-900/95 to-slate-950/95 p-4 backdrop-blur-sm">
                          <p className="truncate text-sm font-semibold text-slate-100 transition-colors group-hover:text-amber-400">
                            {item.title}
                          </p>
                          <p className="text-xs font-semibold text-amber-400">
                            Season {episode.seasonId} • Episode {episode.episodeNumber}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          removeSeriesItem(item.id);
                        }}
                        className="absolute top-3 right-3 cursor-pointer rounded-full border border-white/10 bg-black/60 p-2 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-red-400/50 hover:bg-red-500/80"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Link>
                  );
                })}
            </HorizontalCarousel>
          </section>
        )}

        {/* Popular Movies Section */}
        {trendingMovies?.movies && trendingMovies.movies.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="relative rounded-2xl border border-red-500/30 bg-linear-to-br from-red-950 to-red-900/50 p-4 shadow-lg shadow-red-900/30">
                <div className="absolute inset-0 rounded-2xl bg-red-400/10 blur-xl" />
                <Flame className="relative h-9 w-9 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
              </div>
              <div>
                <h2 className="bg-linear-to-r from-white to-slate-300 bg-clip-text text-4xl font-bold text-transparent">
                  Popular Movies{' '}
                  <span className="text-sm font-semibold text-slate-500">
                    ({trendingMovies?.movies?.length || 0})
                  </span>
                </h2>
                <p className="mt-1.5 text-sm font-medium text-slate-400">
                  Trending now on StreamMax
                </p>
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
                  <div className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-700/50 bg-slate-800 shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/30">
                    <div className="relative h-100 overflow-hidden">
                      <Image
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        fill
                        src={movie.backdropUrl || '/icon.png'}
                        alt={movie.title}
                      />
                      {movie.releaseDate && (
                        <div className="absolute top-3 left-3 rounded-full border border-white/20 bg-black/80 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md">
                          {movie.releaseDate.split('-')[0]}
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/80 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="rounded-full bg-linear-to-br from-amber-400 to-amber-600 p-4 shadow-2xl ring-4 shadow-amber-600/50 ring-amber-400/30 transition-transform duration-300 group-hover:scale-110">
                          <Play className="ml-0.5 h-7 w-7 fill-white text-white drop-shadow-lg" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-0 bottom-0 left-0 rounded-b-2xl border-t border-white/10 bg-linear-to-t from-black/95 via-black/90 to-transparent p-4 backdrop-blur-sm">
                      <p className="truncate text-sm font-bold text-white transition-colors group-hover:text-amber-400">
                        {movie.title}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
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
          <section className="space-y-8 pb-12">
            <div className="flex items-center gap-5">
              <div className="relative rounded-2xl border border-emerald-500/30 bg-linear-to-br from-emerald-950 to-emerald-900/50 p-4 shadow-lg shadow-emerald-900/30">
                <div className="absolute inset-0 rounded-2xl bg-emerald-400/10 blur-xl" />
                <TrendingUp className="relative h-9 w-9 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              </div>
              <div>
                <h2 className="bg-linear-to-r from-white to-slate-300 bg-clip-text text-4xl font-bold text-transparent">
                  Popular Series{' '}
                  <span className="text-sm font-semibold text-slate-500">
                    ({trendingMovies?.series?.length || 0})
                  </span>
                </h2>
                <p className="mt-1.5 text-sm font-medium text-slate-400">
                  Binge-worthy shows trending now
                </p>
              </div>
            </div>

            <HorizontalCarousel
              scrollBy={800}
              ariaLabelLeft="Scroll popular series left"
              ariaLabelRight="Scroll popular series right"
            >
              {trendingMovies?.series?.slice(0, 12).map((s) => (
                <div key={s.id} className="group w-62.5 shrink-0">
                  <div className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-700/50 bg-slate-800 shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/30">
                    <div className="relative h-100">
                      <Image
                        className="h-full w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-110"
                        fill
                        src={s.backdropUrl || '/icon.png'}
                        alt={s.name}
                      />
                      {s.firstAirDate && (
                        <div className="absolute top-3 left-3 rounded-full border border-white/20 bg-black/80 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md">
                          {s.firstAirDate.split('-')[0]}
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/80 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="rounded-full bg-linear-to-br from-amber-400 to-amber-600 p-4 shadow-2xl ring-4 shadow-amber-600/50 ring-amber-400/30 transition-transform duration-300 group-hover:scale-110">
                          <Play className="ml-0.5 h-7 w-7 fill-white text-white drop-shadow-lg" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-0 bottom-0 left-0 overflow-hidden rounded-b-2xl border-t border-white/10 bg-linear-to-t from-black/95 via-black/90 to-transparent p-4 backdrop-blur-sm">
                      <p className="truncate text-sm font-bold text-white transition-colors group-hover:text-amber-400">
                        {s.name}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {s.firstAirDate?.split('-')[0]}
                      </p>
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
