import { formatTime } from '@vidstack/react';
import {
  Expand,
  Maximize,
  Maximize2,
  Minimize,
  MoveHorizontal,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

import { cleanName } from '@repo/utils';
import { AspectRatio } from './VideoPlayer';

interface CustomControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isFullscreen: boolean;
  buffered: number;
  volume: number;
  isMuted: boolean;
  aspectRatio: AspectRatio;
  playbackRate?: number;
  title: string;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  onToggleAspectRatio?: () => void;
  onRateIncrease?: () => void;
  onRateDecrease?: () => void;
  onTogglePiP?: () => void;
}

const aspectRatioIcon = {
  '16:9': <Maximize2 className="h-5 w-5 fill-white text-white" />,
  '4:3': <Expand className="h-5 w-5 fill-white text-white" />,
  '1:1': <MoveHorizontal className="h-5 w-5 fill-white text-white" />,
} as const;

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
  playbackRate,
  onRateIncrease,
  onRateDecrease,
  onTogglePiP,
}: CustomControlsProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleHideControls = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    setIsControlsVisible(true);

    if (isFullscreen && isPlaying && !isDraggingSlider) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
  };

  const handleMouseMove = () => {
    scheduleHideControls();
  };

  const handleSliderChange = (value: number[]) => {
    onSeek(value[0]);
  };

  useEffect(() => {
    if (isFullscreen) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleMouseMove);
      scheduleHideControls();
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseMove);
      setIsControlsVisible(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isFullscreen, isPlaying, isDraggingSlider]);

  return (
    <div
      className={`absolute bottom-0 left-0 z-10 flex w-full flex-col gap-3 bg-linear-to-t from-black/80 to-transparent px-4 py-3 transition-opacity duration-300`}
      style={{
        opacity: isControlsVisible ? 1 : 0,
        pointerEvents: isControlsVisible || isDraggingSlider ? 'auto' : 'none',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium whitespace-nowrap text-white">
          {formatTime(currentTime, {
            padHrs: true,
            padMins: true,
          })}
        </span>
        <Slider
          value={[currentTime]}
          onValueChange={handleSliderChange}
          onPointerDown={() => {
            setIsDraggingSlider(true);
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
            }
          }}
          onPointerUp={() => {
            setIsDraggingSlider(false);
            scheduleHideControls();
          }}
          max={duration || 0}
          min={0}
          step={0.1}
          className="flex-1"
        />
        <span className="text-xs font-medium whitespace-nowrap text-white">
          {formatTime(duration, {
            padHrs: true,
            padMins: true,
          })}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center justify-between gap-2">
          <Button
            size={'icon-lg'}
            onClick={onPlayPause}
            className="rounded-lg bg-transparent p-2 transition-colors hover:bg-amber-400/30"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-white text-white" />
            ) : (
              <Play className="h-5 w-5 fill-white text-white" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              size={'icon-lg'}
              onClick={onToggleMute}
              className="rounded-lg bg-transparent p-2 transition-colors hover:bg-amber-400/30"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </Button>
            <div className="flex w-24 items-center gap-2">
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={(value) => onVolumeChange(value[0])}
                max={1}
                min={0}
                step={0.01}
                className="w-full"
              />
            </div>
          </div>
          {onPrev && (
            <Button
              disabled={!hasPrev}
              size={'icon-lg'}
              onClick={onPrev}
              className={cn(
                'rounded-lg bg-transparent p-2 transition-colors hover:bg-amber-400/30',
                !hasPrev && 'cursor-not-allowed',
              )}
              title="Next"
            >
              <SkipBack className="h-5 w-5 fill-white text-white" />
            </Button>
          )}
          {onNext && (
            <Button
              disabled={!hasNext}
              size={'icon-lg'}
              onClick={onNext}
              className={cn(
                'rounded-lg bg-transparent p-2 transition-colors hover:bg-amber-400/30',
                !hasNext && 'cursor-not-allowed',
              )}
              title="Next"
            >
              <SkipForward className="h-5 w-5 fill-white text-white" />
            </Button>
          )}
          {title && (
            <span className="font-medium whitespace-nowrap text-white">{cleanName(title)}</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          {onToggleAspectRatio && (
            <Button
              size={'icon-lg'}
              onClick={onToggleAspectRatio}
              className="rounded-lg bg-transparent p-2 transition-colors hover:bg-amber-400/30"
              title="Toggle Aspect Ratio"
            >
              {aspectRatioIcon[aspectRatio]}
            </Button>
          )}
          {onTogglePiP && (
            <Button
              size={'sm'}
              onClick={onTogglePiP}
              className="rounded-lg bg-transparent px-3 py-2 text-white transition-colors hover:bg-amber-400/30"
              title="Picture-in-Picture"
            >
              PiP
            </Button>
          )}
          <Button
            size={'sm'}
            onClick={() => setShowHelp((s) => !s)}
            className="rounded-lg bg-transparent px-3 py-2 text-white transition-colors hover:bg-amber-400/30"
            title="Shortcuts Help"
          >
            ?
          </Button>
          {(onRateIncrease || onRateDecrease) && (
            <div className="flex items-center gap-2">
              <Button
                size={'sm'}
                onClick={onRateDecrease}
                className="rounded-lg bg-transparent px-3 py-2 text-white transition-colors hover:bg-amber-400/30"
                title="Decrease Speed"
              >
                −
              </Button>
              <span className="text-sm text-white">{(playbackRate ?? 1).toFixed(2)}x</span>
              <Button
                size={'sm'}
                onClick={onRateIncrease}
                className="rounded-lg bg-transparent px-3 py-2 text-white transition-colors hover:bg-amber-400/30"
                title="Increase Speed"
              >
                +
              </Button>
            </div>
          )}
          <Button
            size={'icon-lg'}
            onClick={onToggleFullscreen}
            className="rounded-lg bg-transparent p-2 transition-colors hover:bg-amber-500/30"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5 fill-white text-white" />
            ) : (
              <Maximize className="h-5 w-5 fill-white text-white" />
            )}
          </Button>
        </div>
      </div>
      {showHelp && (
        <div className="absolute right-4 bottom-20 max-w-xs space-y-1 rounded-lg border border-white/10 bg-black/80 p-3 text-xs text-white backdrop-blur-md">
          <div className="mb-1 font-semibold text-amber-300">Shortcuts</div>
          <div>Space: Play/Pause</div>
          <div>M: Mute/Unmute</div>
          <div>F: Fullscreen</div>
          <div>P: Picture-in-Picture</div>
          <div>+: Increase Speed</div>
          <div>-: Decrease Speed</div>
          <div>←/→: Seek 5s</div>
          <div>N/B: Next/Prev Episode (Series)</div>
        </div>
      )}
    </div>
  );
}
