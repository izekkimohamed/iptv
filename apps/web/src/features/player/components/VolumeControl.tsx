import { Volume2, VolumeX } from 'lucide-react';
import React from 'react';

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
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={toggleMute}
        title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
        style={{
          background: 'transparent',
          border: 'none',
          color: isMuted ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.9)',
          cursor: 'pointer',
          padding: 6,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

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
          height: 4,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
          cursor: 'pointer',
          position: 'relative',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            width: `${displayVolume * 100}%`,
            height: '100%',
            background: '#e50914',
            borderRadius: 2,
          }}
        />
      </div>

      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, width: 34, textAlign: 'right' }}>
        {Math.round(displayVolume * 100)}%
      </div>
    </div>
  );
}
