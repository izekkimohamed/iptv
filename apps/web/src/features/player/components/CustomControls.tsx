import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cleanName, cn } from '@/lib/utils';
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
  '16:9': <Maximize2 className="w-5 h-5 text-white fill-white" />,
  '4:3': <Expand className="w-5 h-5 text-white fill-white" />,
  '1:1': <MoveHorizontal className="w-5 h-5 text-white fill-white" />,
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
      className={`absolute bottom-0 left-0 flex flex-col gap-3 w-full px-4 py-3 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 z-10`}
      style={{
        opacity: isControlsVisible ? 1 : 0,
        pointerEvents: isControlsVisible || isDraggingSlider ? 'auto' : 'none',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-white text-xs font-medium whitespace-nowrap">
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
        <span className="text-white text-xs font-medium whitespace-nowrap">
          {formatTime(duration, {
            padHrs: true,
            padMins: true,
          })}
        </span>
      </div>
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center justify-between gap-2">
          <Button
            size={'icon-lg'}
            onClick={onPlayPause}
            className="p-2 bg-transparent hover:bg-amber-400/30 rounded-lg transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white fill-white" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              size={'icon-lg'}
              onClick={onToggleMute}
              className="p-2 bg-transparent hover:bg-amber-400/30 rounded-lg transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </Button>
            <div className="flex items-center gap-2 w-24">
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
                'p-2 bg-transparent hover:bg-amber-400/30 rounded-lg transition-colors',
                !hasPrev && 'cursor-not-allowed',
              )}
              title="Next"
            >
              <SkipBack className="w-5 h-5 text-white fill-white" />
            </Button>
          )}
          {onNext && (
            <Button
              disabled={!hasNext}
              size={'icon-lg'}
              onClick={onNext}
              className={cn(
                'p-2 bg-transparent hover:bg-amber-400/30 rounded-lg transition-colors',
                !hasNext && 'cursor-not-allowed',
              )}
              title="Next"
            >
              <SkipForward className="w-5 h-5 text-white  fill-white" />
            </Button>
          )}
          {title && (
            <span className="text-white  font-medium whitespace-nowrap">{cleanName(title)}</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          {onToggleAspectRatio && (
            <Button
              size={'icon-lg'}
              onClick={onToggleAspectRatio}
              className="p-2 bg-transparent hover:bg-amber-400/30 rounded-lg transition-colors"
              title="Toggle Aspect Ratio"
            >
              {aspectRatioIcon[aspectRatio]}
            </Button>
          )}
          {onTogglePiP && (
            <Button
              size={'sm'}
              onClick={onTogglePiP}
              className="px-3 py-2 bg-transparent hover:bg-amber-400/30 rounded-lg transition-colors text-white"
              title="Picture-in-Picture"
            >
              PiP
            </Button>
          )}
          <Button
            size={'sm'}
            onClick={() => setShowHelp((s) => !s)}
            className="px-3 py-2 bg-transparent hover:bg-amber-400/30 rounded-lg transition-colors text-white"
            title="Shortcuts Help"
          >
            ?
          </Button>
          {(onRateIncrease || onRateDecrease) && (
            <div className="flex items-center gap-2">
              <Button
                size={'sm'}
                onClick={onRateDecrease}
                className="px-3 py-2 bg-transparent hover:bg-amber-400/30 rounded-lg transition-colors text-white"
                title="Decrease Speed"
              >
                −
              </Button>
              <span className="text-white text-sm">{(playbackRate ?? 1).toFixed(2)}x</span>
              <Button
                size={'sm'}
                onClick={onRateIncrease}
                className="px-3 py-2 bg-transparent hover:bg-amber-400/30 rounded-lg transition-colors text-white"
                title="Increase Speed"
              >
                +
              </Button>
            </div>
          )}
          <Button
            size={'icon-lg'}
            onClick={onToggleFullscreen}
            className="p-2 bg-transparent hover:bg-amber-500/30 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-white fill-white" />
            ) : (
              <Maximize className="w-5 h-5 text-white fill-white" />
            )}
          </Button>
        </div>
      </div>
      {showHelp && (
        <div className="absolute right-4 bottom-20 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 text-white text-xs space-y-1 max-w-xs">
          <div className="font-semibold text-amber-300 mb-1">Shortcuts</div>
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
