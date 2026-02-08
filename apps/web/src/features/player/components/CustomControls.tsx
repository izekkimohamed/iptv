import { cn } from '@/lib/utils'; // Assuming you have a class merger
import {
    Expand,
    Maximize,
    Maximize2,
    Minimize,
    MoveHorizontal,
    Pause,
    PictureInPicture,
    Play,
    Settings,
    SkipBack,
    SkipForward,
    Volume1,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface CustomControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isFullscreen: boolean;
  buffered: number;
  volume: number;
  isMuted: boolean;
  aspectRatio: '16:9' | '4:3' | '1:1';
  playbackRate?: number;
  title: string;
  hasNext?: boolean;
  hasPrev?: boolean;

  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleAspectRatio?: () => void;
  onRateIncrease?: () => void;
  onRateDecrease?: () => void;
  onRateSet?: (rate: number) => void;
  onTogglePiP?: () => void;
}

const formatTime = (seconds: number, padHrs: boolean = false): string => {
  if (!Number.isFinite(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (padHrs && h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const aspectRatioIcon = {
  '16:9': <Maximize2 className="h-5 w-5" />,
  '4:3': <Expand className="h-5 w-5" />,
  '1:1': <MoveHorizontal className="h-5 w-5" />,
};

const VolumeIcon = ({ volume, isMuted }: { volume: number; isMuted: boolean }) => {
  if (isMuted || volume === 0) return <VolumeX className="h-6 w-6" />;
  if (volume > 0.5) return <Volume2 className="h-6 w-6" />;
  return <Volume1 className="h-6 w-6" />;
};

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function CustomControls({
  currentTime,
  duration,
  isPlaying,
  isFullscreen,
  volume,
  isMuted,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  onToggleAspectRatio,
  aspectRatio,
  title,
  playbackRate = 1,
  onRateIncrease,
  onRateDecrease,
  onRateSet,
  onTogglePiP,
  buffered,
}: CustomControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [volumeChangedByKeyboard, setVolumeChangedByKeyboard] = useState(false);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const volumeFeedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const displayTime = isDragging ? hoverTime : currentTime;

  // --- Interaction Handlers ---

  const scheduleHideControls = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setIsControlsVisible(true);
    if (
      isFullscreen &&
      isPlaying &&
      !isDragging &&
      !isDraggingVolume &&
      !showSettings &&
      !showKeyboardHints
    ) {
      hideTimeoutRef.current = setTimeout(() => setIsControlsVisible(false), 3000);
    }
  }, [isFullscreen, isPlaying, isDragging, isDraggingVolume, showSettings, showKeyboardHints]);

  const handleMouseMove = useCallback(() => {
    scheduleHideControls();
  }, [scheduleHideControls]);

  // --- Progress Bar Logic ---

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(percent * safeDuration);
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(percent * safeDuration);
  };

  // --- Volume Slider Logic (Visual Match) ---

  const handleVolumeInteract = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onVolumeChange(percent);
  };

  const handleVolumeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingVolume) handleVolumeInteract(e);
  };

  // --- Effects ---

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsDraggingVolume(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      window.addEventListener('mousemove', handleMouseMove);
      scheduleHideControls();
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      setIsControlsVisible(true);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (volumeFeedbackTimeoutRef.current) clearTimeout(volumeFeedbackTimeoutRef.current);
    };
  }, [isFullscreen, handleMouseMove, scheduleHideControls]);

  const buttonBaseClass =
    'rounded-sm p-2 text-white/90 transition-all hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 z-40 flex w-full flex-col gap-3 p-4 transition-all duration-300',
        'bg-linear-to-t from-black/90 via-black/60 to-transparent',
        !isControlsVisible && !showSettings
          ? 'pointer-events-none opacity-0'
          : 'pointer-events-auto opacity-100',
      )}
      onMouseMove={handleMouseMove}
    >
      {/* 1. Progress Bar Row */}
      <div className="flex items-center gap-4 select-none">
        <span className="min-w-11.25 text-right text-xs font-medium text-white/90 tabular-nums">
          {formatTime(displayTime, safeDuration > 3600)}
        </span>

        <div
          ref={progressBarRef}
          className="group relative h-1.5 flex-1 cursor-pointer touch-none overflow-hidden rounded-full bg-white/20 transition-all select-none hover:h-2.5"
          onMouseDown={() => setIsDragging(true)}
          onMouseMove={handleProgressHover}
          onMouseLeave={() => setHoverTime(0)}
          onClick={handleProgressClick}
        >
          {/* Buffered */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-white/30"
            style={{ width: `${safeDuration > 0 ? (buffered / safeDuration) * 100 : 0}%` }}
          />

          {/* Current */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-primary"
            style={{ width: `${safeDuration > 0 ? (displayTime / safeDuration) * 100 : 0}%` }}
          >
            {/* Handle Endpoint */}
            <div className="absolute top-1/2 right-0 h-3.5 w-3.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100" />
          </div>

          {/* Hover Ghost */}
          <div
            className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 opacity-0 group-hover:opacity-100"
            style={{ left: `${safeDuration > 0 ? (hoverTime / safeDuration) * 100 : 0}%` }}
          />

          {/* Timestamp Tooltip */}
          {hoverTime > 0 && (
            <div
              className="absolute bottom-full mb-3 -translate-x-1/2 rounded-sm border border-white/10 bg-black/80 px-2 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md"
              style={{ left: `${safeDuration > 0 ? (hoverTime / safeDuration) * 100 : 0}%` }}
            >
              {formatTime(hoverTime, safeDuration > 3600)}
            </div>
          )}
        </div>

        <span className="min-w-11.25 text-xs font-medium text-white/90 tabular-nums">
          {formatTime(safeDuration, safeDuration > 3600)}
        </span>
      </div>

      {/* 2. Controls Row */}
      <div className="flex items-center justify-between">
        {/* LEFT: Playback & Volume */}
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={onPlayPause} className={buttonBaseClass} title="Play/Pause">
            {isPlaying ? (
              <Pause className="h-6 w-6 fill-current" />
            ) : (
              <Play className="h-6 w-6 fill-current" />
            )}
          </button>

          {(onPrev || onNext) && (
            <div className="hidden items-center sm:flex">
              {onPrev && (
                <button
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className={buttonBaseClass}
                  title="Previous"
                >
                  <SkipBack className="h-5 w-5" />
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className={buttonBaseClass}
                  title="Next"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Custom Volume Control */}
          <div className="group/vol relative ml-2 flex items-center">
            <button onClick={onToggleMute} className={buttonBaseClass}>
              <VolumeIcon volume={volume} isMuted={isMuted} />
            </button>

            <div
              ref={volumeBarRef}
              className={cn(
                'relative ml-2 h-1.5 cursor-pointer rounded-full bg-white/20 transition-all duration-300',
                volumeChangedByKeyboard
                  ? 'w-20 opacity-100'
                  : 'w-0 opacity-0 group-focus-within/vol:w-20 group-focus-within/vol:opacity-100 group-hover/vol:w-20 group-hover/vol:opacity-100',
              )}
              onMouseDown={() => setIsDraggingVolume(true)}
              onMouseMove={handleVolumeMouseMove}
              onClick={handleVolumeInteract}
            >
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-primary"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-md group-hover/vol:opacity-100"
                style={{ left: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
          </div>

          {title && (
            <span className="ml-4 hidden max-w-50 truncate text-sm font-medium text-white/90 md:block">
              {title}
            </span>
          )}
        </div>

        {/* RIGHT: Tools & Screen */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Desktop Only Tools */}
          <div className="hidden items-center gap-1 md:flex">
            {onToggleAspectRatio && (
              <button
                onClick={onToggleAspectRatio}
                className={buttonBaseClass}
                title="Aspect Ratio"
              >
                {aspectRatioIcon[aspectRatio]}
              </button>
            )}
            {onTogglePiP && (
              <button onClick={onTogglePiP} className={buttonBaseClass} title="Picture in Picture">
                <PictureInPicture className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowKeyboardHints(!showKeyboardHints)}
              className={cn(buttonBaseClass, showKeyboardHints && 'bg-white/10 text-white')}
              title="Keyboard Shortcuts"
            >
              <kbd className="text-xs font-bold">?</kbd>
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
                    <span>Forward 5s</span>
                    <kbd className="rounded bg-white/10 px-2 py-1">→</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Backward 5s</span>
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

          {/* Settings Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              className={cn(buttonBaseClass, showSettings && 'bg-white/10 text-white')}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            {showSettings && (
              <div
                className="animate-in slide-in-from-bottom-2 fade-in absolute right-0 bottom-full z-50 mb-4 w-64 rounded-sm border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-sm font-bold text-white">Settings</span>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-white/50 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Mobile: Extra Tools inside settings */}
                <div className="mb-4 space-y-3 md:hidden">
                  {onToggleAspectRatio && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70">Aspect Ratio</span>
                      <button
                        onClick={onToggleAspectRatio}
                        className="rounded bg-white/10 px-2 py-1 text-xs text-primary"
                      >
                        {aspectRatio}
                      </button>
                    </div>
                  )}
                  {onTogglePiP && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70">Picture in Picture</span>
                      <button
                        onClick={onTogglePiP}
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
                    {speedOptions.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          if (onRateSet) {
                            onRateSet(speed);
                          } else if (speed > playbackRate) {
                            onRateIncrease?.();
                          } else if (speed < playbackRate) {
                            onRateDecrease?.();
                          }
                        }}
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

          <button onClick={onToggleFullscreen} className={buttonBaseClass} title="Fullscreen">
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
