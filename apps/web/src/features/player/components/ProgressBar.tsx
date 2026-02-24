import React, { forwardRef, useCallback, useRef, useState } from 'react';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const ProgressBar = forwardRef<
  HTMLDivElement,
  {
    duration: number;
    bufferedEnd: number;
    currentTime: number;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    onSeek?: (time: number) => void;
  }
>(({ duration, bufferedEnd, currentTime, onClick, onSeek }, ref) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPct, setDragPct] = useState(0);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const getPct = useCallback((clientX: number) => {
    const el = barRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!duration) return;
    e.preventDefault();
    e.stopPropagation();
    const pct = getPct(e.clientX);
    setIsDragging(true);
    setDragPct(pct);

    const onMove = (ev: PointerEvent) => {
      const p = getPct(ev.clientX);
      setDragPct(p);
    };
    const onUp = (ev: PointerEvent) => {
      const p = getPct(ev.clientX);
      setIsDragging(false);
      onSeek?.(p * duration);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [duration, getPct, onSeek]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) {
      setHoverPct(getPct(e.clientX));
    }
  }, [isDragging, getPct]);

  const rawPct = isDragging ? dragPct : (duration ? currentTime / duration : 0);
  const displayPct = Math.max(0, Math.min(1, rawPct));
  const hoverTime = hoverPct !== null && duration ? hoverPct * duration : null;
  const isActive = isHovering || isDragging;

  return (
    <div className="flex-1" style={{ position: 'relative', overflow: 'visible', padding: '8px 0' }}>
      {/* Hover time tooltip */}
      {isHovering && !isDragging && hoverPct !== null && hoverTime !== null && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 4px)',
            left: `clamp(28px, ${hoverPct * 100}%, calc(100% - 28px))`,
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'monospace',
            fontWeight: 600,
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10,
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {formatTime(hoverTime)}
        </div>
      )}

      <div
        ref={(el) => {
          (barRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        onClick={isDragging ? undefined : onClick}
        onPointerDown={handlePointerDown}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setHoverPct(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
          }
        }}
        role="slider"
        tabIndex={0}
        aria-label="Progress"
        aria-valuemin={0}
        aria-valuemax={duration || 100}
        aria-valuenow={currentTime || 0}
        style={{
          height: isActive ? 6 : 3,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 99,
          cursor: 'pointer',
          position: 'relative',
          transition: 'height 0.2s cubic-bezier(0.4,0,0.2,1)',
          touchAction: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Buffered */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${duration ? Math.min((bufferedEnd / duration) * 100, 100) : 0}%`,
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 99,
            transition: 'width 0.3s',
          }}
        />

        {/* Hover preview fill */}
        {isHovering && hoverPct !== null && !isDragging && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${hoverPct * 100}%`,
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 99,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Progress fill — gradient */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${displayPct * 100}%`,
            background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, #e50914 60%, #ff6b35 100%)',
            borderRadius: 99,
            transition: isDragging ? 'none' : 'width 0.1s',
            boxShadow: isActive ? '0 0 8px rgba(229,9,20,0.4)' : 'none',
          }}
        />
      </div>

      {/* Thumb */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `clamp(8px, ${displayPct * 100}%, calc(100% - 8px))`,
          transform: `translate(-50%, -50%) scale(${isActive ? 1 : 0})`,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          border: '2.5px solid #e50914',
          boxShadow: '0 0 10px rgba(229,9,20,0.5), 0 2px 8px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          transition: isDragging
            ? 'transform 0.1s cubic-bezier(0.4,0,0.2,1)'
            : 'transform 0.2s cubic-bezier(0.4,0,0.2,1), left 0.1s',
          zIndex: 2,
        }}
      />
    </div>
  );
});

export default ProgressBar;

