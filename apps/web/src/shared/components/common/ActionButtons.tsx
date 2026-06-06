import { Play, Video } from 'lucide-react';
import { FC } from 'react';

import { ActionButtonsProps } from '@/shared/lib/types';

import { cn } from '@/shared/lib/utils';
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
          className="group bg-primary text-primary-foreground shadow-primary/20 relative h-14 overflow-hidden rounded-sm px-8 text-base font-black tracking-widest uppercase shadow-lg transition-all hover:scale-105 active:scale-95"
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
          'h-14 rounded-sm border px-8 text-base font-bold tracking-widest uppercase backdrop-blur-md transition-all active:scale-95',
          !hasTrailer
            ? 'cursor-not-allowed border-white/5 bg-white/5 text-white/20'
            : 'border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10',
        )}
        aria-label="Watch trailer"
      >
        <Video className="mr-2 h-5 w-5 text-red-500" />
        Trailer
      </Button>
    </div>
  );
};
