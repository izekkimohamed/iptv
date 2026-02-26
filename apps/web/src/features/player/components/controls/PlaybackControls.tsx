import { Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { memo } from 'react';

import { PLAYER_CONSTANTS } from '@/constants/player';

interface PlaybackControlsProps {
  paused: boolean;
  hasPrev?: boolean;
  hasNext?: boolean;
  onTogglePlay: () => void;
  onPlayPrev: () => void;
  onPlayNext: () => void;
  onBackward: (secs: number) => void;
  onForward: (secs: number) => void;
}

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

const PlaybackControlsComponent = memo(function PlaybackControls({
  paused,
  hasPrev,
  hasNext,
  onTogglePlay,
  onPlayPrev,
  onPlayNext,
  onBackward,
  onForward,
}: PlaybackControlsProps) {
  const buttonBaseClass =
    'flex items-center cursor-pointer justify-center rounded-md p-2 text-white/90 transition-all hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-95';

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onPlayPrev}
        disabled={!hasPrev}
        className={buttonBaseClass}
        title="Previous (B)"
      >
        <SkipBack className="h-4 w-4" />
      </button>

      <button
        onClick={onTogglePlay}
        className={cn(buttonBaseClass, 'mx-1 h-10 w-10 bg-white/10 backdrop-blur-sm')}
        title={paused ? 'Play (Space)' : 'Pause (Space)'}
      >
        {paused ? (
          <Play className="h-5 w-5 fill-current" />
        ) : (
          <Pause className="h-5 w-5 fill-current" />
        )}
      </button>

      <button
        onClick={onPlayNext}
        disabled={!hasNext}
        className={buttonBaseClass}
        title="Next (N)"
      >
        <SkipForward className="h-4 w-4" />
      </button>

      <SeekButton
        onClick={() => onBackward(PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS)}
        seconds={PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS}
        title={`Rewind ${PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS}s (←)`}
      >
        <RotateCcw className="h-4 w-4" />
      </SeekButton>

      <SeekButton
        onClick={() => onForward(PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS)}
        seconds={PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS}
        title={`Forward ${PLAYER_CONSTANTS.SEEK_OFFSET_SECONDS}s (→)`}
      >
        <RotateCw className="h-4 w-4" />
      </SeekButton>
    </div>
  );
});

export default PlaybackControlsComponent;
