import { useEffect } from 'react';
import { usePlayerStore } from '@repo/store';

interface UseVolumeSyncOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setVolumeState: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
}

export function useVolumeSync({
  videoRef,
  setVolumeState,
  setIsMuted,
}: UseVolumeSyncOptions) {
  const storedVolume = usePlayerStore((s) => s.volume);
  const storedMuted = usePlayerStore((s) => s.isMuted);

  useEffect(() => {
    const v = videoRef.current;
    setVolumeState(storedVolume ?? 1);
    setIsMuted(!!storedMuted);
    if (v) {
      v.volume = storedVolume ?? 1;
      v.muted = !!storedMuted;
    }
  }, [storedVolume, storedMuted, setVolumeState, setIsMuted, videoRef]);
}
