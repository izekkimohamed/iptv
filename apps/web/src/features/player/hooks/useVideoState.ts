import { useState } from 'react';

export type AspectRatio = '16:9' | '4:3' | '1:1' | '16:10';
export const ASPECT_RATIOS: AspectRatio[] = ['16:9', '4:3', '1:1'];
export type PlayerError = { message: string; code: number } | null;

export function useVideoState(
  autoPlay: boolean,
  storedMuted: boolean | undefined,
  preferredRate: number,
  preferredAspectRatio: AspectRatio
) {
  const [paused, setPaused] = useState(!autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(!!storedMuted);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(preferredRate);
  const [aspectRatio, setAspectRatioState] = useState<AspectRatio>(preferredAspectRatio);
  const [playbackError, setPlaybackError] = useState<PlayerError>(null);

  return {
    paused, setPaused,
    currentTime, setCurrentTime,
    duration, setDuration,
    bufferedEnd, setBufferedEnd,
    volume, setVolumeState,
    isMuted, setIsMuted,
    isLoading, setIsLoading,
    isFullscreen, setIsFullscreen,
    showVolume, setShowVolume,
    showSettings, setShowSettings,
    playbackRate, setPlaybackRateState,
    aspectRatio, setAspectRatioState,
    playbackError, setPlaybackError
  };
}
