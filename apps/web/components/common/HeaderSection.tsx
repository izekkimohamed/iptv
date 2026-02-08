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
    Star,
    Tv
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
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/20 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:pr-5 active:scale-95"
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
            <div className="group relative aspect-2/3 w-full overflow-hidden rounded-sm border border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-primary/50 hover:shadow-primary/20">
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
              <div className="mb-8 block h-64 w-44 overflow-hidden rounded-sm border border-white/10 shadow-2xl lg:hidden">
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
                  className="border-primary/40 bg-primary/10 px-3 py-1 font-black tracking-widest text-primary uppercase"
                >
                  MOVIE
                </Badge>
                {genres?.map((g) => (
                  <Badge
                    key={g.id}
                    variant="secondary"
                    className="rounded-sm border border-white/5 bg-white/5 px-3 py-1 font-bold text-neutral-300 backdrop-blur-md hover:bg-white/10"
                  >
                    {g.name}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="max-w-4xl text-5xl font-black leading-none tracking-tighter text-white drop-shadow-2xl md:text-7xl">
                {name}
              </h1>

              {/* Meta Data */}
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-neutral-400">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-xl text-white">{Number(rating || 0).toFixed(1)}</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-white/40" />
                  {new Date(releaseDate || '').getFullYear()}
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/40" />
                  {Math.floor((runtime || 0) / 60)}h {(runtime || 0) % 60}m
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div className="mb-10 max-w-3xl rounded-sm border border-white/5 bg-white/2 p-6 backdrop-blur-xl">
              <h3 className="mb-2 text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">
                Synopsis
              </h3>
              <p className="text-lg font-medium leading-relaxed text-neutral-200 lg:text-xl">
                {overview}
              </p>
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              {dbMovies.length > 0 ? (
                <>
                  <Button
                    onClick={() => handlePlayMovie(dbMovies[0])}
                    className="group relative h-16 rounded-sm bg-primary px-10 text-lg font-black tracking-widest text-primary-foreground uppercase shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <Play className="h-6 w-6 fill-current" />
                      <span>Watch Now</span>
                    </div>
                  </Button>

                  {/* Source Selector Dropdown */}
                  {hasMultipleSources && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-16 gap-3 rounded-sm border-white/10 bg-white/5 px-6 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 active:scale-95"
                        >
                          <Tv className="h-5 w-5 text-white/40" />
                          <div className="flex flex-col items-start leading-tight">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Source</span>
                            <span className="max-w-32 truncate text-sm">
                              {currentMovieSource?.name || 'Auto-Select'}
                            </span>
                          </div>
                          <ChevronDown className="ml-2 h-4 w-4 opacity-40" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-64 border-white/10 bg-black/80 text-white backdrop-blur-3xl"
                      >
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                          Stream Source
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        {dbMovies.map((m) => (
                          <DropdownMenuItem
                            key={m.id}
                            onClick={() => handlePlayMovie(m)}
                            className={cn(
                              'flex cursor-pointer items-center justify-between rounded-sm p-3 mx-1 my-1 transition-colors focus:bg-primary focus:text-primary-foreground',
                              m.url === currentMovieSource?.url && 'bg-primary/20 text-primary',
                            )}
                          >
                            <span className="font-bold">{m.name}</span>
                            {m.url === currentMovieSource?.url && (
                              <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
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
                  className="group relative h-16 rounded-sm bg-primary px-10 text-lg font-black tracking-widest text-primary-foreground uppercase shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <Play className="h-6 w-6 fill-current" />
                    <span>Watch Now</span>
                  </div>
                </Button>
              ) : getPlayButtonLabel != null ? (
                <Button
                  onClick={() => handlePlayMovie()}
                  className="group relative h-16 rounded-sm bg-primary px-10 text-lg font-black tracking-widest text-primary-foreground uppercase shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <Play className="h-6 w-6 fill-current" />
                    <span>{getPlayButtonLabel()}</span>
                  </div>
                </Button>
              ) : (
                <div className="flex items-center gap-3 rounded-sm border border-red-500/20 bg-red-500/10 px-8 py-4 text-red-500 backdrop-blur-md">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="text-sm font-black uppercase tracking-widest">Stream Unavailable</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
