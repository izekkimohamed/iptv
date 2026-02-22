import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  togglePlay: () => void;
  forward: (secs: number) => void;
  backward: (secs: number) => void;
  changeRate: (rate: number) => void;
  toggleFullscreen: () => void;
  toggleMute: () => void;
  handlePlayNext: () => void;
  handlePlayPrev: () => void;
  playbackRate: number;
  setVolume: (v: number) => void;
  volume: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useKeyboardShortcuts({
  togglePlay,
  forward,
  backward,
  changeRate,
  toggleFullscreen,
  toggleMute,
  handlePlayNext,
  handlePlayPrev,
  playbackRate,
  setVolume,
  volume,
  videoRef,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (e.target as HTMLElement).isContentEditable
      )
        return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          forward(5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          backward(5);
          break;
        case '+':
        case '=':
          e.preventDefault();
          changeRate(playbackRate + 0.25);
          break;
        case '-':
        case '_':
          e.preventDefault();
          changeRate(playbackRate - 0.25);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          handlePlayNext();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          handlePlayPrev();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, (videoRef.current?.volume ?? volume) + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, (videoRef.current?.volume ?? volume) - 0.05));
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    togglePlay,
    forward,
    backward,
    changeRate,
    toggleFullscreen,
    toggleMute,
    handlePlayNext,
    handlePlayPrev,
    playbackRate,
    setVolume,
    volume,
    videoRef,
  ]);
}
