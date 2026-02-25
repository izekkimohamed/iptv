import { memo, useCallback, useRef, useState } from 'react';
import { cn } from '@/shared/lib/utils';

interface ProgressBarProps {
  progressRef: React.RefObject<HTMLDivElement | null>;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  hoverTime: number;
  isDragging: boolean;
  onSeek: (time: number) => void;
  onHover: (time: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  formatTime: (seconds: number, padHrs?: boolean) => string;
}

export const ProgressBar = memo(function ProgressBar({
  progressRef,
  currentTime,
  duration,
  bufferedEnd,
  hoverTime,
  isDragging,
  onSeek,
  onHover,
  onDragStart,
  onDragEnd,
  formatTime,
}: ProgressBarProps) {
  const localProgressRef = useRef<HTMLDivElement>(null);
  const safeDuration = duration || 0;
  const displayTime = isDragging ? hoverTime : currentTime;

  const bufferedPercent = safeDuration > 0 ? (bufferedEnd / safeDuration) * 100 : 0;
  const progressPercent = safeDuration > 0 ? (displayTime / safeDuration) * 100 : 0;
  const hoverPercent = safeDuration > 0 ? (hoverTime / safeDuration) * 100 : 0;
  const padHours = safeDuration > 3600;

  const getPct = useCallback(
    (clientX: number) => {
      const el = progressRef.current || localProgressRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    },
    [progressRef],
  );

  const handleProgressPointerDown = useCallback(
    (e: React.PointerEvent) => {
      onDragStart();
      const onMove = (ev: PointerEvent) => {
        const pct = getPct(ev.clientX);
        onSeek(pct * safeDuration);
      };
      const onUp = (ev: PointerEvent) => {
        const pct = getPct(ev.clientX);
        onSeek(pct * safeDuration);
        onDragEnd();
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [getPct, safeDuration, onSeek, onDragStart, onDragEnd],
  );

  const handleProgressHover = useCallback(
    (e: React.MouseEvent) => {
      const pct = getPct(e.clientX);
      onHover(pct * safeDuration);
    },
    [getPct, safeDuration, onHover],
  );

  return (
    <div className="flex items-center gap-4 select-none">
      <span className="min-w-[45px] text-right font-mono text-xs font-medium text-white/90 tabular-nums">
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
        onPointerDown={handleProgressPointerDown}
        onMouseMove={handleProgressHover}
        onMouseLeave={() => onHover(0)}
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
          className="from-primary absolute top-0 left-0 h-full rounded-full bg-linear-to-r to-teal-500"
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

      <span className="min-w-[45px] font-mono text-xs font-medium text-white/90 tabular-nums">
        {formatTime(safeDuration, padHours)}
      </span>
    </div>
  );
});
