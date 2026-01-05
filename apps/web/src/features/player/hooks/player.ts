import type { MediaPlayerInstance } from '@vidstack/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UsePlayerReturn {
  // We return a callback ref now to detect mount immediately
  playerRef: (node: MediaPlayerInstance | null) => void;
  // We also expose the raw instance for direct access if needed
  instance: MediaPlayerInstance | null;

  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isFullscreen: boolean;
  buffered: number;
  isLoading: boolean;
  playbackRate: number;
  isPiP: boolean;
  volume: number;
  isMuted: boolean;
  canPlay: boolean;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  togglePiP: () => void;
  forward: (seconds: number) => void;
  backward: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  increasePlaybackRate: (amount?: number) => void;
  decreasePlaybackRate: (amount?: number) => void;
}

export function usePlayer(): UsePlayerReturn {
  const [player, setPlayer] = useState<MediaPlayerInstance | null>(null);
  const unsubscribeRef = useRef<Array<() => void>>([]);

  // State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isPiP, setIsPiP] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMutedState] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  // 1. Callback Ref: Triggered when <MediaPlayer> mounts/unmounts
  const playerRef = useCallback((node: MediaPlayerInstance | null) => {
    // Cleanup previous subscriptions
    unsubscribeRef.current.forEach((fn) => fn());
    unsubscribeRef.current = [];

    if (node) {
      setPlayer(node);

      // Setup subscriptions immediately
      const subs = [
        node.subscribe(({ currentTime }) => setCurrentTime(currentTime)),
        node.subscribe(({ duration }) => setDuration(duration)),
        node.subscribe(({ paused }) => setIsPlaying(!paused)),
        node.subscribe(({ fullscreen }) => setIsFullscreen(fullscreen)),
        node.subscribe(({ buffered }) => {
          if (buffered && buffered.length > 0) {
            setBuffered(buffered.end(buffered.length - 1));
          }
        }),
        node.subscribe(({ bufferedEnd }) => setIsLoading(bufferedEnd === 0)),
        node.subscribe(({ playbackRate }) => setPlaybackRateState(playbackRate)),
        node.subscribe(({ pictureInPicture }) => setIsPiP(pictureInPicture)),
        node.subscribe(({ volume }) => setVolumeState(volume)),
        node.subscribe(({ muted }) => setIsMutedState(muted)),
        node.subscribe(({ canPlay }) => setCanPlay(canPlay)),
      ];

      unsubscribeRef.current = subs;
    } else {
      setPlayer(null);
    }
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      unsubscribeRef.current.forEach((fn) => fn());
    };
  }, []);

  // Actions
  const play = useCallback(() => player?.play(), [player]);
  const pause = useCallback(() => player?.pause(), [player]);

  const togglePlay = useCallback(() => {
    if (!player) return;
    player.paused ? player.play() : player.pause();
  }, [player]);

  const seek = useCallback(
    (time: number) => {
      if (!player) return;
      player.currentTime = Math.max(0, Math.min(time, player.state.duration));
    },
    [player],
  );

  const setVolume = useCallback(
    (vol: number) => {
      if (!player) return;
      player.volume = Math.max(0, Math.min(1, vol));
    },
    [player],
  );

  const toggleMute = useCallback(() => {
    if (!player) return;
    player.muted = !player.muted;
  }, [player]);

  const toggleFullscreen = useCallback(() => {
    if (!player) return;
    player.state.fullscreen ? player.exitFullscreen() : player.enterFullscreen();
  }, [player]);

  const togglePiP = useCallback(() => {
    if (!player) return;
    player.state.pictureInPicture ? player.exitPictureInPicture() : player.enterPictureInPicture();
  }, [player]);

  const forward = useCallback(
    (seconds: number) => {
      if (!player) return;
      player.currentTime = Math.min(player.state.duration, player.currentTime + seconds);
    },
    [player],
  );

  const backward = useCallback(
    (seconds: number) => {
      if (!player) return;
      player.currentTime = Math.max(0, player.currentTime - seconds);
    },
    [player],
  );

  const setPlaybackRate = useCallback(
    (rate: number) => {
      if (!player) return;
      player.playbackRate = Math.max(0.25, Math.min(3, rate));
    },
    [player],
  );

  const increasePlaybackRate = useCallback(
    (amount = 0.25) => {
      if (!player) return;
      player.playbackRate = Math.min(3, player.playbackRate + amount);
    },
    [player],
  );

  const decreasePlaybackRate = useCallback(
    (amount = 0.25) => {
      if (!player) return;
      player.playbackRate = Math.max(0.25, player.playbackRate - amount);
    },
    [player],
  );

  return {
    playerRef, // Pass this to <MediaPlayer ref={...}>
    instance: player,
    currentTime,
    duration,
    isPlaying,
    isFullscreen,
    buffered,
    isLoading,
    playbackRate,
    isPiP,
    volume,
    isMuted,
    canPlay,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    togglePiP,
    forward,
    backward,
    setPlaybackRate,
    increasePlaybackRate,
    decreasePlaybackRate,
  };
}
