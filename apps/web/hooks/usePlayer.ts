import type { MediaPlayerInstance } from '@vidstack/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UsePlayerReturn {
  playerRef: React.RefObject<MediaPlayerInstance | null>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isFullscreen: boolean;
  buffered: number;
  isLoading: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  forward: (seconds: number) => void;
  backward: (seconds: number) => void;
}

export function usePlayer(): UsePlayerReturn {
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const unsubscribeRef = useRef<Array<() => void>>([]);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Setup subscriptions to a player instance
  const setupSubscriptions = useCallback((player: MediaPlayerInstance | null) => {
    // Clean up old subscriptions
    unsubscribeRef.current.forEach((fn) => fn?.());
    unsubscribeRef.current = [];

    if (!player) return;

    try {
      unsubscribeRef.current = [
        player.subscribe(({ currentTime }) => setCurrentTime(currentTime ?? 0)),
        player.subscribe(({ duration }) => setDuration(duration ?? 0)),
        player.subscribe(({ paused }) => setIsPlaying(!paused)),
        player.subscribe(({ fullscreen }) => setIsFullscreen(fullscreen ?? false)),
        player.subscribe(({ buffered }) => {
          if (buffered && buffered.length > 0) {
            setBuffered(buffered.end(buffered.length - 1) ?? 0);
          }
        }),
        player.subscribe(({ bufferedEnd }) => setIsLoading(bufferedEnd === 0)),
      ];
    } catch (error) {
      console.error('Failed to setup player subscriptions:', error);
    }
  }, []);

  // Watch for player ref changes using a polling approach
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const currentPlayer = playerRef.current;
      // If we have a new player or the player changed, setup subscriptions
      if (currentPlayer) {
        setupSubscriptions(currentPlayer);
      }
    }, 100);

    // Also setup on mount
    setupSubscriptions(playerRef.current);

    return () => {
      clearInterval(checkInterval);
      unsubscribeRef.current.forEach((fn) => fn?.());
    };
  }, [setupSubscriptions]);

  const play = useCallback(() => {
    playerRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (player?.state.paused) {
      player.play();
    } else {
      player?.pause();
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (playerRef.current) {
      playerRef.current.volume = Math.max(0, Math.min(1, vol));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.muted = !playerRef.current.muted;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (playerRef.current) {
      if (playerRef.current.state.fullscreen) {
        playerRef.current.exitFullscreen();
      } else {
        playerRef.current.enterFullscreen();
      }
    }
  }, []);

  const forward = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = Math.min(
        playerRef.current.state.duration ?? 0,
        (playerRef.current.state.currentTime ?? 0) + seconds,
      );
    }
  }, []);

  const backward = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = Math.max(
        0,
        (playerRef.current.state.currentTime ?? 0) - seconds,
      );
    }
  }, []);

  return {
    playerRef,
    currentTime,
    duration,
    isPlaying,
    isFullscreen,
    buffered,
    isLoading,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    forward,
    backward,
  };
}
