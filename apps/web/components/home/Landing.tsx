import { trpc } from '@/lib/trpc';
import HorizontalCarousel from '@/src/shared/components/common/HorizontalCarousel';
import { usePlaylistStore } from '@/store/appStore';
import { useWatchedMoviesStore, useWatchedSeriesStore } from '@/store/watchedStore';
import { Flame, Play, Star, TrendingUp, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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
      <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Favorite Channels */}
        {favoriteChannels && favoriteChannels.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-950 rounded-xl border border-amber-700">
                <Star className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Favorite Channels{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    ({favoriteChannels.length})
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">Your most-watched channels</p>
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
                  <div className="w-[150px] flex-shrink-0">
                    <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-800 cursor-pointer border border-slate-700 hover:border-amber-500 transition-all duration-300 hover:shadow-[0_8px_16px_-4px_rgba(245,158,11,0.2)]">
                      <Image
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                        fill
                        src={channel.streamIcon || '/icon.png'}
                        alt={channel.name}
                        onError={(e) => {
                          e.currentTarget.src = '/icon.png';
                        }}
                      />
                      <div className="absolute left-2 top-2 bg-red-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/60">
                        LIVE
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="p-2.5 bg-amber-500 rounded-full shadow-lg shadow-amber-600/40">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="mt-2.5 text-white font-semibold text-center text-xs truncate group-hover:text-amber-300 transition-colors">
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
              <div className="p-3 bg-red-950 rounded-xl border border-red-700">
                <Play className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Continue Watching Movies{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    ({movies.filter((i) => i.playlistId === (playlist?.id || 0)).length})
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">Resume where you left off</p>
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
                      className="relative group w-[250px] flex-shrink-0 rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-amber-500 transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(245,158,11,0.2)]"
                    >
                      <div className="relative bg-slate-800">
                        {/* Thumbnail */}
                        <div className="relative h-[300px] overflow-hidden bg-slate-800">
                          <Image
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            fill
                            src={item.poster || '/icon.png'}
                            alt={item.title || 'Untitled'}
                          />
                          {progress > 0 && (
                            <div className="absolute left-2 top-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                              Resume • {Math.round(progress * 100)}%
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="p-2 bg-amber-500 rounded-full shadow-lg shadow-amber-600/40">
                              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {progress > 0 && (
                          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-800/80 ">
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
                      <div className="p-3 bg-slate-900/80  border-t border-slate-700">
                        <p className="text-white font-semibold text-xs truncate group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          removeItem(item.id, playlist?.id || 0);
                        }}
                        className="absolute top-2 right-2  text-white rounded-full p-1.5 backdrop-blur-sm bg-black/20  cursor-pointer transition-all duration-200 shadow-md "
                      >
                        <X className="w-4 h-4" />
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
              <div className="p-3 bg-emerald-950 rounded-xl border border-emerald-700">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Continue Watching Series{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    ({series.filter((i) => i.playlistId === (playlist?.id || 0)).length})
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">Pick up where you left off</p>
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
                      className="relative group w-[250px] flex-shrink-0 rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-amber-500 transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(245,158,11,0.2)]"
                    >
                      <div className="relative bg-slate-800">
                        {/* Thumbnail */}
                        <div className="relative h-[300px] overflow-hidden bg-slate-800">
                          <Image
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            fill
                            src={item.poster || '/icon.png'}
                            alt={item.title || 'Untitled'}
                          />
                          <div className="absolute left-2 top-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                            Resume • S{episode.seasonId}E{episode.episodeNumber}
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="p-2 bg-amber-500 rounded-full shadow-lg shadow-amber-600/40">
                              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {progress > 0 && (
                          <div className=" bottom-0 left-0 w-full h-1.5 bg-slate-800/80 ">
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
                        <div className="p-3 bg-slate-900/80  border-t border-slate-700 space-y-1 overflow-hidden">
                          <p className="text-white font-semibold text-xs truncate group-hover:text-amber-300 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-amber-400 text-xs font-semibold">
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
                        className="absolute top-2 right-2 text-white rounded-full p-1.5  bg-black/20  cursor-pointer transition-all duration-200 shadow-md backdrop-blur-sm"
                      >
                        <X className="w-4 h-4" />
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
              <div className="p-3 bg-red-950 rounded-xl border border-red-700">
                <Flame className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Popular Movies{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    ({trendingMovies?.movies?.length || 0})
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">Trending now on StreamMax</p>
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
                  className="group w-[250px] flex-shrink-0"
                >
                  <div className="relative rounded-2xl overflow-hidden bg-slate-800 cursor-pointer border border-slate-700 hover:border-amber-500 transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(245,158,11,0.2)]">
                    <div className="relative h-[400px] overflow-hidden">
                      <Image
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        fill
                        src={movie.backdropUrl || '/icon.png'}
                        alt={movie.title}
                      />
                      {movie.releaseDate && (
                        <div className="absolute left-2 top-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                          {movie.releaseDate.split('-')[0]}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="p-3 bg-amber-500 rounded-full shadow-lg shadow-amber-600/40">
                          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/90 border-t border-white/5">
                      <p className="text-white font-semibold text-sm truncate group-hover:text-amber-300 transition-colors">
                        {movie.title}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
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
              <div className="p-3 bg-emerald-950 rounded-xl border border-emerald-700">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Popular Series{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    ({trendingMovies?.series?.length || 0})
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">Binge-worthy shows trending now</p>
              </div>
            </div>

            <HorizontalCarousel
              scrollBy={800}
              ariaLabelLeft="Scroll popular series left"
              ariaLabelRight="Scroll popular series right"
            >
              {trendingMovies?.series?.slice(0, 12).map((s) => (
                <div key={s.id} className="group w-[250px] flex-shrink-0">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-800 cursor-pointer border border-slate-700 hover:border-amber-500 transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(245,158,11,0.2)]">
                    <div className="relative h-[400px] overflow-hidden">
                      <Image
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        fill
                        src={s.backdropUrl || '/icon.png'}
                        alt={s.name}
                      />
                      {s.firstAirDate && (
                        <div className="absolute left-2 top-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                          {s.firstAirDate.split('-')[0]}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="p-3 bg-amber-500 rounded-full shadow-lg shadow-amber-600/40">
                          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/90 border-t border-white/5">
                      <p className="text-white font-semibold text-sm truncate group-hover:text-amber-300 transition-colors">
                        {s.name}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">{s.firstAirDate?.split('-')[0]}</p>
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
