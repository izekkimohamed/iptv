import { usePlayerStore } from '@repo/store';
import { invoke } from '@tauri-apps/api/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { CustomControls } from './CustomControls';
import { PlayerErrorState } from './PlayerErrorState';
import { PlayerPausedOverlay, PlayerSpinner } from './PlayerOverlays';
import { FeedbackAction, SeekFeedback } from './SeekFeedback';

import { PLAYER_CONSTANTS } from '@/constants/player';
import { useTauri } from '@/shared/hooks/useTauri';
import { useControlsVisibility } from '../hooks/useControlsVisibility';
import { useGestureHandlers } from '../hooks/useGestureHandlers';
import { useHls } from '../hooks/useHls';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useProgressTracking } from '../hooks/useProgressTracking';
import { useVideoControls } from '../hooks/useVideoControls';
import { useVideoEvents } from '../hooks/useVideoEvents';
import { AspectRatio, useVideoState } from '../hooks/useVideoState';

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

// ─── Video Element Component ───────────────────────────────────────────────────

function VideoElement({
  videoRef,
  poster,
  isMuted,
  loop,
  onEnded,
  onClick,
  onDoubleClick,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  poster?: string;
  isMuted: boolean;
  loop?: boolean;
  onEnded: () => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
}) {
  return (
    <video
      ref={videoRef}
      poster={poster}
      muted={isMuted}
      loop={loop}
      playsInline
      className="block h-full w-full object-contain"
      onEnded={onEnded}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    />
  );
}

// ─── Player Loader Component ─────────────────────────────────────────────────

function PlayerLoader({ isLoading, paused }: { isLoading: boolean; paused: boolean }) {
  if (isLoading && !paused) return <PlayerSpinner />;
  if (paused && !isLoading) return <PlayerPausedOverlay />;
  return null;
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
  preferredAspectRatio = '16:10',
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
    paused,
    setPaused,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    bufferedEnd,
    setBufferedEnd,
    volume,
    setVolumeState,
    isMuted,
    setIsMuted,
    isLoading,
    setIsLoading,
    isFullscreen,
    setIsFullscreen,
    showVolume,
    setShowVolume,
    showSettings,
    setShowSettings,
    playbackRate,
    setPlaybackRateState,
    aspectRatio,
    setAspectRatioState,
    playbackError,
    setPlaybackError,
  } = useVideoState(autoPlay, storedMuted, preferredRate, preferredAspectRatio);

  const { showControls, setShowControls, resetHideTimer } = useControlsVisibility(paused);

  const { isDesktopApp } = useTauri();

  const { saveEpisodeProgress, saveMovieProgress, getEpisodeProgress, movies, saveProgressNow } =
    useProgressTracking({
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

  const handleHlsError = useCallback(
    (message: string, code: number) => {
      setPlaybackError({ message, code });
    },
    [setPlaybackError],
  );

  const { qualityLevels, currentQuality, setQuality } = useHls(
    videoRef,
    src,
    autoPlay,
    handleHlsError,
  );

  useVideoEvents({
    videoRef,
    src,
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

  const handleVlcPositionUpdate = useCallback(
    (position: number) => {
      if (position > 0 && videoRef.current && src) {
        videoRef.current.currentTime = position;
        saveProgressNow();
      }
    },
    [saveProgressNow, src],
  );

  const isHlsStream = src?.includes('.m3u8') || src?.includes('.ts');
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const vlcFallbackRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    vlcFallbackRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [src]);

  useEffect(() => {
    if (isLoading && !loadingStartTime) {
      setLoadingStartTime(Date.now());
    } else if (!isLoading) {
      setLoadingStartTime(null);
    }
  }, [isLoading, loadingStartTime]);

  useEffect(() => {
    if (!isDesktopApp || !src || isHlsStream) return;
    if (vlcFallbackRef.current) return;

    const checkStuckLoading = () => {
      if (
        !vlcFallbackRef.current &&
        loadingStartTime &&
        Date.now() - loadingStartTime > PLAYER_CONSTANTS.VLC_STUCK_LOADING_THRESHOLD &&
        isLoading
      ) {
        vlcFallbackRef.current = true;

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        invoke<number>('open_in_vlc', {
          url: src,
          aspectRatio,
          startPosition: currentTime,
        })
          .then((position) => {
            if (position > 0 && videoRef.current) {
              videoRef.current.currentTime = position;
              saveProgressNow();
            }
            setIsLoading(false);
          })
          .catch(() => {
            vlcFallbackRef.current = false;
          });
      }
    };

    intervalRef.current = setInterval(checkStuckLoading, PLAYER_CONSTANTS.VLC_CHECK_INTERVAL);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isDesktopApp,
    isHlsStream,
    src,
    loadingStartTime,
    isLoading,
    aspectRatio,
    currentTime,
    saveProgressNow,
    setIsLoading,
  ]);

  useEffect(() => {
    if (playbackError && isDesktopApp && !isHlsStream && src && !vlcFallbackRef.current) {
      vlcFallbackRef.current = true;
      const openVlcFallback = async () => {
        try {
          const position = await invoke<number>('open_in_vlc', {
            url: src,
            aspectRatio,
            startPosition: currentTime,
          });
          if (position > 0) {
            videoRef.current!.currentTime = position;
            saveProgressNow();
          }
          setPlaybackError(null);
        } catch {
          vlcFallbackRef.current = false;
        }
      };
      openVlcFallback();
    }
  }, [
    playbackError,
    isDesktopApp,
    isHlsStream,
    src,
    aspectRatio,
    currentTime,
    saveProgressNow,
    setPlaybackError,
  ]);

  const {
    togglePlay,
    seek,
    forward,
    backward,
    toggleMute,
    setVolume,
    toggleFullscreen,
    changeRate,
    cycleAspectRatio,
  } = useVideoControls({
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
  });

  const [feedbackAction, setFeedbackAction] = useState<FeedbackAction>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((action: FeedbackAction) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedbackAction(action);
    feedbackTimerRef.current = setTimeout(
      () => setFeedbackAction(null),
      PLAYER_CONSTANTS.FEEDBACK_DURATION,
    );
  }, []);

  const togglePlayWithFeedback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    showFeedback(video.paused ? 'play' : 'pause');
    togglePlay();
  }, [togglePlay, showFeedback, videoRef]);

  const forwardWithFeedback = useCallback(
    (secs: number) => {
      showFeedback('forward');
      forward(secs);
    },
    [forward, showFeedback],
  );

  const backwardWithFeedback = useCallback(
    (secs: number) => {
      showFeedback('backward');
      backward(secs);
    },
    [backward, showFeedback],
  );

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // PiP not supported
    }
  }, [videoRef]);

  const handleProgressSeek = useCallback(
    (time: number) => {
      seek(time);
    },
    [seek],
  );

  const handlePlayNext = useCallback(() => {
    if (!hasNext || !playNext) return;
    saveEpisodeProgress();
    const wasFullscreen = isFullscreen;
    playNext();
    if (wasFullscreen) {
      setTimeout(() => {
        containerRef.current?.requestFullscreen().catch(() => {});
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
        containerRef.current?.requestFullscreen().catch(() => {});
      }, 100);
    }
  }, [hasPrev, playPrev, saveEpisodeProgress, isFullscreen]);

  useKeyboardShortcuts({
    togglePlay: togglePlayWithFeedback,
    forward: forwardWithFeedback,
    backward: backwardWithFeedback,
    changeRate,
    toggleFullscreen,
    toggleMute,
    handlePlayNext,
    handlePlayPrev,
    playbackRate,
    setVolume,
    volume,
    videoRef,
    togglePiP,
  });

  const { handleSingleClick, handleDoubleClick } = useGestureHandlers({
    togglePlay: togglePlayWithFeedback,
    toggleFullscreen,
  });

  const lastTapRef = useRef<{ time: number; x: number } | null>(null);
  const mobileTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMobileTap = useCallback(
    (e: React.TouchEvent) => {
      const now = Date.now();
      const touch = e.changedTouches[0];
      if (!touch || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const isLeftHalf = x < rect.width / 2;

      if (
        lastTapRef.current &&
        now - lastTapRef.current.time < PLAYER_CONSTANTS.DOUBLE_TAP_THRESHOLD
      ) {
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
        lastTapRef.current = { time: now, x };
        mobileTapTimerRef.current = setTimeout(() => {
          const video = videoRef.current;
          if (video) {
            if (video.paused) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
          lastTapRef.current = null;
          mobileTapTimerRef.current = null;
        }, PLAYER_CONSTANTS.DOUBLE_TAP_THRESHOLD);
      }
    },
    [containerRef, videoRef, backwardWithFeedback, forwardWithFeedback],
  );

  useEffect(() => {
    setPlaybackError(null);
    const video = videoRef.current;
    if (!video) return;

    if (movieId) {
      const movieItem = movies.find((item) => item.id.toString() === movieId);
      if (movieItem) {
        const onLoaded = () => {
          video.currentTime = movieItem.position;
        };
        video.addEventListener('loadedmetadata', onLoaded, { once: true });
      }
    } else if (serieId) {
      const episodeProgress = getEpisodeProgress(
        parseInt(serieId || '0'),
        episodeNumber || 0,
        seasonId || 0,
      );
      if (episodeProgress) {
        const onLoaded = () => {
          video.currentTime = episodeProgress.position;
        };
        video.addEventListener('loadedmetadata', onLoaded, { once: true });
      }
    }
  }, [
    src,
    movieId,
    serieId,
    episodeNumber,
    seasonId,
    movies,
    getEpisodeProgress,
    setPlaybackError,
  ]);

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
        className={`relative flex aspect-video max-h-full w-full touch-none select-none ${!showControls ? 'cursor-none' : ''} ${className || ''}`}
        data-isfullscreen={String(isFullscreen)}
        data-aspect-ratio={aspectRatio}
        onMouseMove={resetHideTimer}
        onMouseLeave={() => {
          if (!paused) setShowControls(false);
        }}
        onTouchEnd={handleMobileTap}
      >
        <VideoElement
          videoRef={videoRef}
          poster={poster}
          isMuted={isMuted}
          loop={loop}
          onEnded={handlePlayNext}
          onClick={handleSingleClick}
          onDoubleClick={handleDoubleClick}
        />

        <PlayerLoader isLoading={isLoading} paused={paused} />

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
          src={src}
          isDesktopApp={isDesktopApp}
          isHlsStream={isHlsStream}
          qualityLevels={qualityLevels}
          currentQuality={currentQuality}
          onQualityChange={setQuality}
          onPauseVideo={() => videoRef.current?.pause()}
          onVlcPositionUpdate={handleVlcPositionUpdate}
        />
      </div>
    </>
  );
}
