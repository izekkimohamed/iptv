import { X } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import VideoPlayer from '@/features/player/components/VideoPlayer';
import { Button } from '@/shared/components/ui/button';
import { VideoPlayerModalProps } from '@/shared/lib/types';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="absolute inset-0 z-9999 flex items-center justify-center bg-red-400 p-4 sm:p-6 lg:p-8">
      <div
        className="animate-in fade-in absolute inset-0 bg-black/90 backdrop-blur-xl duration-300"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close video player"
      />
      <div className="animate-in zoom-in-95 relative z-[10000] w-full max-w-6xl overflow-hidden rounded-sm border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] duration-300">
        <div className="absolute top-4 right-4 z-[10001]">
          <Button
            className="h-12 w-12 rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 active:scale-95"
            onClick={onClose}
            aria-label="Close video player"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="aspect-video w-full bg-black">
          <VideoPlayer
            src={src}
            poster={poster}
            title={title}
            autoPlay={autoPlay}
            episodeNumber={episodeNumber}
            seasonId={seasonId}
            totalEpisodes={totalEpisodes}
            categoryId={categoryId ?? undefined}
            serieId={serieId ?? undefined}
            movieId={movieId ?? undefined}
            playNext={onNextEpisode}
            playPrev={onPrevEpisode}
            hasNext={hasNext}
            hasPrev={hasPrev}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
