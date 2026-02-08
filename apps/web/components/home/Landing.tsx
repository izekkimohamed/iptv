'use client';

import { Clock, Flame, Play, Star, TrendingUp, Tv, X } from 'lucide-react';
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
    <div className="flex-1 overflow-y-auto overflow-x-hidden">

      <div className="mx-auto max-w-[85vw] space-y-20 px-6 py-12 lg:px-12">
        {/* Favorite Channels */}
        {favoriteChannels && favoriteChannels.length > 0 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 fill-mode-both">
            <div className="flex items-end justify-between border-b border-white/5 pb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 text-primary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10">
                    <Star className="h-4 w-4 fill-primary" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Your Selection</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
                   Favorite <span className="text-primary italic">Channels</span>
                </h2>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-2xl font-black tabular-nums text-foreground/80">
                  {favoriteChannels.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  Total Channels
                </p>
              </div>
            </div>

            <HorizontalCarousel scrollBy={600}>
              {favoriteChannels?.map((channel) => (
                <Link
                  href={`/channels?categoryId=${channel.categoryId}&channelId=${channel.id}`}
                  key={channel.id}
                  className="group relative flex w-32 shrink-0 flex-col gap-3 sm:w-40"
                >
                  <div className="relative aspect-square overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                    <Image
                      className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                      fill
                      src={channel.streamIcon || '/icon.png'}
                      alt={channel.name}
                      onError={(e) => {
                        e.currentTarget.src = '/icon.png';
                      }}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-sm bg-red-500 px-2 py-0.5 text-[9px] font-black tracking-widest text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                      LIVE
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform duration-300 group-hover:scale-110">
                        <Play className="ml-1 h-6 w-6 fill-current" />
                      </div>
                    </div>
                  </div>
                  <p className="truncate text-center text-sm font-semibold transition-colors group-hover:text-primary">
                    {channel.name}
                  </p>
                </Link>
              ))}
            </HorizontalCarousel>
          </section>
        )}

        {/* Continue Watching Movies Section */}
        {movies.filter((item) => item.playlistId === playlist?.id || 0).length > 0 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 fill-mode-both">
             <div className="flex items-end justify-between border-b border-white/5 pb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 text-primary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Pick up where you left</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
                   Continue <span className="text-primary italic">Watching</span>
                </h2>
              </div>
            </div>

            <HorizontalCarousel scrollBy={800}>
              {movies
                .filter((item) => item.playlistId === playlist?.id || 0)
                .map((item) => {
                  const progress = item.position && item.duration ? item.position / item.duration : 0;
                  return (
                    <div key={item.id} className="group relative w-64 shrink-0 lg:w-72">
                      <Link
                        href={`movies?categoryId=${item.categoryId}&movieId=${item.id}&play=true`}
                        className="block overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
                      >
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            fill
                            src={item.poster || '/icon.png'}
                            alt={item.title || 'Untitled'}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                             <div className="flex items-center gap-2 rounded-full bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
                                {Math.round(progress * 100)}% Complete
                             </div>
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                             <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                                <Play className="ml-0.5 h-6 w-6 text-white fill-white" />
                             </div>
                          </div>
                        </div>

                        <div className="p-4">
                           <p className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                             {item.title}
                           </p>
                           {/* Progress Bar */}
                           <div className="mt-3 relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-1000 group-hover:brightness-125"
                                style={{ width: `${Math.round(progress * 100)}%` }}
                              />
                           </div>
                        </div>
                      </Link>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          removeItem(item.id, playlist?.id || 0);
                        }}
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border border-white/10 text-muted-foreground opacity-0 transition-all duration-300 hover:text-destructive group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
            </HorizontalCarousel>
          </section>
        )}

        {/* Continue Watching Series Section */}
        {series.filter((s) => s.playlistId === playlist?.id || 0).length > 0 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 fill-mode-both">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Tv className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Resume Series</span>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl text-nowrap">
                  Keep Watching
                </h2>
              </div>
            </div>

            <HorizontalCarousel scrollBy={800}>
              {series
                .filter((s) => s.playlistId === playlist?.id || 0)
                .map((s) => {
                  const lastEp = s.episodes[s.episodes.length - 1];
                  if (!lastEp) return null;
                  const progress = lastEp.duration > 0 ? lastEp.position / lastEp.duration : 0;

                  return (
                    <div key={s.id} className="group relative w-64 shrink-0 lg:w-72">
                      <Link
                        href={`series?categoryId=${s.categoryId}&serieId=${s.id}&seasonId=${lastEp.seasonId}&episodeNumber=${lastEp.episodeNumber}&play=true`}
                        className="block overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
                      >
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            fill
                            src={s.poster || '/icon.png'}
                            alt={s.title || 'Untitled'}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                          <div className="absolute top-3 left-3">
                             <div className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-black text-primary backdrop-blur-md border border-primary/20">
                                S{lastEp.seasonId} E{lastEp.episodeNumber}
                             </div>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                             <div className="flex items-center gap-2 rounded-full bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
                                {Math.round(progress * 100)}% Complete
                             </div>
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                             <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                                <Play className="ml-0.5 h-6 w-6 text-white fill-white" />
                             </div>
                          </div>
                        </div>

                        <div className="p-4">
                           <p className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                             {s.title}
                           </p>
                           {/* Progress Bar */}
                           <div className="mt-3 relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-1000 group-hover:brightness-125"
                                style={{ width: `${Math.round(progress * 100)}%` }}
                              />
                           </div>
                        </div>
                      </Link>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          removeSeriesItem(s.id);
                        }}
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border border-white/10 text-muted-foreground opacity-0 transition-all duration-300 hover:text-destructive group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
            </HorizontalCarousel>
          </section>
        )}

        {/* Popular Movies Section */}
        {trendingMovies?.movies && trendingMovies.movies.length > 0 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-400 fill-mode-both">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Flame className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Trending</span>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  Popular Movies
                </h2>
              </div>
            </div>

            <HorizontalCarousel scrollBy={800}>
              {trendingMovies?.movies?.slice(0, 15).map((movie) => (
                <Link
                  href={`movies/movie?movieId=${movie.id}`}
                  key={movie.id}
                  className="group relative w-48 shrink-0 lg:w-56"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_40px_rgba(var(--primary),0.2)]">
                    <Image
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      fill
                      src={movie.backdropUrl || '/icon.png'}
                      alt={movie.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    {/* Hover Info */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                       <div className="mb-2 flex items-center gap-1.5">
                          <div className="rounded border border-primary/50 bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                             {movie.releaseDate?.split('-')[0] || 'N/A'}
                          </div>
                       </div>
                       <p className="line-clamp-2 text-sm font-bold text-white">
                          {movie.title}
                       </p>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="h-16 w-16 translate-y-4 rounded-full bg-primary opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="flex h-full w-full items-center justify-center">
                             <Play className="ml-1 h-8 w-8 fill-primary-foreground text-primary-foreground" />
                          </div>
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </HorizontalCarousel>
          </section>
        )}

        {/* Popular Series Section */}
        {trendingMovies?.series && trendingMovies.series.length > 0 && (
          <section className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 fill-mode-both">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Binge-worthy</span>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  Popular Series
                </h2>
              </div>
            </div>

            <HorizontalCarousel scrollBy={800}>
              {trendingMovies?.series?.slice(0, 15).map((s) => (
                <div key={s.id} className="group relative w-48 shrink-0 lg:w-56">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all duration-500 group-hover:border-primary/50">
                    <Image
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      fill
                      src={s.backdropUrl || '/icon.png'}
                      alt={s.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                       <p className="line-clamp-2 text-sm font-bold text-white">
                          {s.name}
                       </p>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="h-12 w-12 rounded-full bg-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                          <div className="flex h-full w-full items-center justify-center">
                             <Play className="ml-1 h-6 w-6 fill-primary-foreground text-primary-foreground" />
                          </div>
                       </div>
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

