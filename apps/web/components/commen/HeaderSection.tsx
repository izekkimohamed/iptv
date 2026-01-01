import { Badge } from '@/components/ui/badge'; // Adjust path as needed
import { Button } from '@/components/ui/button'; // Adjust path as needed
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Adjust path as needed
import { cn } from '@/lib/utils'; // Adjust path as needed
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  Clock,
  Play,
  PlayCircle,
  Star,
  Tv,
} from 'lucide-react';
import Image from 'next/image';
import { FC, useMemo } from 'react';

// Define a cleaner interface for the DB Movie object
interface DbMovie {
  id: number;
  streamId: number;
  name: string;
  rating: string;
  url: string;
  categoryId: number;
  // Add other fields if strictly necessary
}
interface EpisodeToPlay {
  seasonId: number;
  episodeNumber: number;
  isResume: boolean;
}

interface HeaderSectionProps {
  // TMDB Metadata
  name: string;
  overview?: string;
  backdrop?: string;
  poster?: string;
  releaseDate?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  rating?: string;

  // Streaming Data
  dbMovies: DbMovie[];
  currentSrc: string; // The URL of the currently playing/selected movie
  episodeToPlay?: EpisodeToPlay | null;

  // Actions
  handlePlayMovie: (movie?: DbMovie) => void;
  onBack: () => void;
}

export const HeaderSection: FC<HeaderSectionProps> = ({
  name,
  overview,
  backdrop,
  poster,
  releaseDate,
  runtime,
  genres,
  rating,
  dbMovies,
  currentSrc,
  handlePlayMovie,
  onBack,
  episodeToPlay,
}) => {
  const getPlayButtonLabel = () => {
    if (!episodeToPlay) return null;
    if (episodeToPlay.isResume) {
      return `Resume S${episodeToPlay.seasonId}E${episodeToPlay.episodeNumber}`;
    }
    return `Start Watching`;
  };
  // Logic to determine active source
  const currentMovieSource = useMemo(() => {
    if (!dbMovies || dbMovies.length === 0) return null;
    return dbMovies.find((movie) => movie.url === currentSrc) || dbMovies[0];
  }, [dbMovies, currentSrc]);

  const hasMultipleSources = dbMovies.length > 1;

  return (
    <div className="">
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300">
        <Button
          onClick={onBack}
          variant="ghost"
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/20 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/10 hover:pl-3"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Button>
      </div>

      {/* --- 3. MAIN CONTENT --- */}
      <div className="relative z-20 mx-auto max-w-400 px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: Poster (Desktop) */}
          <div className="my-auto hidden lg:col-span-3 lg:block lg:space-y-6">
            <div className="group relative aspect-2/3 w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.7)] transition-all duration-500 hover:shadow-amber-500/20">
              <Image
                src={poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                alt={name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col justify-end lg:col-span-9">
            {/* Title Block */}
            <div className="mb-6 space-y-4">
              {/* Mobile Poster */}
              <div className="mb-8 block h-64 w-44 overflow-hidden rounded-xl border border-white/10 shadow-2xl lg:hidden">
                <Image
                  src={poster || ''}
                  alt={name}
                  width={176}
                  height={256}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className="border-amber-500/50 bg-amber-500/10 px-3 py-1 text-amber-500"
                >
                  MOVIE
                </Badge>
                {genres?.map((g) => (
                  <Badge
                    key={g.id}
                    variant="secondary"
                    className="bg-white/10 text-neutral-300 hover:bg-white/20"
                  >
                    {g.name}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="max-w-4xl text-3xl leading-tight font-black tracking-tighter text-white drop-shadow-2xl">
                {name}
              </h1>

              {/* Meta Data */}
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-neutral-300">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                  <span className="text-lg text-white">{Number(rating || 0).toFixed(1)}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-neutral-500" />
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  {new Date(releaseDate || '').getFullYear()}
                </div>
                <div className="h-1 w-1 rounded-full bg-neutral-500" />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  {Math.floor((runtime || 0) / 60)}h {(runtime || 0) % 60}m
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div className="mb-10 max-w-3xl rounded-2xl border border-white/5 bg-black/40 p-6 backdrop-blur-md">
              <h3 className="mb-2 text-xs font-bold tracking-widest text-neutral-500 uppercase">
                Synopsis
              </h3>
              <p className="text-lg leading-relaxed text-neutral-200">{overview}</p>
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-wrap items-center gap-4">
              {dbMovies.length > 0 ? (
                <>
                  <Button
                    onClick={() => handlePlayMovie(dbMovies[0])}
                    className="group relative h-16 overflow-hidden rounded-full bg-white px-10 text-lg font-bold text-black shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] transition-all hover:scale-105 hover:bg-neutral-200 hover:shadow-white/50"
                  >
                    <div className="flex items-center gap-3">
                      <Play className="aspect-square w-14 fill-black" />
                      <span>Watch Now</span>
                    </div>
                  </Button>

                  {/* Source Selector Dropdown */}
                  {hasMultipleSources && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-16 gap-3 rounded-full border-white/20 bg-black/40 px-6 text-base font-medium text-white backdrop-blur-md transition-all hover:border-amber-500/50 hover:bg-black/60"
                        >
                          <Tv className="h-5 w-5 text-neutral-400" />
                          <div className="flex flex-col items-start text-xs">
                            <span className="font-bold text-neutral-500 uppercase">Source</span>
                            <span className="max-w-30 truncate text-sm text-white">
                              {currentMovieSource?.name || 'Auto-Select'}
                            </span>
                          </div>
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-64 border-white/10 bg-neutral-900/95 text-white backdrop-blur-xl"
                      >
                        <DropdownMenuLabel className="text-xs text-neutral-500">
                          Select Stream Source
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        {dbMovies.map((m) => (
                          <DropdownMenuItem
                            key={m.id}
                            onClick={() => handlePlayMovie(m)}
                            className={cn(
                              'flex cursor-pointer items-center justify-between p-3 focus:bg-white/10 focus:text-white',
                              m.url === currentMovieSource?.url && 'bg-amber-500/10 text-amber-500',
                            )}
                          >
                            <span className="font-medium">{m.name}</span>
                            {m.url === currentMovieSource?.url && (
                              <Play className="h-3 w-3 fill-current" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              ) : currentSrc ? (
                <Button
                  onClick={() => handlePlayMovie()}
                  className="group relative h-16 overflow-hidden rounded-full bg-white px-10 text-lg font-bold text-black shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] transition-all hover:scale-105 hover:bg-neutral-200 hover:shadow-white/50"
                >
                  <div className="flex items-center gap-3">
                    <PlayCircle size={60} />
                    <span>Watch Now</span>
                  </div>
                </Button>
              ) : getPlayButtonLabel != null ? (
                <Button
                  onClick={() => handlePlayMovie()}
                  className="group relative h-16 overflow-hidden rounded-full bg-white px-10 text-lg font-bold text-black shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] transition-all hover:scale-105 hover:bg-neutral-200 hover:shadow-white/50"
                >
                  <div className="flex items-center gap-3">
                    <PlayCircle size={60} />
                    <span>{getPlayButtonLabel()}</span>
                  </div>
                </Button>
              ) : (
                <div className="flex items-center gap-3 rounded-full border border-red-500/20 bg-red-500/10 px-6 py-4 text-red-400">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="font-medium">Stream currently unavailable</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
