import { useEffect, useRef, useState } from 'react';

import { PLAYER_CONSTANTS } from '@/constants/player';
import { AspectRatio } from '../hooks/useVideoState';

import {
  PlaybackControls,
  ProgressBar,
  RightControls,
  VolumeControl,
} from './controls';

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
  vlcStatus?: 'idle' | 'opening' | 'playing' | 'closed';
}

export function CustomControls({
  showControls,
  title,
  episodeNumber,
  seasonId,
  currentTime,
  duration,
  bufferedEnd,
  paused,
  hasPrev,
  hasNext,
  isMuted,
  volume,
  aspectRatio,
  showSettings,
  playbackRate,
  isFullscreen,
  progressRef,
  volumeBarRef,
  handleSingleClick,
  handleDoubleClick,
  handleProgressSeek,
  handlePlayPrev,
  handlePlayNext,
  togglePlay,
  backward,
  forward,
  toggleMute,
  handleVolumeClick,
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
  vlcStatus,
}: CustomControlsProps) {
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Global mouse up handler
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div
      className={
        showControls
          ? 'absolute inset-0 flex flex-col justify-between pointer-events-auto cursor-default'
          : 'absolute inset-0 flex flex-col justify-between pointer-events-none cursor-none'
      }
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
        className={
          showControls
            ? 'flex items-center gap-3 px-6 py-5 transition-opacity duration-300 opacity-100'
            : 'flex items-center gap-3 px-6 py-5 transition-opacity duration-300 opacity-0'
        }
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
        className={
          showControls
            ? 'flex flex-col gap-3 px-4 pt-16 pb-4 transition-opacity duration-300 opacity-100'
            : 'flex flex-col gap-3 px-4 pt-16 pb-4 transition-opacity duration-300 opacity-0'
        }
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar Row */}
        <ProgressBar
          progressRef={progressRef}
          currentTime={currentTime}
          duration={duration}
          bufferedEnd={bufferedEnd}
          onProgressSeek={handleProgressSeek}
        />

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left: Playback Controls + Volume */}
          <div className="flex items-center">
            <PlaybackControls
              paused={paused}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onTogglePlay={togglePlay}
              onPlayPrev={handlePlayPrev}
              onPlayNext={handlePlayNext}
              onBackward={backward}
              onForward={forward}
            />

            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              volumeBarRef={volumeBarRef}
              onToggleMute={toggleMute}
              onVolumeClick={handleVolumeClick}
            />

            {title && (
              <span className="ml-4 block max-w-37.5 truncate text-sm font-medium text-white/90 md:hidden">
                {title}
              </span>
            )}
          </div>

          {/* Right: Settings & Fullscreen */}
          <RightControls
            aspectRatio={aspectRatio}
            playbackRate={playbackRate}
            showSettings={showSettings}
            isFullscreen={isFullscreen}
            isDesktopApp={isDesktopApp}
            src={src}
            isHlsStream={isHlsStream}
            onCycleAspectRatio={cycleAspectRatio}
            onChangeRate={changeRate}
            onSetShowSettings={setShowSettings}
            onToggleFullscreen={toggleFullscreen}
            onTogglePiP={togglePiP}
            onOpenInVlc={onOpenInVlc}
            onPauseVideo={onPauseVideo}
            vlcStatus={vlcStatus}
          />
        </div>
      </div>
    </div>
  );
}
