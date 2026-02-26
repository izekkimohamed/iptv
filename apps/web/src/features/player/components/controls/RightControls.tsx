'use client';

import { Maximize2, Minimize, PictureInPicture, Tv2Icon as Vlc, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { memo, useState } from 'react';

import { PLAYER_CONSTANTS } from '@/constants/player';
import SettingsPanel from './SettingsPanel';

type AspectRatio = '16:9' | '16:10' | '4:3' | '1:1';

interface RightControlsProps {
  aspectRatio: AspectRatio;
  playbackRate: number;
  showSettings: boolean;
  isFullscreen: boolean;
  isDesktopApp?: boolean;
  src?: string;
  isHlsStream?: boolean;
  onCycleAspectRatio: () => void;
  onChangeRate: (rate: number) => void;
  onSetShowSettings: (show: boolean) => void;
  onToggleFullscreen: () => void;
  onTogglePiP?: () => void;
  onOpenInVlc?: (url: string, aspectRatio: string) => void;
  onPauseVideo?: () => void;
  vlcStatus?: 'idle' | 'opening' | 'playing' | 'closed';
}

const aspectRatioIcon: Record<AspectRatio, React.ReactNode> = {
  '16:9': <span className="text-xs">16:9</span>,
  '16:10': <span className="text-xs">16:10</span>,
  '4:3': <span className="text-xs">4:3</span>,
  '1:1': <span className="text-xs">1:1</span>,
};

const RightControlsComponent = memo(function RightControls({
  aspectRatio,
  playbackRate,
  showSettings,
  isFullscreen,
  isDesktopApp,
  src,
  isHlsStream,
  onCycleAspectRatio,
  onChangeRate,
  onSetShowSettings,
  onToggleFullscreen,
  onTogglePiP,
  onOpenInVlc,
  onPauseVideo,
  vlcStatus: externalVlcStatus,
}: RightControlsProps) {
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const vlcStatus = externalVlcStatus ?? 'idle';

  const buttonBaseClass =
    'flex items-center justify-center rounded-md p-2 text-white/90 transition-all hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none';

  const handleOpenInVlc = () => {
    if (!src || !isDesktopApp) return;

    if (onPauseVideo) {
      onPauseVideo();
    }

    if (onOpenInVlc) {
      onOpenInVlc(src, aspectRatio);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onCycleAspectRatio}
        className={cn(buttonBaseClass, 'hidden border border-white/10 bg-white/5 px-1 md:flex')}
        title={`Aspect Ratio: ${aspectRatio}`}
      >
        {aspectRatioIcon[aspectRatio]}
      </button>

      {onTogglePiP && (
        <button
          onClick={onTogglePiP}
          className={buttonBaseClass}
          title="Picture-in-Picture (P)"
        >
          <PictureInPicture className="h-4 w-4" />
        </button>
      )}

      {isDesktopApp && src && (
        <button
          onClick={handleOpenInVlc}
          disabled={vlcStatus !== 'idle' && vlcStatus !== 'closed'}
          className={cn(
            buttonBaseClass,
            !isHlsStream && 'text-orange-400 hover:text-orange-300',
            vlcStatus === 'playing' && 'animate-pulse text-green-400',
            vlcStatus === 'opening' && 'text-yellow-400',
            vlcStatus === 'closed' && 'text-blue-400 hover:text-blue-300',
          )}
          title={
            vlcStatus === 'playing'
              ? 'Playing in VLC'
              : vlcStatus === 'opening'
                ? 'Opening VLC...'
                : vlcStatus === 'closed'
                  ? 'Click to resume in player'
                  : isHlsStream
                    ? 'Open in VLC (V)'
                    : 'Open in VLC (recommended for this format) (V)'
          }
        >
          <Vlc className={cn('h-4 w-4', vlcStatus === 'playing' && 'animate-pulse')} />
          {vlcStatus !== 'idle' && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white">
              {vlcStatus === 'playing'
                ? 'Playing in VLC'
                : vlcStatus === 'opening'
                  ? 'Opening VLC...'
                  : 'VLC closed - click to resume'}
            </span>
          )}
          {!isHlsStream && vlcStatus === 'idle' && (
            <span className="absolute -top-1 -right-1 h-2 w-2 animate-ping rounded-full bg-orange-400" />
          )}
        </button>
      )}

      <div className="relative hidden md:block">
        <button
          onClick={() => setShowKeyboardHints(!showKeyboardHints)}
          className={cn(buttonBaseClass, showKeyboardHints && 'bg-white/20 text-white')}
          title="Keyboard Shortcuts"
        >
          <span className="text-xs font-bold">?</span>
        </button>
        {showKeyboardHints && (
          <div
            className="animate-in slide-in-from-bottom-2 fade-in absolute right-0 bottom-full z-50 mb-4 w-80 rounded-sm border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-sm font-bold text-white">Keyboard Shortcuts</span>
              <button
                onClick={() => setShowKeyboardHints(false)}
                className="text-white/50 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-white/80">
              <div className="flex justify-between">
                <span>Play/Pause</span>
                <kbd className="rounded bg-white/10 px-2 py-1">Space / K</kbd>
              </div>
              <div className="flex justify-between">
                <span>Forward {PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS}s</span>
                <kbd className="rounded bg-white/10 px-2 py-1">→</kbd>
              </div>
              <div className="flex justify-between">
                <span>Backward {PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS}s</span>
                <kbd className="rounded bg-white/10 px-2 py-1">←</kbd>
              </div>
              <div className="flex justify-between">
                <span>Mute/Unmute</span>
                <kbd className="rounded bg-white/10 px-2 py-1">M</kbd>
              </div>
              <div className="flex justify-between">
                <span>Fullscreen</span>
                <kbd className="rounded bg-white/10 px-2 py-1">F</kbd>
              </div>
            </div>
          </div>
        )}
      </div>

      <SettingsPanel
        showSettings={showSettings}
        playbackRate={playbackRate}
        togglePiP={onTogglePiP}
        onChangeRate={onChangeRate}
        onToggleSettings={() => onSetShowSettings(!showSettings)}
      />

      <button
        onClick={onToggleFullscreen}
        className={buttonBaseClass}
        title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
      >
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
});

export default RightControlsComponent;
