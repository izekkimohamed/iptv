import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { PLAYER_CONSTANTS } from '@/constants/player';

interface SettingsPanelProps {
  showSettings: boolean;
  playbackRate: number;
  changeRate: (rate: number) => void;
  isHlsStream?: boolean;
  qualityLevels?: Array<{ index: number; label: string }>;
  currentQuality?: number;
  onQualityChange?: (index: number) => void;
  togglePiP?: () => void;
  onClose: () => void;
}

export function SettingsPanel({
  showSettings,
  playbackRate,
  changeRate,
  isHlsStream,
  qualityLevels,
  currentQuality,
  onQualityChange,
  togglePiP,
  onClose,
}: SettingsPanelProps) {
  if (!showSettings) return null;

  return (
    <div
      className="animate-in slide-in-from-bottom-2 fade-in absolute right-0 bottom-full z-50 mb-4 w-64 rounded-sm border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
        <span className="text-sm font-bold text-white">Settings</span>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white"
          aria-label="Close settings"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile: Extra Tools */}
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
        <span className="text-xs font-medium text-white/60 uppercase">Playback Speed</span>
        <div className="grid grid-cols-3 gap-2">
          {PLAYER_CONSTANTS.PLAYBACK_RATES.map((speed) => (
            <button
              key={speed}
              onClick={() => changeRate(speed)}
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

      {isHlsStream && qualityLevels && qualityLevels.length > 1 && (
        <div className="mt-4 space-y-2">
          <span className="text-xs font-medium text-white/60 uppercase">Quality</span>
          <div className="grid max-h-32 grid-cols-3 gap-2 overflow-y-auto">
            {qualityLevels.map((level) => (
              <button
                key={level.index}
                onClick={() => onQualityChange?.(level.index)}
                className={cn(
                  'rounded py-1.5 text-xs font-medium transition-colors',
                  currentQuality === level.index
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/10 text-white hover:bg-white/20',
                )}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface KeyboardHintsProps {
  showKeyboardHints: boolean;
  onClose: () => void;
}

export function KeyboardHintsPanel({ showKeyboardHints, onClose }: KeyboardHintsProps) {
  if (!showKeyboardHints) return null;

  const shortcuts = [
    { label: 'Play/Pause', key: 'Space / K' },
    { label: `Forward ${PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS}s`, key: '→' },
    { label: `Backward ${PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS}s`, key: '←' },
    { label: 'Mute/Unmute', key: 'M' },
    { label: 'Fullscreen', key: 'F' },
  ];

  return (
    <div
      className="animate-in slide-in-from-bottom-2 fade-in absolute right-0 bottom-full z-50 mb-4 w-80 rounded-sm border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
        <span className="text-sm font-bold text-white">Keyboard Shortcuts</span>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white"
          aria-label="Close keyboard hints"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2 text-xs text-white/80">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.key} className="flex justify-between">
            <span>{shortcut.label}</span>
            <kbd className="rounded bg-white/10 px-2 py-1">{shortcut.key}</kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
