import { useEffect, useRef, useState } from "react";
import type { MediaPlayerInstance } from "@vidstack/react";

export interface UsePlayerReturn {
  playerRef: React.RefObject<MediaPlayerInstance | null>;
  currentTime: number;
  duration: number;
  volume: number;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  buffered: number;
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
  const playerRef = useRef<MediaPlayerInstance>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const unsubscribe = [
      player.subscribe(({ currentTime }) => setCurrentTime(currentTime)),
      player.subscribe(({ duration }) => setDuration(duration)),
      player.subscribe(({ volume }) => setVolumeState(volume)),
      player.subscribe(({ paused }) => setIsPlaying(!paused)),
      player.subscribe(({ muted }) => setIsMuted(muted)),
      player.subscribe(({ fullscreen }) => setIsFullscreen(fullscreen)),
      player.subscribe(({ buffered }) => {
        if (buffered.length > 0) {
          setBuffered(buffered.end(buffered.length - 1));
        }
      }),
    ];

    return () => {
      unsubscribe.forEach((fn) => fn());
    };
  }, []);

  const play = () => playerRef.current?.play();
  const pause = () => playerRef.current?.pause();
  const togglePlay = () => {
    const player = playerRef.current;
    if (player?.state.paused) player.play();
    else player?.pause();
  };

  const seek = (time: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = time;
    }
  };

  const setVolume = (vol: number) => {
    if (playerRef.current) {
      playerRef.current.volume = Math.max(0, Math.min(1, vol));
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      playerRef.current.muted = !playerRef.current.muted;
    }
  };

  const toggleFullscreen = () => {
    if (playerRef.current) {
      if (playerRef.current.state.fullscreen) {
        playerRef.current.exitFullscreen();
      } else {
        playerRef.current.enterFullscreen();
      }
    }
  };

  const forward = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = Math.min(
        playerRef.current.state.duration,
        playerRef.current.state.currentTime + seconds
      );
    }
  };

  const backward = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = Math.max(
        0,
        playerRef.current.state.currentTime - seconds
      );
    }
  };

  return {
    playerRef,
    currentTime,
    duration,
    volume,
    isPlaying,
    isMuted,
    isFullscreen,
    buffered,
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
