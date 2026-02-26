'use client';

import { Settings } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { memo } from 'react';

import { PLAYER_CONSTANTS } from '@/constants/player';

interface SettingsPanelProps {
  showSettings: boolean;
  playbackRate: number;
  togglePiP?: () => void;
  onChangeRate: (rate: number) => void;
  onToggleSettings: () => void;
}

const SettingsPanelComponent = memo(function SettingsPanel({
  showSettings,
  playbackRate,
  togglePiP,
  onChangeRate,
  onToggleSettings,
}: SettingsPanelProps) {
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSettings();
        }}
        className={cn(
          'flex items-center justify-center rounded-md p-2 text-white/90 transition-all hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
          showSettings && 'bg-white/20 text-white',
        )}
        title="Settings"
      >
        <Settings className="h-4 w-4" />
      </button>

      {showSettings && (
        <div
          className="animate-in slide-in-from-bottom-2 fade-in absolute right-0 bottom-full z-50 mb-4 w-64 rounded-sm border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 space-y-3 md:hidden">
            {togglePiP && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Picture in Picture</span>
                <button
                  onClick={togglePiP}
                  className="rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
                >
                  Toggle
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-white/60 uppercase">
              Playback Speed
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PLAYER_CONSTANTS.PLAYBACK_RATES.map((speed) => (
                <button
                  key={speed}
                  onClick={() => onChangeRate(speed)}
                  className={cn(
                    'rounded py-1.5 text-xs font-medium transition-colors',
                    Math.abs(playbackRate - speed) < 0.1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/10 text-white hover:bg-white/20',
                  )}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default SettingsPanelComponent;
