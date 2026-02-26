import { cn } from '@/shared/lib/utils';
import { invoke } from '@tauri-apps/api/core';
import {
  Maximize2,
  Minimize,
  Pause,
  PictureInPicture,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  SkipBack,
  SkipForward,
  Tv2Icon as Vlc,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PLAYER_CONSTANTS } from '@/constants/player';
import { AspectRatio } from '../hooks/useVideoState';

interface CustomControlsProps {
  showControls: boolean;
  title?: string;
  episodeNumber?: number;
  seasonId?: number;
  totalEpisodes?: number;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  paused: boolean;
  hasPrev?: boolean;
  hasNext?: boolean;
  isMuted: boolean;
  volume: number;
  displayVolume: number;
  aspectRatio: AspectRatio;
  showSettings: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  progressRef: React.RefObject<HTMLDivElement | null>;
  volumeBarRef: React.RefObject<HTMLDivElement>;
  handleSingleClick: (e: React.MouseEvent) => void;
  handleDoubleClick: (e: React.MouseEvent) => void;
  handleProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleProgressSeek: (time: number) => void;
  handlePlayPrev: () => void;
  handlePlayNext: () => void;
  togglePlay: () => void;
  backward: (secs: number) => void;
  forward: (secs: number) => void;
  toggleMute: () => void;
  handleVolumeClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  startVolumeDrag: (e: React.PointerEvent) => void;
  cycleAspectRatio: () => void;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  changeRate: (rate: number) => void;
  toggleFullscreen: () => void;
  togglePiP?: () => void;
  src?: string;
  isDesktopApp?: boolean;
  isHlsStream?: boolean;
  qualityLevels?: { index: number; height?: number; bitrate?: number; label: string }[];
  currentQuality?: number;
  onQualityChange?: (quality: number) => void;
  onOpenInVlc?: (url: string, aspectRatio: string) => void;
  onPauseVideo?: () => void;
  onVlcPositionUpdate?: (position: number) => void;
}

function formatTime(seconds: number, padHrs: boolean = false): string {
  if (!Number.isFinite(seconds) || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (padHrs || h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const aspectRatioIcon = {
  '16:9': <span className='text-xs'>16:9</span>,
  '16:10': <span className='text-xs'>16:10</span>,
  '4:3': <span className='text-xs'>4:3</span>,
  '1:1': <span className='text-xs'>1:1</span>,
};

const VolumeIcon = ({ volume, isMuted }: { volume: number; isMuted: boolean }) => {
  if (isMuted || volume === 0) return <VolumeX className="h-5 w-5" />;
  if (volume > 0.5) return <Volume2 className="h-5 w-5" />;
  return <Volume1 className="h-5 w-5" />;
};

const SeekButton = ({
  onClick,
  children,
  seconds,
  title,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  seconds: number;
  title: string;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="relative flex h-8 w-8 items-center justify-center rounded-md text-white/80 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
  >
    {children}
    <span className="absolute text-[7px] font-bold">{seconds}</span>
  </button>
);

export function CustomControls({
  showControls,
  title,
  episodeNumber,
  seasonId,
  totalEpisodes,
  currentTime,
  duration,
  bufferedEnd,
  paused,
  hasPrev,
  hasNext,
  isMuted,
  volume,
  displayVolume,
  aspectRatio,
  showSettings,
  playbackRate,
  isFullscreen,
  progressRef,
  volumeBarRef,
  handleSingleClick,
  handleDoubleClick,
  handleProgressClick,
  handleProgressSeek,
  handlePlayPrev,
  handlePlayNext,
  togglePlay,
  backward,
  forward,
  toggleMute,
  handleVolumeClick,
  startVolumeDrag,
  cycleAspectRatio,
  setShowSettings,
  changeRate,
  toggleFullscreen,
  togglePiP,
  src,
  isDesktopApp,
  isHlsStream,
  onOpenInVlc,
  onPauseVideo,
  onVlcPositionUpdate,
}: CustomControlsProps) {
  const [hoverTime, setHoverTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [isVolumeHovering, setIsVolumeHovering] = useState(false);
  const [vlcStatus, setVlcStatus] = useState<'idle' | 'opening' | 'playing' | 'closed'>('idle');

  const videoRefForVlc = useRef<HTMLVideoElement | null>(null);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const volumeFeedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const localProgressRef = useRef<HTMLDivElement>(null);

  const handleOpenInVlc = useCallback(async () => {
    if (!src || !isDesktopApp) return;

    setVlcStatus('opening');

    // Pause the browser video
    if (onPauseVideo) {
      onPauseVideo();
    }

    try {
      if (onOpenInVlc) {
        onOpenInVlc(src, aspectRatio);
      } else {
        // Pass current position to VLC so it starts from where we left off
        const position = await invoke<number>('open_in_vlc', {
          url: src,
          aspectRatio,
          startPosition: currentTime,
        });

        // Call the position update callback
        if (onVlcPositionUpdate) {
          onVlcPositionUpdate(position);
        }
      }
      // VLC closed - show option to resume in HTML player
      setVlcStatus('closed');
    } catch {
      setVlcStatus('idle');
    }
  }, [src, isDesktopApp, aspectRatio, onOpenInVlc, onPauseVideo, onVlcPositionUpdate, currentTime]);

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const displayTime = isDragging ? hoverTime : currentTime;
  const padHours = safeDuration > 3600;

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsDraggingVolume(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleProgressHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const ref = progressRef.current || localProgressRef.current;
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setHoverTime(percent * safeDuration);
    },
    [safeDuration, progressRef],
  );

  const handleVolumeMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const ref = volumeBarRef.current;
      if (!ref) return;

      const getPct = (clientX: number) => {
        const rect = ref.getBoundingClientRect();
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      };

      const pct = getPct(e.clientX);
      handleVolumeClick(e);

      const onMove = (ev: PointerEvent) => {
        handleVolumeClick({ clientX: ev.clientX } as React.MouseEvent<HTMLDivElement>);
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [volumeBarRef, handleVolumeClick],
  );

  const handleProgressPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);

      const ref = progressRef.current || localProgressRef.current;
      if (!ref || !safeDuration) return;

      const getPct = (clientX: number) => {
        const rect = ref.getBoundingClientRect();
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      };

      const pct = getPct(e.clientX);
      setHoverTime(pct * safeDuration);

      const onMove = (ev: PointerEvent) => {
        const p = getPct(ev.clientX);
        setHoverTime(p * safeDuration);
      };
      const onUp = (ev: PointerEvent) => {
        const p = getPct(ev.clientX);
        handleProgressSeek(p * safeDuration);
        setIsDragging(false);
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [safeDuration, handleProgressSeek, progressRef],
  );

  const buttonBaseClass =
    'flex items-center cursor-pointer justify-center rounded-md p-2 text-white/90 transition-all hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-95';

  const bufferedPercent = safeDuration > 0 ? (bufferedEnd / safeDuration) * 100 : 0;
  const progressPercent = safeDuration > 0 ? (displayTime / safeDuration) * 100 : 0;
  const hoverPercent = safeDuration > 0 ? (hoverTime / safeDuration) * 100 : 0;

  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col justify-between',
        showControls ? 'pointer-events-auto cursor-default' : 'pointer-events-none cursor-none',
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, [role="slider"]')) return;
        handleSingleClick(e);
      }}
      onDoubleClick={(e) => {
        if ((e.target as HTMLElement).closest('button, [role="slider"]')) return;
        handleDoubleClick(e);
      }}
      role="presentation"
    >
      {/* Top Bar - Title & Episode Info */}
      <div
        className={cn(
          'flex items-center gap-3 px-6 py-5 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <span className="font-['Bebas_Neue','Arial_Narrow',sans-serif] text-xl tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            {title}
          </span>
        )}
        {episodeNumber != null && (
          <span className="rounded border border-white/20 bg-white/15 px-2.5 py-0.5 font-mono text-xs tracking-wider text-white/85 backdrop-blur-sm">
            {seasonId != null ? `S${seasonId} · ` : ''}E{episodeNumber}
          </span>
        )}
      </div>

      {/* Bottom Controls */}
      <div
        className={cn(
          'flex flex-col gap-3 px-4 pt-16 pb-4 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar Row */}
        <div className="flex items-center gap-4 select-none">
          <span className="min-w-11.25 text-right font-mono text-xs font-medium text-white/90 tabular-nums">
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
            onMouseDown={handleProgressPointerDown}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverTime(0)}
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
            {/* Buffered */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-white/30"
              style={{ width: `${bufferedPercent}%` }}
            />

            {/* Hover preview */}
            {hoverTime > 0 && !isDragging && (
              <div
                className="absolute top-0 h-full rounded-full bg-white/20"
                style={{ width: `${hoverPercent}%` }}
              />
            )}

            {/* Progress */}
            <div
              className="to-primary absolute top-0 left-0 h-full rounded-full bg-linear-to-r from-yellow-600/80 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Thumb */}
              <div className="absolute top-1/2 right-0 h-3.5 w-3.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100" />
            </div>

            {/* Hover timestamp tooltip */}
            {hoverTime > 0 && !isDragging && (
              <div
                className="absolute bottom-full mb-3 -translate-x-1/2 rounded-sm border border-white/10 bg-black/80 px-2 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md"
                style={{ left: `${hoverPercent}%` }}
              >
                {formatTime(hoverTime, padHours)}
              </div>
            )}
          </div>

          <span className="min-w-11.25 font-mono text-xs font-medium text-white/90 tabular-nums">
            {formatTime(safeDuration, padHours)}
          </span>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left: Playback Controls */}
          <div className="flex items-center gap-1">
            {/* Previous */}
            <button
              onClick={handlePlayPrev}
              disabled={!hasPrev}
              className={buttonBaseClass}
              title="Previous (B)"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className={cn(buttonBaseClass, 'mx-1 h-10 w-10 bg-white/10 backdrop-blur-sm')}
              title={paused ? 'Play (Space)' : 'Pause (Space)'}
            >
              {paused ? (
                <Play className="h-5 w-5 fill-current" />
              ) : (
                <Pause className="h-5 w-5 fill-current" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={handlePlayNext}
              disabled={!hasNext}
              className={buttonBaseClass}
              title="Next (N)"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            {/* Seek Backward */}
            <SeekButton
              onClick={() => backward(PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS)}
              seconds={PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS}
              title={`Rewind ${PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS}s (←)`}
            >
              <RotateCcw className="h-4 w-4" />
            </SeekButton>

            {/* Seek Forward */}
            <SeekButton
              onClick={() => forward(PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS)}
              seconds={PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS}
              title={`Forward ${PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS}s (→)`}
            >
              <RotateCw className="h-4 w-4" />
            </SeekButton>

            {/* Volume Control */}
            <div
              className="group/vol relative ml-2 flex items-center"
              onMouseEnter={() => setIsVolumeHovering(true)}
              onMouseLeave={() => setIsVolumeHovering(false)}
            >
              <button
                onClick={toggleMute}
                className={buttonBaseClass}
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                <VolumeIcon volume={volume} isMuted={isMuted} />
              </button>

              <div
                ref={volumeBarRef}
                className={cn(
                  'relative ml-2 h-1.5 cursor-pointer rounded-full bg-white/20 transition-all duration-300',
                  isVolumeHovering || isDraggingVolume ? 'w-20' : 'w-0',
                )}
                onMouseDown={handleVolumeMouseDown}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('[role="slider"]')) return;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
                }}
                role="slider"
                tabIndex={0}
                aria-label="Volume"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={isMuted ? 0 : Math.round(volume * 100)}
              >
                <div
                  className="bg-primary absolute top-0 left-0 h-full rounded-full"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                />
                <div
                  className={cn(
                    'absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-md transition-opacity',
                    isVolumeHovering || isDraggingVolume ? 'opacity-100' : 'opacity-0',
                  )}
                  style={{ left: `${isMuted ? 0 : volume * 100}%` }}
                />
              </div>
            </div>

            {/* Title (mobile) */}
            {title && (
              <span className="ml-4 block max-w-37.5 truncate text-sm font-medium text-white/90 md:hidden">
                {title}
              </span>
            )}
          </div>

          {/* Right: Settings & Fullscreen */}
          <div className="flex items-center gap-1">
            {/* Aspect Ratio */}
            <button
              onClick={cycleAspectRatio}
              className={cn(
                buttonBaseClass,
                'hidden border border-white/10 bg-white/5 px-1 md:flex',
              )}
              title={`Aspect Ratio: ${aspectRatio}`}
            >
              {aspectRatioIcon[aspectRatio]}
            </button>

            {/* PiP */}
            {togglePiP && (
              <button
                onClick={togglePiP}
                className={buttonBaseClass}
                title="Picture-in-Picture (P)"
              >
                <PictureInPicture className="h-4 w-4" />
              </button>
            )}

            {/* VLC */}
            {isDesktopApp && src && (
              <button
                onClick={vlcStatus === 'closed' ? () => setVlcStatus('idle') : handleOpenInVlc}
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

            {/* Keyboard Shortcuts Help */}
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

            {/* Settings */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                }}
                className={cn(buttonBaseClass, showSettings && 'bg-white/20 text-white')}
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>

              {showSettings && (
                <div
                  className="animate-in slide-in-from-bottom-2 fade-in absolute right-0 bottom-full z-50 mb-4 w-64 rounded-sm border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}
                >
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
                    <span className="text-xs font-medium text-white/60 uppercase">
                      Playback Speed
                    </span>
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
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className={buttonBaseClass}
              title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
