import { ActionButtonsProps } from '@/lib/types';
import { Play, Youtube } from 'lucide-react';
import { FC } from 'react';
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
          className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 transition-all duration-300 rounded-lg shadow-lg hover:shadow-amber-600/50 group"
          onClick={onPlayMovie}
          aria-label={getPlayButtonLabel()}
        >
          <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
          {getPlayButtonLabel()}
        </Button>
      )}
      <Button
        disabled={!hasTrailer}
        onClick={onPlayTrailer}
        className={`flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300 border ${
          !hasTrailer
            ? 'cursor-not-allowed opacity-50 text-gray-400 border-gray-500/20 bg-gray-500/10'
            : 'text-red-300 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20'
        }`}
        aria-label="Watch trailer"
      >
        <Youtube className="w-5 h-5" />
        Trailer
      </Button>
    </div>
  );
};
