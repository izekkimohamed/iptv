import { Play, Youtube } from 'lucide-react';
import { FC } from 'react';

import { ActionButtonsProps } from '@/lib/types';

import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface EpisodeToPlay {
  seasonId: number;
  episodeNumber: number;
  isResume: boolean;
}

interface UpdatedActionButtonsProps extends ActionButtonsProps {
  episodeToPlay?: EpisodeToPlay | null;
  isMovieResume?: boolean;
}

export const ActionButtons: FC<UpdatedActionButtonsProps> = ({
  hasSeasons,
  hasTrailer,
  episodeToPlay,
  isMovieResume,
  onPlayMovie,
  onPlayTrailer,
}) => {
  const getPlayButtonLabel = () => {
    if (!hasSeasons && isMovieResume) return 'Resume Movie';
    if (!hasSeasons && !isMovieResume) return 'Watch Movie';

    if (!episodeToPlay) return 'Watch Series';
    if (episodeToPlay.isResume) {
      return `Resume S${episodeToPlay.seasonId}E${episodeToPlay.episodeNumber}`;
    }
    return `Start Watching`;
  };

  return (
    <div className="flex flex-wrap gap-4 pt-4">
      {(hasSeasons || !hasSeasons) && (
        <Button
          className="group relative h-14 overflow-hidden rounded-2xl bg-primary px-8 text-base font-black tracking-widest text-primary-foreground uppercase shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          onClick={onPlayMovie}
          aria-label={getPlayButtonLabel()}
        >
          <div className="flex items-center gap-3">
            <Play className="h-5 w-5 fill-current" />
            <span>{getPlayButtonLabel()}</span>
          </div>
        </Button>
      )}
      <Button
        disabled={!hasTrailer}
        onClick={onPlayTrailer}
        className={cn(
          "h-14 rounded-2xl border px-8 text-base font-bold tracking-widest uppercase backdrop-blur-md transition-all active:scale-95",
          !hasTrailer
            ? "cursor-not-allowed border-white/5 bg-white/5 text-white/20"
            : "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20"
        )}
        aria-label="Watch trailer"
      >
        <Youtube className="mr-2 h-5 w-5 text-red-500" />
        Trailer
      </Button>
    </div>
  );
};
