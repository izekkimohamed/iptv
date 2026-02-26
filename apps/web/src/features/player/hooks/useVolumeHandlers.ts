import { useCallback } from 'react';

interface UseVolumeHandlersOptions {
  setVolume: (volume: number) => void;
  setShowVolume: (show: boolean) => void;
}

export function useVolumeHandlers({ setVolume, setShowVolume }: UseVolumeHandlersOptions) {
  const handleVolumeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setVolume(pct);
    },
    [setVolume],
  );

  const startVolumeDrag = useCallback(
    (e: React.PointerEvent) => {
      setShowVolume(true);
      const el = e.currentTarget as HTMLElement;

      const setFromEvent = (clientX: number) => {
        const rect = el.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        setVolume(pct);
      };

      setFromEvent(e.clientX);
      const onMove = (ev: PointerEvent) => setFromEvent(ev.clientX);
      const onUp = (ev: PointerEvent) => {
        setFromEvent(ev.clientX);
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [setVolume, setShowVolume],
  );

  return { handleVolumeClick, startVolumeDrag };
}
