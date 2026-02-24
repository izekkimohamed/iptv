import { Play } from 'lucide-react';
import { memo } from 'react';

export const PlayerSpinner = memo(function PlayerSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Dark backdrop for visibility */}
      {/* <div className="absolute inset-0 bg-black/40" /> */}

      {/* Ambient backdrop glow
      <div className="absolute w-32 h-32 rounded-full bg-primary/8 blur-3xl animate-pulse" /> */}

      <div className="relative h-16 w-16 bg-black/20 backdrop-blur-sm rounded-full p-2">
        {/* Outer orbit ring — slow spin */}
        <div
          className="absolute -inset-2 rounded-full animate-spin"
          style={{ animationDuration: '3s' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_2px_rgba(var(--primary),0.6)]" />
        </div>

        {/* Middle ring — medium spin, counter-rotate */}
        <div
          className="absolute inset-0 rounded-full border border-primary/15"
          style={{ animation: 'spin 2s linear infinite reverse' }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/80 shadow-[0_0_6px_1px_rgba(var(--primary),0.5)]" />
        </div>

        {/* Inner ring — fast spin */}
        <div
          className="absolute inset-3 rounded-full border border-primary/10"
          style={{ animationDuration: '1.2s', animation: 'spin 1.2s linear infinite' }}
        >
          <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-primary/60 shadow-[0_0_4px_1px_rgba(var(--primary),0.4)]" />
        </div>

        {/* Center pulsing core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-2.5 h-2.5 rounded-full bg-primary/90 shadow-[0_0_12px_3px_rgba(var(--primary),0.4)]"
            style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
          />
        </div>

        {/* Arc sweep — the main visual indicator */}
        <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '1.5s' }} viewBox="0 0 64 64">
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="url(#spinnerGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="40 136"
          />
          <defs>
            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
});

export const PlayerPausedOverlay = memo(function PlayerPausedOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />

      {/* Play button container */}
      <div
        className="relative flex items-center justify-center"
        style={{ animation: 'pulse 3s ease-in-out infinite' }}
      >
        {/* Outer glow ring */}
        <div className="absolute w-24 h-24 rounded-full bg-white/5 blur-xl" />

        {/* Frosted glass button */}
        <div className="relative w-18 h-18 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <Play size={28} className="text-white ml-1 drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
});
