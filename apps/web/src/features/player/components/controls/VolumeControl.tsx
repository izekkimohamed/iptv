import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { memo, useCallback, useState } from 'react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  volumeBarRef: React.RefObject<HTMLDivElement>;
  onToggleMute: () => void;
  onVolumeClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const VolumeIcon = ({ volume, isMuted }: { volume: number; isMuted: boolean }) => {
  if (isMuted || volume === 0) return <VolumeX className="h-5 w-5" />;
  if (volume > 0.5) return <Volume2 className="h-5 w-5" />;
  return <Volume1 className="h-5 w-5" />;
};

const VolumeControlComponent = memo(function VolumeControl({
  volume,
  isMuted,
  volumeBarRef,
  onToggleMute,
  onVolumeClick,
}: VolumeControlProps) {
  const [isVolumeHovering, setIsVolumeHovering] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  const handleVolumeMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const ref = volumeBarRef.current;
      if (!ref) return;

      const getPct = (clientX: number) => {
        const rect = ref.getBoundingClientRect();
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      };

      const pct = getPct(e.clientX);
      onVolumeClick(e);

      const onMove = (ev: PointerEvent) => {
        onVolumeClick({ clientX: ev.clientX } as React.MouseEvent<HTMLDivElement>);
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [volumeBarRef, onVolumeClick],
  );

  return (
    <div
      className="group/vol relative ml-2 flex items-center"
      onMouseEnter={() => setIsVolumeHovering(true)}
      onMouseLeave={() => setIsVolumeHovering(false)}
    >
      <button
        onClick={onToggleMute}
        className="flex cursor-pointer items-center justify-center rounded-md p-2 text-white/90 transition-all hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
      >
        <VolumeIcon volume={volume} isMuted={isMuted} />
      </button>

      <div
        ref={volumeBarRef}
        className={cn(
          'relative h-1.5 cursor-pointer rounded-full bg-white/20 transition-all duration-300',
          isVolumeHovering || isDraggingVolume ? 'w-20' : 'w-0',
        )}
        onMouseDown={handleVolumeMouseDown}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[role="slider"]')) return;
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
        }}
        role="slider"
        tabIndex={0}
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isMuted ? 0 : Math.round(volume * 100)}
      >
        <div
          className="bg-primary absolute top-0 left-0 h-full rounded-full"
          style={{ width: `${isMuted ? 0 : volume * 100}%` }}
        />
        <div
          className={cn(
            'absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-md transition-opacity',
            isVolumeHovering || isDraggingVolume ? 'opacity-100' : 'opacity-0',
          )}
          style={{ left: `${isMuted ? 0 : volume * 100}%` }}
        />
      </div>
    </div>
  );
});

export default VolumeControlComponent;
