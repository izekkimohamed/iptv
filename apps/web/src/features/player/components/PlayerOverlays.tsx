import { Play } from 'lucide-react';
import { memo } from 'react';

export const PlayerSpinner = memo(function PlayerSpinner() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          width: 48,
          height: 48,
          border: '4px solid rgba(255,255,255,0.15)',
          borderTop: '4px solid #fff',
          borderRadius: '50%',
          animation: 'vp-spin 0.8s linear infinite',
        }}
      />
    </div>
  );
});

export const PlayerPausedOverlay = memo(function PlayerPausedOverlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%, rgba(0,0,0,0.7) 100%)', pointerEvents: 'none' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <Play size={28} />
      </div>
    </div>
  );
});
