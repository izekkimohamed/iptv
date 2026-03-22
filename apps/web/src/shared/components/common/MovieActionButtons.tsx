'use client';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import { ChevronDown, Play, Tv } from 'lucide-react';
import { useMemo } from 'react';

interface DbMovie {
  id: number;
  streamId: number;
  name: string;
  rating: string | null;
  url: string;
  categoryId: number;
}

interface EpisodeToPlay {
  seasonId: number;
  episodeNumber: number;
  isResume: boolean;
}

interface MovieActionButtonsProps {
  dbMovies: DbMovie[];
  currentSrc: string;
  handlePlayMovie: (movie?: DbMovie) => void;
  episodeToPlay?: EpisodeToPlay | null;
}

export function MovieActionButtons({
  dbMovies,
  currentSrc,
  handlePlayMovie,
  episodeToPlay,
}: MovieActionButtonsProps) {
  const getPlayButtonLabel = () => {
    if (!episodeToPlay) return null;
    if (episodeToPlay.isResume) {
      return `Resume S${episodeToPlay.seasonId}E${episodeToPlay.episodeNumber}`;
    }
    return `Start Watching`;
  };

  const currentMovieSource = useMemo(() => {
    if (!dbMovies || dbMovies.length === 0) return null;
    return dbMovies.find((movie) => movie.url === currentSrc) || dbMovies[0];
  }, [dbMovies, currentSrc]);

  const hasMultipleSources = dbMovies.length > 1;

  return (
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
  );
}
