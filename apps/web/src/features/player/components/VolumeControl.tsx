import { Volume1, Volume2, VolumeX } from 'lucide-react';
import React, { useState } from 'react';

export default function VolumeControl({
  isMuted,
  volume,
  displayVolume,
  toggleMute,
  volumeBarRef,
  handleVolumeClick,
  startVolumeDrag,
}: {
  isMuted: boolean;
  volume: number;
  displayVolume: number;
  toggleMute: () => void;
  volumeBarRef: React.RefObject<HTMLDivElement>;
  handleVolumeClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  startVolumeDrag: (e: React.PointerEvent) => void;
}) {
  const [isHovering, setIsHovering] = useState(false);

  const VolumeIcon = isMuted || volume === 0
    ? VolumeX
    : volume < 0.5
      ? Volume1
      : Volume2;

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button
        onClick={toggleMute}
        title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
        style={{
          background: 'transparent',
          border: 'none',
          color: isMuted ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.95)',
          cursor: 'pointer',
          padding: 7,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        <VolumeIcon size={18} />
      </button>

      <div style={{ position: 'relative' }}>
        <div
          ref={volumeBarRef}
          onClick={handleVolumeClick}
          onPointerDown={startVolumeDrag}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
            }
          }}
          role="slider"
          tabIndex={0}
          aria-label="Volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(displayVolume * 100)}
          style={{
            width: 80,
            height: isHovering ? 5 : 3,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 99,
            cursor: 'pointer',
            position: 'relative',
            touchAction: 'none',
            transition: 'height 0.2s cubic-bezier(0.4,0,0.2,1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${displayVolume * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, hsl(var(--primary)), #e50914)',
              borderRadius: 99,
              transition: 'width 0.1s',
            }}
          />
        </div>

        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `clamp(5px, ${displayVolume * 100}%, calc(100% - 5px))`,
            transform: `translate(-50%, -50%) scale(${isHovering ? 1 : 0})`,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#fff',
            border: '2px solid #e50914',
            boxShadow: '0 0 6px rgba(229,9,20,0.4)',
            pointerEvents: 'none',
            transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), left 0.1s',
            zIndex: 2,
          }}
        />
      </div>

      <div style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: 600,
        fontFamily: 'monospace',
        width: 32,
        textAlign: 'right',
        letterSpacing: '0.5px',
      }}>
        {Math.round(displayVolume * 100)}%
      </div>
    </div>
  );
}

