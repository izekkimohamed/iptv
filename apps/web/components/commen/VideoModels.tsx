import { VideoPlayerModalProps } from '@/lib/types';
import { X } from 'lucide-react';
import { FC } from 'react';
import { Button } from '../ui/button';
import { VideoPlayer } from '../videoPlayer';

type EnhancedProps = VideoPlayerModalProps & {
  totalEpisodes: number;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  categoryId: string | null;
  serieId: string | null;
  movieId: string | null;
  showButton?: boolean;
};

export const VideoPlayerModal: FC<EnhancedProps> = ({
  isOpen,
  onClose,
  src,
  poster,
  title,
  autoPlay = false,
  episodeNumber,
  seasonId,
  hasNext,
  hasPrev,
  onNextEpisode,
  onPrevEpisode,
  categoryId,
  serieId,
  movieId,
  totalEpisodes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-50 w-full max-w-5xl shadow-2xl rounded-xl overflow-hidden border border-white/10">
        <div className="p-1 flex justify-end bg-black/80 backdrop-blur-md">
          <Button
            className="pointer-events-auto p-2.5 text-white cursor-pointer rounded-full hover:bg-white/20 transition-colors duration-200 "
            onClick={onClose}
            aria-label="Close video player"
            title="Close video"
          >
            <X size={24} />
          </Button>
        </div>

        {/* Video Player Container */}
        <div className="relative bg-black/80 backdrop-blur-md">
          <VideoPlayer
            src={src}
            poster={poster}
            title={title}
            autoPlay={autoPlay}
            episodeNumber={episodeNumber}
            seasonId={seasonId}
            totalEpisodes={totalEpisodes}
            categoryId={categoryId}
            serieId={serieId}
            movieId={movieId}
            playNextEpisode={onNextEpisode}
            playPrevEpisode={onPrevEpisode}
            hasNext={hasNext}
            hasPrev={hasPrev}
          />
        </div>
      </div>
    </div>
  );
};
