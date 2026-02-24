import { RefObject, useEffect } from 'react';
import { PlayerError } from './useVideoState';

interface UseVideoEventsProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  setBufferedEnd: React.Dispatch<React.SetStateAction<number>>;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  setVolumeState: React.Dispatch<React.SetStateAction<number>>;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPlaybackError: React.Dispatch<React.SetStateAction<PlayerError>>;
  onEnded?: () => void;
  saveProgressNow?: () => void;
}

export function useVideoEvents({
  videoRef,
  setPaused,
  setCurrentTime,
  setBufferedEnd,
  setDuration,
  setVolumeState,
  setIsMuted,
  setIsLoading,
  setPlaybackError,
  onEnded,
  saveProgressNow,
}: UseVideoEventsProps) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPaused(video.paused);
    const onPause = () => setPaused(video.paused);
    const onPlaying = () => setPaused(video.paused);
    const onTimeUpdateEvt = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) setBufferedEnd(video.buffered.end(video.buffered.length - 1));

      // Fallback: if video is playing but React thinks it's paused, fix it
      setPaused(video.paused);
    };
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => {
      setVolumeState(video.volume);
      setIsMuted(video.muted);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onSeeking = () => setIsLoading(true);
    const onSeeked = () => {
      setIsLoading(false);
      saveProgressNow?.();
    };
    const onError = () => {
      const err = video.error;
      setPlaybackError({
        message: err?.message ?? 'Unknown playback error',
        code: err?.code ?? 0,
      });
    };
    const onEndedEvt = () => {
      onEnded?.();
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onTimeUpdateEvt);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('seeking', onSeeking);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.addEventListener('ended', onEndedEvt);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onTimeUpdateEvt);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      video.removeEventListener('ended', onEndedEvt);
    };
  }, [
    videoRef, setPaused, setCurrentTime, setBufferedEnd, setDuration,
    setVolumeState, setIsMuted, setIsLoading, setPlaybackError,
    onEnded, saveProgressNow
  ]);
}
