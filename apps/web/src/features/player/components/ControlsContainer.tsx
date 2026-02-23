import React, { memo } from 'react';

import { AspectRatio } from '../hooks/useVideoState';
import { ControlStrip } from './ControlStrip';
import TopBar from './TopBar';

interface ControlsContainerProps {
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

export const ControlsContainer = memo(function ControlsContainer(props: ControlsContainerProps) {
  const { handleSingleClick, handleDoubleClick, showControls, title, episodeNumber, seasonId, totalEpisodes, ...stripProps } = props;

  return (
    <div
      style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', cursor: showControls ? 'default' : 'none',
        pointerEvents: showControls ? 'auto' : 'none',
      }}
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSingleClick(e as unknown as React.MouseEvent);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Video controls"
    >
      <TopBar
        title={title}
        episodeNumber={episodeNumber}
        seasonId={seasonId}
        totalEpisodes={totalEpisodes}
        showControls={showControls}
      />

      <ControlStrip showControls={showControls} {...stripProps} />
    </div>
  );
});
