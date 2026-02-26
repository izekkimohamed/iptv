import { useCallback } from 'react';

interface UseEpisodeNavigationOptions {
  hasNext?: boolean;
  hasPrev?: boolean;
  playNext?: () => void;
  playPrev?: () => void;
  saveEpisodeProgress: () => void;
  isFullscreen: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useEpisodeNavigation({
  hasNext,
  hasPrev,
  playNext,
  playPrev,
  saveEpisodeProgress,
  isFullscreen,
  containerRef,
}: UseEpisodeNavigationOptions) {
  const handlePlayNext = useCallback(() => {
    if (!hasNext || !playNext) return;
    saveEpisodeProgress();
    const wasFullscreen = isFullscreen;
    playNext();
    if (wasFullscreen) {
      setTimeout(() => {
        containerRef.current?.requestFullscreen().catch(() => {});
      }, 100);
    }
  }, [hasNext, playNext, saveEpisodeProgress, isFullscreen, containerRef]);

  const handlePlayPrev = useCallback(() => {
    if (!hasPrev || !playPrev) return;
    saveEpisodeProgress();
    const wasFullscreen = isFullscreen;
    playPrev();
    if (wasFullscreen) {
      setTimeout(() => {
        containerRef.current?.requestFullscreen().catch(() => {});
      }, 100);
    }
  }, [hasPrev, playPrev, saveEpisodeProgress, isFullscreen, containerRef]);

  return { handlePlayNext, handlePlayPrev };
}
