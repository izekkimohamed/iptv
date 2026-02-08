import type {
  MediaPlayerInstance,
  MediaProgressEventDetail,
  MediaTimeUpdateEventDetail
} from '@vidstack/react';
import { useCallback, useMemo, useRef, useState } from 'react';

export interface UsePlayerReturn {
  playerRef: React.RefObject<MediaPlayerInstance | null>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isFullscreen: boolean;
  buffered: number;
  isLoading: boolean;
  playbackRate: number;
  isPiP: boolean;
  isPaused: boolean;
  // Event Handlers
  onTimeUpdate: (detail: MediaTimeUpdateEventDetail) => void;
  onDurationChange: (duration: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onLoading: (isLoading: boolean) => void;
  onFullscreenChange: (isFullscreen: boolean) => void;
  onProgress: (detail: MediaProgressEventDetail) => void;
  onPlaybackRateChange: (rate: number) => void;
  onPiPChange: (isPiP: boolean) => void;
  // Commands
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  forward: (seconds: number) => void;
  backward: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  togglePiP: () => void;
}

/**
 * Event-Driven Robust Player Hook.
 * This implementation avoids Vidstack's internal state proxy for reading state,
 * which resolves the "this.$state[prop2] is not a function" error.
 * It uses standard React state updated via MediaPlayer events.
 */
export function usePlayer(): UsePlayerReturn {
  const playerRef = useRef<MediaPlayerInstance | null>(null);

  // --- Internal State ---
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPiP, setIsPiP] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // --- Event Handlers (Native Vidstack Events) ---
  const onTimeUpdate = useCallback((detail: MediaTimeUpdateEventDetail) => {
    setCurrentTime(detail.currentTime);
  }, []);

  const onDurationChange = useCallback((d: number) => {
    setDuration(d);
  }, []);

  const onPlay = useCallback(() => {
    setIsPlaying(true);
    setIsPaused(false);
  }, []);

  const onPause = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const onLoading = useCallback((loading: boolean) => setIsLoading(loading), []);

  const onFullscreenChange = useCallback((isFullscreen: boolean) => {
    setIsFullscreen(isFullscreen);
  }, []);

  const onProgress = useCallback((detail: MediaProgressEventDetail) => {
    if (detail.buffered.length > 0) {
      setBuffered(detail.buffered.end(detail.buffered.length - 1));
    }
  }, []);

  const onPlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
  }, []);

  const onPiPChange = useCallback((pip: boolean) => {
    setIsPiP(pip);
  }, []);

  // --- Commands (Using ref directly for stability) ---
  const play = useCallback(() => playerRef.current?.play(), []);
  const pause = useCallback(() => playerRef.current?.pause(), []);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.paused) player.play();
    else player.pause();
  }, []);

  const seek = useCallback((time: number) => {
    if (playerRef.current) playerRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (playerRef.current) playerRef.current.volume = Math.max(0, Math.min(1, vol));
  }, []);

  const toggleMute = useCallback(() => {
    if (playerRef.current) playerRef.current.muted = !playerRef.current.muted;
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;

    try {
      if (isFullscreen) {
        await player.exitFullscreen();
      } else {
        await player.enterFullscreen();
      }
    } catch (err) {
      // Silently handle orientation lock errors on desktop/unsupported devices
      if (err instanceof Error && !err.message.includes('orientation')) {
        console.error('Fullscreen error:', err);
      }
    }
  }, [isFullscreen]);

  const forward = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = Math.min(duration, currentTime + seconds);
    }
  }, [currentTime, duration]);

  const backward = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = Math.max(0, currentTime - seconds);
    }
  }, [currentTime]);

  const setPlaybackRateCmd = useCallback((rate: number) => {
    if (playerRef.current) playerRef.current.playbackRate = rate;
  }, []);

  const togglePiP = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;

    try {
      if (isPiP) {
        await player.exitPictureInPicture();
      } else {
        await player.enterPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not supported:', err);
    }
  }, [isPiP]);

  return useMemo(() => ({
    playerRef,
    currentTime,
    duration,
    isPlaying,
    isFullscreen,
    buffered,
    isLoading,
    playbackRate,
    isPiP,
    isPaused,
    onTimeUpdate,
    onDurationChange,
    onPlay,
    onPause,
    onLoading,
    onFullscreenChange,
    onProgress,
    onPlaybackRateChange,
    onPiPChange,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    forward,
    backward,
    setPlaybackRate: setPlaybackRateCmd,
    togglePiP,
  }), [
    currentTime, duration, isPlaying, isFullscreen, buffered, isLoading, playbackRate, isPiP, isPaused,
    onTimeUpdate, onDurationChange, onPlay, onPause, onLoading, onFullscreenChange, onProgress,
    onPlaybackRateChange, onPiPChange, play, pause,
    togglePlay, seek, setVolume, toggleMute, toggleFullscreen, forward, backward,
    setPlaybackRateCmd, togglePiP
  ]);
}

