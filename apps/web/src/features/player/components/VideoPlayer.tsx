import { usePlayerStore } from '@repo/store';
import { useCallback, useRef } from 'react';

import { CustomControls } from './CustomControls';
import { PlayerErrorState } from './PlayerErrorState';
import { PlayerPausedOverlay, PlayerSpinner } from './PlayerOverlays';
import { SeekFeedback } from './SeekFeedback';

import { useTauri } from '@/shared/hooks/useTauri';
import { useControlsVisibility } from '../hooks/useControlsVisibility';
import { useEpisodeNavigation } from '../hooks/useEpisodeNavigation';
import { useFeedback } from '../hooks/useFeedback';
import { useGestureHandlers } from '../hooks/useGestureHandlers';
import { useHls } from '../hooks/useHls';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useMobileTap } from '../hooks/useMobileTap';
import { useProgressHandlers } from '../hooks/useProgressHandlers';
import { useProgressResume } from '../hooks/useProgressResume';
import { useProgressTracking } from '../hooks/useProgressTracking';
import { useVideoControls } from '../hooks/useVideoControls';
import { useVideoEvents } from '../hooks/useVideoEvents';
import { AspectRatio, useVideoState } from '../hooks/useVideoState';
import { useVlcFallback } from '../hooks/useVlcFallback';
import { useVolumeHandlers } from '../hooks/useVolumeHandlers';
import { useVolumeSync } from '../hooks/useVolumeSync';

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

function PlayerLoader({ isLoading, paused }: { isLoading: boolean; paused: boolean }) {
  if (isLoading && !paused) return <PlayerSpinner />;
  if (paused && !isLoading) return <PlayerPausedOverlay />;
  return null;
}

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

  const isHlsStream = src?.includes('.m3u8') || src?.includes('.ts');

  const { vlcStatus, handleOpenInVlc, handleVlcPositionUpdate } = useVlcFallback({
    src,
    isDesktopApp,
    isHlsStream,
    isLoading,
    playbackError,
    currentTime,
    aspectRatio,
    setIsLoading,
    setPlaybackError,
    saveProgressNow,
    videoRef,
  });

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

  const { feedbackAction, togglePlayWithFeedback, forwardWithFeedback, backwardWithFeedback } =
    useFeedback({ togglePlay, forward, backward });

  const { handlePlayNext, handlePlayPrev } = useEpisodeNavigation({
    hasNext,
    hasPrev,
    playNext,
    playPrev,
    saveEpisodeProgress,
    isFullscreen,
    containerRef,
  });

  const { handleProgressClick } = useProgressHandlers({ duration, seek });
  const { handleVolumeClick, startVolumeDrag } = useVolumeHandlers({
    setVolume,
    setShowVolume,
  });
  const { handleMobileTap } = useMobileTap({ containerRef, videoRef, backward, forward });

  useProgressResume({
    videoRef,
    src,
    movieId,
    serieId,
    episodeNumber,
    seasonId,
    setPlaybackError,
  });

  useVolumeSync({ videoRef, setVolumeState, setIsMuted });

  useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = preferredRate;
    setPlaybackRateState(preferredRate);
  }, [preferredRate, setPlaybackRateState]);

  useCallback(() => {
    onTimeUpdate?.(currentTime);
  }, [currentTime, onTimeUpdate]);

  useCallback(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [setIsFullscreen]);

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
    togglePiP: undefined,
    handleOpenInVlc: undefined,
  });

  const { handleSingleClick, handleDoubleClick } = useGestureHandlers({
    togglePlay: togglePlayWithFeedback,
    toggleFullscreen,
  });

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
          displayVolume={isMuted ? 0 : volume}
          aspectRatio={aspectRatio}
          showSettings={showSettings}
          playbackRate={playbackRate}
          isFullscreen={isFullscreen}
          progressRef={progressRef}
          volumeBarRef={volumeBarRef}
          handleSingleClick={handleSingleClick}
          handleDoubleClick={handleDoubleClick}
          handleProgressClick={handleProgressClick}
          handleProgressSeek={seek}
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
          togglePiP={undefined}
          src={src}
          isDesktopApp={isDesktopApp}
          isHlsStream={isHlsStream}
          qualityLevels={qualityLevels}
          currentQuality={currentQuality}
          onQualityChange={setQuality}
          onPauseVideo={() => videoRef.current?.pause()}
          onOpenInVlc={handleOpenInVlc}
          onVlcPositionUpdate={handleVlcPositionUpdate}
          vlcStatus={vlcStatus}
        />
      </div>
    </>
  );
}
