import { RefObject, useCallback } from 'react';
import { ASPECT_RATIOS, AspectRatio } from './useVideoState';

interface UseVideoControlsProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  setVolumeState: React.Dispatch<React.SetStateAction<number>>;
  setPlaybackRateState: React.Dispatch<React.SetStateAction<number>>;
  setAspectRatioState: React.Dispatch<React.SetStateAction<AspectRatio>>;
  storeSetVolume: (vol: number) => void;
  storeSetMuted: (muted: boolean) => void;
  onRateChange?: (rate: number) => void;
  onAspectRatioChange?: (ratio: AspectRatio) => void;
}

export function useVideoControls({
  videoRef,
  containerRef,
  setPaused,
  setIsMuted,
  setVolumeState,
  setPlaybackRateState,
  setAspectRatioState,
  storeSetVolume,
  storeSetMuted,
  onRateChange,
  onAspectRatioChange,
}: UseVideoControlsProps) {

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, [videoRef]);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, time));
  }, [videoRef]);

  const forward = useCallback((secs: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.duration || 0, video.currentTime + secs);
  }, [videoRef]);

  const backward = useCallback((secs: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - secs);
  }, [videoRef]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setIsMuted(next);
    try {
      storeSetMuted(next);
    } catch (e) {}
  }, [videoRef, setIsMuted, storeSetMuted]);

  const setVolume = useCallback(
    (v: number) => {
      const video = videoRef.current;
      const clamped = Math.max(0, Math.min(1, v));
      if (video) {
        video.volume = clamped;
        video.muted = clamped === 0;
      }
      setVolumeState(clamped);
      try {
        storeSetVolume(clamped);
        storeSetMuted(clamped === 0);
      } catch (e) {}
    },
    [videoRef, setVolumeState, storeSetVolume, storeSetMuted],
  );

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, [containerRef]);

  const changeRate = useCallback(
    (rate: number) => {
      const video = videoRef.current;
      if (!video) return;
      const clamped = Math.max(0.25, Math.min(4, rate));
      video.playbackRate = clamped;
      setPlaybackRateState(clamped);
      onRateChange?.(clamped);
    },
    [videoRef, setPlaybackRateState, onRateChange],
  );

  const cycleAspectRatio = useCallback(() => {
    setAspectRatioState((prev) => {
      const next = ASPECT_RATIOS[(ASPECT_RATIOS.indexOf(prev) + 1) % ASPECT_RATIOS.length];
      onAspectRatioChange?.(next);
      return next;
    });
  }, [setAspectRatioState, onAspectRatioChange]);

  return {
    togglePlay,
    seek,
    forward,
    backward,
    toggleMute,
    setVolume,
    toggleFullscreen,
    changeRate,
    cycleAspectRatio,
  };
}
