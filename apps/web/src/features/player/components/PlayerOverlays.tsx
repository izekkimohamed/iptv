import { Play } from 'lucide-react';
import { memo } from 'react';

export const PlayerSpinner = memo(function PlayerSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className="w-12 h-12 border-4 border-white/15 border-t-white rounded-full animate-spin"
      />
    </div>
  );
});

export const PlayerPausedOverlay = memo(function PlayerPausedOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/70 via-transparent to-black/70 pointer-events-none">
      <div className="w-18 h-18 rounded-full bg-white/15 backdrop-blur-lg border-2 border-white/40 flex items-center justify-center text-white">
        <Play size={28} />
      </div>
    </div>
  );
});
