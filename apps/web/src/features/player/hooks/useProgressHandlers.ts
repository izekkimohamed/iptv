import { useCallback } from 'react';

interface UseProgressHandlersOptions {
  duration: number;
  seek: (time: number) => void;
}

export function useProgressHandlers({ duration, seek }: UseProgressHandlersOptions) {
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!duration) return;
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seek(pct * duration);
    },
    [duration, seek],
  );

  return { handleProgressClick };
}
