import { Play, Youtube } from 'lucide-react';
import { FC } from 'react';

import { ActionButtonsProps } from '@/lib/types';

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
    <div className="flex flex-wrap gap-3 pt-4">
      {(hasSeasons || !hasSeasons) && (
        <Button
          className="group flex items-center gap-2 rounded-lg bg-linear-to-r from-amber-600 to-amber-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-amber-700 hover:to-amber-800 hover:shadow-amber-600/50"
          onClick={onPlayMovie}
          aria-label={getPlayButtonLabel()}
        >
          <Play className="h-5 w-5 fill-white transition-transform group-hover:scale-110" />
          {getPlayButtonLabel()}
        </Button>
      )}
      <Button
        disabled={!hasTrailer}
        onClick={onPlayTrailer}
        className={`flex items-center gap-2 rounded-lg border px-6 py-3 text-base font-semibold transition-all duration-300 ${
          !hasTrailer
            ? 'cursor-not-allowed border-gray-500/20 bg-gray-500/10 text-gray-400 opacity-50'
            : 'border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-500/50 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/20'
        }`}
        aria-label="Watch trailer"
      >
        <Youtube className="h-5 w-5" />
        Trailer
      </Button>
    </div>
  );
};
