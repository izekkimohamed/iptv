import {
    Maximize2,
    Minimize2,
    Pause,
    Play,
    RotateCcw, // For rewind 5s
    RotateCw,
    Settings,
    SkipBack,
    SkipForward,
} from 'lucide-react';
import React, { memo, useCallback } from 'react';

import { AspectRatio } from '../hooks/useVideoState';
import ProgressBar from './ProgressBar';
import SettingsSection from './SettingsSection';
import VolumeControl from './VolumeControl';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface ControlBtnProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
  large?: boolean;
  active?: boolean;
}

export const ControlBtn = memo(function ControlBtn({
  onClick,
  children,
  disabled,
  title,
  large,
  active,
}: ControlBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
        border: 'none',
        color: disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.9)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: large ? '8px' : '6px',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s, color 0.15s, transform 0.1s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = active
          ? 'rgba(255,255,255,0.15)'
          : 'transparent';
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
    >
      {children}
    </button>
  );
});

interface ControlStripProps {
  showControls: boolean;
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
  handleProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
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
}

export const ControlStrip = memo(function ControlStrip({
  showControls,
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
  handleProgressClick,
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
}: ControlStripProps) {
  const handleBackward5 = useCallback(() => backward(5), [backward]);
  const handleForward5 = useCallback(() => forward(5), [forward]);
  const handleToggleSettings = useCallback(() => setShowSettings((s) => !s), [setShowSettings]);

  return (
    <div
      style={{
        opacity: showControls ? 1 : 0, transition: 'opacity 0.3s',
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        pointerEvents: showControls ? 'auto' : 'none', padding: '60px 0 0',
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Control strip"
    >
      <div className="flex items-center justify-center gap-1">
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'monospace', marginLeft: 8, letterSpacing: 1, whiteSpace: 'nowrap' }}>
          {formatTime(currentTime)}
        </div>
        <ProgressBar ref={progressRef} duration={duration} bufferedEnd={bufferedEnd} currentTime={currentTime} onClick={handleProgressClick} />
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'monospace', marginLeft: 8, letterSpacing: 1, whiteSpace: 'nowrap' }}>
          {formatTime(duration)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 20px 16px', gap: 4 }}>
        <ControlBtn onClick={handlePlayPrev} disabled={!hasPrev} title="Previous (B)"><SkipBack size={18} /></ControlBtn>
        <ControlBtn onClick={togglePlay} title={paused ? 'Play (Space)' : 'Pause (Space)'} large>
          {paused ? <Play size={22} /> : <Pause size={22} />}
        </ControlBtn>
        <ControlBtn onClick={handlePlayNext} disabled={!hasNext} title="Next (N)"><SkipForward size={18} /></ControlBtn>

        <ControlBtn onClick={handleBackward5} title="Rewind 5s (←)">
          <div className="relative flex items-center justify-center">
             <RotateCcw size={20} />
             <span className="absolute text-[8px] font-bold" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: '1px' }}>5</span>
          </div>
        </ControlBtn>
        <ControlBtn onClick={handleForward5} title="Forward 5s (→)">
          <div className="relative flex items-center justify-center">
             <RotateCw size={20} />
             <span className="absolute text-[8px] font-bold" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: '1px' }}>5</span>
          </div>
        </ControlBtn>

        <VolumeControl isMuted={isMuted} volume={volume} displayVolume={displayVolume} toggleMute={toggleMute} volumeBarRef={volumeBarRef} handleVolumeClick={handleVolumeClick} startVolumeDrag={startVolumeDrag} />

        <div style={{ flex: 1 }} />

        <button
          onClick={cycleAspectRatio} title="Cycle aspect ratio"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.8)', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer', letterSpacing: 0.5, transition: 'background 0.15s' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.16)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')}
        >
          {aspectRatio}
        </button>

        <div style={{ position: 'relative' }}>
          <ControlBtn onClick={handleToggleSettings} title="Settings" active={showSettings}>
            <Settings size={16} />
          </ControlBtn>
          {showSettings && (
            <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, background: 'rgba(18,18,18,0.97)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, width: 200, zIndex: 100 }}>
              <SettingsSection label="Speed (+/−)" options={RATES.map(String)} selected={String(playbackRate)} onSelect={(v) => changeRate(parseFloat(v))} />
            </div>
          )}
        </div>

        <ControlBtn onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}>
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </ControlBtn>
      </div>
    </div>
  );
});
