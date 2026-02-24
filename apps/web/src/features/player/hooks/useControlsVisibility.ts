import { useCallback, useEffect, useRef, useState } from 'react';

import { PLAYER_CONSTANTS } from '@/constants/player';

export function useControlsVisibility(paused: boolean) {
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setPausedCb((p) => {
        if (!p) setShowControls(false);
        return p;
      });
    }, PLAYER_CONSTANTS.CONTROLS_HIDE_DELAY);
  }, []);

  // Use a ref-based callback mechanism to read paused state securely inside the timer if needed
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const setPausedCb = useCallback((cb: (p: boolean) => boolean) => {
    const newPaused = cb(pausedRef.current);
    if (!newPaused) setShowControls(false);
  }, []);

  useEffect(() => {
    if (paused) setShowControls(true);
    else resetHideTimer();
  }, [paused, resetHideTimer]);

  return { showControls, setShowControls, resetHideTimer };
}
