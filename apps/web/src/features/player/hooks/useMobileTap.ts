import { useCallback, useRef } from 'react';

import { PLAYER_CONSTANTS } from '@/constants/player';

interface UseMobileTapOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  backward: (secs: number) => void;
  forward: (secs: number) => void;
}

export function useMobileTap({ containerRef, videoRef, backward, forward }: UseMobileTapOptions) {
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);
  const mobileTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMobileTap = useCallback(
    (e: React.TouchEvent) => {
      const now = Date.now();
      const touch = e.changedTouches[0];
      if (!touch || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const isLeftHalf = x < rect.width / 2;

      if (
        lastTapRef.current &&
        now - lastTapRef.current.time < PLAYER_CONSTANTS.DOUBLE_TAP_THRESHOLD
      ) {
        if (mobileTapTimerRef.current) {
          clearTimeout(mobileTapTimerRef.current);
          mobileTapTimerRef.current = null;
        }
        if (isLeftHalf) {
          backward(PLAYER_CONSTANTS.MOBILE_SEEK_OFFSET_SECONDS);
        } else {
          forward(PLAYER_CONSTANTS.MOBILE_SEEK_OFFSET_SECONDS);
        }
        lastTapRef.current = null;
      } else {
        lastTapRef.current = { time: now, x };
        mobileTapTimerRef.current = setTimeout(() => {
          const video = videoRef.current;
          if (video) {
            if (video.paused) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
          lastTapRef.current = null;
          mobileTapTimerRef.current = null;
        }, PLAYER_CONSTANTS.DOUBLE_TAP_THRESHOLD);
      }
    },
    [containerRef, videoRef, backward, forward],
  );

  return { handleMobileTap };
}
