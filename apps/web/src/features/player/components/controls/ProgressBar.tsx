import { cn } from '@/shared/lib/utils';
import { memo, useCallback, useRef, useState } from 'react';

interface ProgressBarProps {
  progressRef: React.RefObject<HTMLDivElement | null>;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  onProgressSeek: (time: number) => void;
}

function formatTime(seconds: number, padHrs: boolean = false): string {
  if (!Number.isFinite(seconds) || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (padHrs || h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const ProgressBarComponent = memo(function ProgressBar({
  progressRef,
  currentTime,
  duration,
  bufferedEnd,
  onProgressSeek,
}: ProgressBarProps) {
  const [hoverTime, setHoverTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const localProgressRef = useRef<HTMLDivElement>(null);

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const displayTime = isDragging ? hoverTime : currentTime;
  const padHours = safeDuration > 3600;

  const handleProgressHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const ref = progressRef.current || localProgressRef.current;
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setHoverTime(percent * safeDuration);
    },
    [safeDuration, progressRef],
  );

  const handleProgressPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);

      const ref = progressRef.current || localProgressRef.current;
      if (!ref || !safeDuration) return;

      const getPct = (clientX: number) => {
        const rect = ref.getBoundingClientRect();
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      };

      const pct = getPct(e.clientX);
      setHoverTime(pct * safeDuration);

      const onMove = (ev: PointerEvent) => {
        const p = getPct(ev.clientX);
        setHoverTime(p * safeDuration);
      };
      const onUp = (ev: PointerEvent) => {
        const p = getPct(ev.clientX);
        onProgressSeek(p * safeDuration);
        setIsDragging(false);
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [safeDuration, onProgressSeek, progressRef],
  );

  const bufferedPercent = safeDuration > 0 ? (bufferedEnd / safeDuration) * 100 : 0;
  const progressPercent = safeDuration > 0 ? (displayTime / safeDuration) * 100 : 0;
  const hoverPercent = safeDuration > 0 ? (hoverTime / safeDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-4 select-none">
      <span className="min-w-11.25 text-right font-mono text-xs font-medium text-white/90 tabular-nums">
        {formatTime(displayTime, padHours)}
      </span>

      <div
        ref={(el) => {
          localProgressRef.current = el;
          if (progressRef && 'current' in progressRef) {
            (progressRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }
        }}
        className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/20 transition-all select-none hover:h-2.5"
        onMouseDown={handleProgressPointerDown}
        onMouseMove={handleProgressHover}
        onMouseLeave={() => setHoverTime(0)}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[role="slider"]')) return;
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
        }}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={safeDuration || 100}
        aria-valuenow={displayTime || 0}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-white/30"
          style={{ width: `${bufferedPercent}%` }}
        />

        {hoverTime > 0 && !isDragging && (
          <div
            className="absolute top-0 h-full rounded-full bg-white/20"
            style={{ width: `${hoverPercent}%` }}
          />
        )}

        <div
          className="to-primary absolute top-0 left-0 h-full rounded-full bg-linear-to-r from-yellow-600/80 shadow-sm"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute top-1/2 right-0 h-3.5 w-3.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100" />
        </div>

        {hoverTime > 0 && !isDragging && (
          <div
            className="absolute bottom-full mb-3 -translate-x-1/2 rounded-sm border border-white/10 bg-black/80 px-2 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md"
            style={{ left: `${hoverPercent}%` }}
          >
            {formatTime(hoverTime, padHours)}
          </div>
        )}
      </div>

      <span className="min-w-11.25 font-mono text-xs font-medium text-white/90 tabular-nums">
        {formatTime(safeDuration, padHours)}
      </span>
    </div>
  );
});

export default ProgressBarComponent;
