import { usePlayerStore } from '@repo/store';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { CustomControls } from './CustomControls';
import { PlayerErrorState } from './PlayerErrorState';
import { PlayerPausedOverlay, PlayerSpinner } from './PlayerOverlays';
import { FeedbackAction, SeekFeedback } from './SeekFeedback';

import { PLAYER_CONSTANTS } from '@/constants/player';
import { useControlsVisibility } from '../hooks/useControlsVisibility';
import { useGestureHandlers } from '../hooks/useGestureHandlers';
import { useHls } from '../hooks/useHls';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useProgressTracking } from '../hooks/useProgressTracking';
import { useVideoControls } from '../hooks/useVideoControls';
import { useVideoEvents } from '../hooks/useVideoEvents';
import { AspectRatio, useVideoState } from '../hooks/useVideoState';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}



// ─── VideoPlayerProps ─────────────────────────────────────────────────────────

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  episodeNumber?: number;
  totalEpisodes?: number;
  seasonId?: number;
  movieId?: string;
  serieId?: string;
  categoryId?: string;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
  playNext?: () => void;
  playPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  preferredRate?: number;
  preferredAspectRatio?: AspectRatio;
  onRateChange?: (rate: number) => void;
  onAspectRatioChange?: (ratio: AspectRatio) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = false,
  muted = false,
  loop = false,
  className,
  episodeNumber,
  totalEpisodes,
  seasonId,
  movieId,
  serieId,
  categoryId,
  onEnded,
  onTimeUpdate,
  playNext,
  playPrev,
  hasNext,
  hasPrev,
  preferredRate = 1,
  preferredAspectRatio = '16:9',
  onRateChange,
  onAspectRatioChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null!);

  const storedVolume = usePlayerStore((s) => s.volume);
  const storedMuted = usePlayerStore((s) => s.isMuted);
  const storeSetVolume = usePlayerStore((s) => s.setVolume);
  const storeSetMuted = usePlayerStore((s) => s.setMuted);

  const {
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
    playbackError, setPlaybackError,
  } = useVideoState(autoPlay, storedMuted, preferredRate, preferredAspectRatio);

  const { showControls, setShowControls, resetHideTimer } = useControlsVisibility(paused);

  const {
    saveEpisodeProgress,
    saveMovieProgress,
    getEpisodeProgress,
    movies,
    saveProgressNow,
  } = useProgressTracking({
    videoRef,
    isPlaying: !paused,
    src,
    movieId,
    serieId,
    categoryId,
    poster,
    title,
    episodeNumber,
    seasonId,
    totalEpisodes,
  });

  const handleHlsError = useCallback((message: string, code: number) => {
    setPlaybackError({ message, code });
  }, [setPlaybackError]);

  useHls(videoRef, src, autoPlay, handleHlsError);

  useVideoEvents({
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
  });

  const {
    togglePlay, seek, forward, backward, toggleMute, setVolume,
    toggleFullscreen, changeRate, cycleAspectRatio
  } = useVideoControls({
    videoRef, containerRef, setPaused, setIsMuted, setVolumeState,
    setPlaybackRateState, setAspectRatioState, storeSetVolume, storeSetMuted,
    onRateChange, onAspectRatioChange
  });

  // ─── SeekFeedback state ───
  const [feedbackAction, setFeedbackAction] = useState<FeedbackAction>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((action: FeedbackAction) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedbackAction(action);
    feedbackTimerRef.current = setTimeout(() => setFeedbackAction(null), 600);
  }, []);

  // Wrapped controls with feedback
  const togglePlayWithFeedback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    showFeedback(video.paused ? 'play' : 'pause');
    togglePlay();
  }, [togglePlay, showFeedback, videoRef]);

  const forwardWithFeedback = useCallback((secs: number) => {
    showFeedback('forward');
    forward(secs);
  }, [forward, showFeedback]);

  const backwardWithFeedback = useCallback((secs: number) => {
    showFeedback('backward');
    backward(secs);
  }, [backward, showFeedback]);

  // ─── PiP toggle ───
  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not supported:', err);
    }
  }, [videoRef]);

  // ─── handleProgressSeek (for drag scrubbing) ───
  const handleProgressSeek = useCallback((time: number) => {
    seek(time);
  }, [seek]);

  const handlePlayNext = useCallback(() => {
    if (!hasNext || !playNext) return;
    saveEpisodeProgress();
    const wasFullscreen = isFullscreen;
    playNext();
    if (wasFullscreen) {
      setTimeout(() => {
        containerRef.current?.requestFullscreen().catch(() => { });
      }, 100);
    }
  }, [hasNext, playNext, saveEpisodeProgress, isFullscreen]);

  const handlePlayPrev = useCallback(() => {
    if (!hasPrev || !playPrev) return;
    saveEpisodeProgress();
    const wasFullscreen = isFullscreen;
    playPrev();
    if (wasFullscreen) {
      setTimeout(() => {
        containerRef.current?.requestFullscreen().catch(() => { });
      }, 100);
    }
  }, [hasPrev, playPrev, saveEpisodeProgress, isFullscreen]);

  useKeyboardShortcuts({
    togglePlay: togglePlayWithFeedback,
    forward: forwardWithFeedback,
    backward: backwardWithFeedback,
    changeRate, toggleFullscreen, toggleMute,
    handlePlayNext, handlePlayPrev, playbackRate, setVolume, volume, videoRef,
    togglePiP,
  });

  const { handleSingleClick, handleDoubleClick } = useGestureHandlers({ togglePlay: togglePlayWithFeedback, toggleFullscreen });

  // ─── Mobile double-tap seek ───
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);
  const mobileTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMobileTap = useCallback((e: React.TouchEvent) => {
    const now = Date.now();
    const touch = e.changedTouches[0];
    if (!touch || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;

    if (lastTapRef.current && now - lastTapRef.current.time < PLAYER_CONSTANTS.DOUBLE_TAP_THRESHOLD) {
      // Double-tap detected - cancel any pending single-tap action and seek
      if (mobileTapTimerRef.current) {
        clearTimeout(mobileTapTimerRef.current);
        mobileTapTimerRef.current = null;
      }
      if (isLeftHalf) {
        backwardWithFeedback(PLAYER_CONSTANTS.MOBILE_SEEK_OFFSET_SECONDS);
      } else {
        forwardWithFeedback(PLAYER_CONSTANTS.MOBILE_SEEK_OFFSET_SECONDS);
      }
      lastTapRef.current = null;
    } else {
      // First tap - store and set timer for single-tap play/pause
      lastTapRef.current = { time: now, x };
      mobileTapTimerRef.current = setTimeout(() => {
        // Single-tap - toggle play/pause
        const video = videoRef.current;
        if (video) {
          if (video.paused) {
            video.play().catch(() => { });
          } else {
            video.pause();
          }
        }
        lastTapRef.current = null;
        mobileTapTimerRef.current = null;
      }, PLAYER_CONSTANTS.DOUBLE_TAP_THRESHOLD);
    }
  }, [containerRef, videoRef, backwardWithFeedback, forwardWithFeedback]);

  useEffect(() => {
    setPlaybackError(null);
    const video = videoRef.current;
    if (!video) return;

    if (movieId) {
      const movieItem = movies.find((item) => item.id.toString() === movieId);
      if (movieItem) {
        const onLoaded = () => { video.currentTime = movieItem.position; };
        video.addEventListener('loadedmetadata', onLoaded, { once: true });
      }
    } else if (serieId) {
      const episodeProgress = getEpisodeProgress(
        parseInt(serieId || '0'),
        episodeNumber || 0,
        seasonId || 0,
      );
      if (episodeProgress) {
        const onLoaded = () => { video.currentTime = episodeProgress.position; };
        video.addEventListener('loadedmetadata', onLoaded, { once: true });
      }
    }
  }, [src, movieId, serieId, episodeNumber, seasonId, movies, getEpisodeProgress, setPlaybackError]);

  useEffect(() => {
    const v = videoRef.current;
    setVolumeState(storedVolume ?? 1);
    setIsMuted(!!storedMuted);
    if (v) {
      v.volume = storedVolume ?? 1;
      v.muted = !!storedMuted;
    }
  }, [storedVolume, storedMuted, setVolumeState, setIsMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = preferredRate;
    setPlaybackRateState(preferredRate);
  }, [preferredRate, setPlaybackRateState]);

  useEffect(() => {
    onTimeUpdate?.(currentTime);
  }, [currentTime, onTimeUpdate]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [setIsFullscreen]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seek(pct * duration);
    },
    [duration, seek],
  );

  const handleVolumeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!volumeBarRef.current) return;
      const rect = volumeBarRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setVolume(pct);
    },
    [setVolume],
  );

  const startVolumeDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!volumeBarRef.current) return;
      setShowVolume(true);
      const el = volumeBarRef.current;

      const setFromEvent = (clientX: number) => {
        const rect = el.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        setVolume(pct);
      };

      setFromEvent(e.clientX);
      const onMove = (ev: PointerEvent) => setFromEvent(ev.clientX);
      const onUp = (ev: PointerEvent) => {
        setFromEvent(ev.clientX);
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [setVolume, setShowVolume],
  );

  const displayVolume = isMuted ? 0 : volume;

  if (playbackError) {
    return <PlayerErrorState playbackError={playbackError} setPlaybackError={setPlaybackError} />;
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`relative flex aspect-video max-h-full touch-none select-none ${className || ''}`}
        data-isfullscreen={String(isFullscreen)}
        data-aspect-ratio={aspectRatio}
        onMouseMove={resetHideTimer}
        onMouseLeave={() => {
          if (!paused) setShowControls(false);
        }}
        onTouchEnd={handleMobileTap}
      >
        <video
          ref={videoRef}
          poster={poster}
          muted={isMuted}
          loop={loop}
          playsInline
          className="w-full h-full block object-contain"
          onClick={handleSingleClick}
          onDoubleClick={handleDoubleClick}
          onEnded={() => {
            handlePlayNext();
          }}
        />

        {isLoading && !paused && <PlayerSpinner />}
        {paused && !isLoading && <PlayerPausedOverlay />}

        <SeekFeedback action={feedbackAction} />

        <CustomControls
          showControls={showControls}
          title={title}
          episodeNumber={episodeNumber}
          seasonId={seasonId}
          totalEpisodes={totalEpisodes}
          currentTime={currentTime}
          duration={duration}
          bufferedEnd={bufferedEnd}
          paused={paused}
          hasPrev={hasPrev}
          hasNext={hasNext}
          isMuted={isMuted}
          volume={volume}
          displayVolume={displayVolume}
          aspectRatio={aspectRatio}
          showSettings={showSettings}
          playbackRate={playbackRate}
          isFullscreen={isFullscreen}
          progressRef={progressRef}
          volumeBarRef={volumeBarRef}
          handleSingleClick={handleSingleClick}
          handleDoubleClick={handleDoubleClick}
          handleProgressClick={handleProgressClick}
          handleProgressSeek={handleProgressSeek}
          handlePlayPrev={handlePlayPrev}
          handlePlayNext={handlePlayNext}
          togglePlay={togglePlayWithFeedback}
          backward={backwardWithFeedback}
          forward={forwardWithFeedback}
          toggleMute={toggleMute}
          handleVolumeClick={handleVolumeClick}
          startVolumeDrag={startVolumeDrag}
          cycleAspectRatio={cycleAspectRatio}
          setShowSettings={setShowSettings}
          changeRate={changeRate}
          toggleFullscreen={toggleFullscreen}
          togglePiP={togglePiP}
        />
      </div>
    </>
  );
}
