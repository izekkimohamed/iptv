import { useCallback, useRef } from 'react';

interface UseGestureHandlersProps {
  togglePlay: () => void;
  toggleFullscreen: () => void;
}

export function useGestureHandlers({ togglePlay, toggleFullscreen }: UseGestureHandlersProps) {
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSingleClick = useCallback(() => {
    if (clickTimerRef.current) return;
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      togglePlay();
    }, 220);
  }, [togglePlay]);

  const handleDoubleClick = useCallback(() => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    toggleFullscreen();
  }, [toggleFullscreen]);

  return { handleSingleClick, handleDoubleClick };
}
