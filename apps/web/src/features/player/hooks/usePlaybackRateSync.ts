import { useEffect } from 'react';

interface UsePlaybackRateSyncOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  preferredRate: number;
  setPlaybackRateState: (rate: number) => void;
}

export function usePlaybackRateSync({
  videoRef,
  preferredRate,
  setPlaybackRateState,
}: UsePlaybackRateSyncOptions) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = preferredRate;
    setPlaybackRateState(preferredRate);
  }, [preferredRate, setPlaybackRateState, videoRef]);
}
