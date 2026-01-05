import { X } from 'lucide-react';
import { FC } from 'react';

import { Button } from '@/components/ui/button';
import VideoPlayer from '@/features/player/components/VideoPlayer';
import { VideoPlayerModalProps } from '@/lib/types';

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
      <div className="relative z-50 w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 shadow-2xl">
        <div className="flex justify-end bg-black/80 p-1 backdrop-blur-md">
          <Button
            className="pointer-events-auto cursor-pointer rounded-full p-2.5 text-white transition-colors duration-200 hover:bg-white/20"
            onClick={onClose}
            aria-label="Close video player"
            title="Close video"
          >
            <X size={24} />
          </Button>
        </div>

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
            playNext={onNextEpisode}
            playPrev={onPrevEpisode}
            hasNext={hasNext}
            hasPrev={hasPrev}
          />
        </div>
      </div>
    </div>
  );
};
