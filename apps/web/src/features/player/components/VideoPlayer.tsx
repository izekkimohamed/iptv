'use client';

import '@vidstack/react/player/styles/default/layouts/video.css';
import '@vidstack/react/player/styles/default/theme.css';

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { AlertTriangle, Pause, Play } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { usePlayer } from '@/features/player/hooks/player';
import { cn } from '@/lib/utils';
import {
  usePlayerStore,
  usePlaylistStore,
  useWatchedMoviesStore,
  useWatchedSeriesStore,
} from '@repo/store';

import { getVideoType } from '@repo/utils';
import { CustomControls } from './CustomControls';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  episodeNumber?: number;
  totalEpisodes: number;
  seasonId?: number;
  movieId: string | null;
  serieId: string | null;
  categoryId: string | null;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
  playNext?: () => void;
  playPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export type AspectRatio = '16:9' | '4:3' | '1:1';
const ASPECT_RATIOS: AspectRatio[] = ['16:9', '4:3', '1:1'];

type PlayerError = {
  message: string;
  code: number;
  error?: Error;
} | null;

export function VideoPlayer({
  autoPlay = true,
  loop = false,
  onEnded,
  onTimeUpdate,
  src,
  poster,
  title,
  episodeNumber,
  totalEpisodes,
  seasonId,
  movieId,
  serieId,
  categoryId,
  playNext,
  playPrev,
  hasNext,
  hasPrev,
}: VideoPlayerProps) {
  const mediaType = usePathname();
  const player = usePlayer();
  const { selectedPlaylist } = usePlaylistStore();
  const {
    volume,
    isMuted,
    setMutated,
    setVolume,
    fullScreen,
    toggleFullScreen,
    preferredRate,
    preferredAspectRatio,
    setPreferredRate,
    setPreferredAspectRatio,
  } = usePlayerStore();
  const { movies, saveProgress, removeItem } = useWatchedMoviesStore();
  const { saveProgress: saveProgressSeries, getEpisodeProgress } = useWatchedSeriesStore();

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(preferredAspectRatio);
  const [playbackError, setPlaybackError] = useState<PlayerError>(null);

  const saveProgressRef = useRef<() => void>(() => {});

  const videoType = getVideoType(src);

  const saveMovieProgress = useCallback(() => {
    if (!player.playerRef.current) return;

    const currentTime = player.playerRef.current.currentTime;
    const duration = player.playerRef.current.duration;
    const movieItem = movies.find((item) => item.id.toString() === movieId);

    if (duration > 0 && currentTime >= duration - 5 && movieItem) {
      removeItem(movieItem.id, selectedPlaylist?.id || 0);
      return;
    }

    if (duration <= 0 || currentTime <= 0) return;

    saveProgress({
      id: parseInt(movieId || '0'),
      categoryId: parseInt(categoryId || '0'),
      position: Math.max(0, currentTime - 10),
      duration,
      poster,
      title,
      src,
      playlistId: selectedPlaylist?.id || 0,
    });
  }, [
    movieId,
    categoryId,
    poster,
    title,
    src,
    selectedPlaylist?.id,
    movies,
    saveProgress,
    removeItem,
  ]);

  const saveEpisodeProgress = useCallback(() => {
    if (!player.playerRef.current) return;

    const currentTime = player.playerRef.current.currentTime;
    const duration = player.playerRef.current.duration;
    const episodeNum = episodeNumber || 0;
    const seriesIdNum = parseInt(serieId || '0');

    if (duration <= 0 || currentTime <= 0 || !seriesIdNum) return;

    saveProgressSeries(
      {
        id: seriesIdNum,
        categoryId: parseInt(categoryId || '0'),
        poster,
        title,
        totalEpisodes,
        playlistId: selectedPlaylist?.id || 0,
      },
      {
        episodeNumber: episodeNum,
        seasonId: seasonId || 0,
        position: Math.max(0, currentTime - 10),
        duration,
        src,
      },
    );
  }, [
    episodeNumber,
    seasonId,
    serieId,
    categoryId,
    poster,
    title,
    totalEpisodes,
    selectedPlaylist?.id,
    saveProgressSeries,
    src,
  ]);

  useEffect(() => {
    if (mediaType === '/movies' || mediaType === '/movies/movie') {
      saveProgressRef.current = saveMovieProgress;
    } else if (mediaType === '/series' || mediaType === '/series/serie') {
      saveProgressRef.current = saveEpisodeProgress;
    }
  }, [mediaType, saveMovieProgress, saveEpisodeProgress]);

  const handlePlayNext = useCallback(() => {
    if (!hasNext || !playNext) return;
    saveEpisodeProgress();
    // Store current fullscreen state before navigating
    const wasFullscreen = player.isFullscreen;
    playNext();
    // Re-enter fullscreen after navigation
    setTimeout(() => {
      if (wasFullscreen && player.playerRef.current) {
        player.playerRef.current.enterFullscreen();
      }
    }, 100);
  }, [hasNext, playNext, saveEpisodeProgress, player]);

  const handlePlayPrev = useCallback(() => {
    if (!hasPrev || !playPrev) return;
    saveEpisodeProgress();
    // Store current fullscreen state before navigating
    const wasFullscreen = player.isFullscreen;
    playPrev();
    // Re-enter fullscreen after navigation
    setTimeout(() => {
      if (wasFullscreen && player.playerRef.current) {
        player.playerRef.current.enterFullscreen();
      }
    }, 100);
  }, [hasPrev, playPrev, saveEpisodeProgress, player]);

  useEffect(() => {
    setPlaybackError(null);

    if (mediaType === '/movies' || mediaType === '/movies/movie') {
      const movieItem = movies.find((item) => item.id.toString() === movieId);
      if (movieItem && player.playerRef.current) {
        player.playerRef.current.currentTime = movieItem.position;
      }
    } else if (mediaType === '/series' || mediaType === '/series/serie') {
      const episodeProgress = getEpisodeProgress(
        parseInt(serieId || '0'),
        episodeNumber || 0,
        seasonId || 0,
      );

      if (episodeProgress && player.playerRef.current) {
        player.playerRef.current.currentTime = episodeProgress.position;
      }
    }
  }, [src, movieId, serieId, episodeNumber, seasonId, mediaType, movies, getEpisodeProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (player.isPlaying) {
        saveProgressRef.current();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      saveProgressRef.current();
    };
  }, []);

  useEffect(() => {
    if (mediaType === '/series' || mediaType === '/series/serie') {
      const handleEnded = () => {
        saveEpisodeProgress();
        onEnded?.();
      };

      const playerElement = player.playerRef.current;
      if (playerElement) {
        playerElement.addEventListener('ended', handleEnded);
        return () => {
          playerElement.removeEventListener('ended', handleEnded);
        };
      }
    }
  }, [mediaType, saveEpisodeProgress, onEnded]);

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(player.currentTime);
    }
  }, [player.currentTime, onTimeUpdate]);

  // Removed conflicting fullscreen sync effect that caused crashes on exit
  // We now rely on native Vidstack events and player.toggleFullscreen()

  useEffect(() => {
    // Apply persisted playback rate on mount
    player.setPlaybackRate(preferredRate);
  }, [preferredRate, player]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        player.togglePlay();
      }
      if (e.key === 'm' || e.key === 'M') {
        player.toggleMute();
      }
      if (e.key === 'f' || e.key === 'F') {
        player.toggleFullscreen();
      }
      if (e.key === 'p' || e.key === 'P') {
        player.togglePiP();
      }
      if (e.key === '+' || e.key === '=') {
        player.setPlaybackRate(player.playbackRate + 0.25);
      }
      if (e.key === '-' || e.key === '_') {
        player.setPlaybackRate(player.playbackRate - 0.25);
      }
      if (e.key === 'ArrowRight') {
        player.forward(5);
      }
      if (e.key === 'ArrowLeft') {
        player.backward(5);
      }
      if (e.key === 'n' || e.key === 'N') {
        handlePlayNext();
      }
      if (e.key === 'b' || e.key === 'B') {
        handlePlayPrev();
      }
      return;
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePlayNext, handlePlayPrev, player]);

  if (!src) {
    return null;
  }

  if (playbackError) {
    let errorMessage = 'An unknown playback error occurred.';
    let detailedMessage = '';

    if (playbackError.code === 1 && playbackError.message.includes('405')) {
      errorMessage = 'Video Source Error: Access Denied (405).';
      detailedMessage =
        'The server rejected the request to load the video. This often means the stream link is invalid or expired. Try selecting a different source.';
    } else if (playbackError.code === 2) {
      errorMessage = 'Network Error.';
      detailedMessage =
        'Could not load the media due to a network issue. Please check your connection.';
    } else if (playbackError.message) {
      errorMessage = `Playback Error: ${playbackError.message.split(': ')[0]}`;
      detailedMessage = 'A problem occurred while decoding or loading the media.';
    }

    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-white/10 bg-card/50 p-8 backdrop-blur-xl">
        <AlertTriangle className="mb-4 h-16 w-16 text-destructive" />
        <h2 className="mb-2 text-xl font-bold text-white">{errorMessage}</h2>
        <p className="mb-6 max-w-lg text-center text-gray-400">{detailedMessage}</p>
        <Button
          onClick={() => setPlaybackError(null)}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-white transition-all hover:bg-white/20"
        >
          <Play className="h-4 w-4 fill-current" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MediaPlayer
        key={src}
        ref={player.playerRef}
        src={src}
        poster={poster}
        volume={volume}
        onVolumeChange={(details) => {
          setVolume(details.volume);
          setMutated(details.muted);
        }}
        title={title}
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        playsInline={true}
        onTimeUpdate={player.onTimeUpdate}
        onDurationChange={player.onDurationChange}
        onPlay={player.onPlay}
        onPause={player.onPause}
        onWaiting={() => player.onLoading(true)}
        onSeeking={() => player.onLoading(true)}
        onCanPlay={() => player.onLoading(false)}
        onEnded={() => {
          player.onPause();
          onEnded?.();
        }}
        onFullscreenChange={(isFullscreen) => {
          toggleFullScreen(isFullscreen);
          player.onFullscreenChange(isFullscreen);
        }}
        onProgress={player.onProgress}
        onRateChange={(playbackRate) => {
          player.onPlaybackRateChange(playbackRate);
          setPreferredRate(playbackRate);
        }}
        onPictureInPictureChange={(isPiP) => {
          player.onPiPChange(isPiP);
        }}
        onEnd={() => {
          if (hasNext && playNext) {
            handlePlayNext();
          }
        }}
        onError={(_, errorDetails) => {
          setPlaybackError({
            message: errorDetails.detail.message,
            code: errorDetails.detail.code || 0,
            error: errorDetails.detail.error,
          });
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          player.toggleFullscreen();
        }}
        onClick={() => player.togglePlay()}
        className={cn('relative h-full w-full overflow-hidden bg-black')}
        data-isfullscreen={player.isFullscreen}
        data-aspect-ratio={aspectRatio}
      >
        <MediaProvider>
          <source src={src} type={videoType} />
        </MediaProvider>


        {player.isLoading && !player.isPaused && !player.isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="large" message="Loading..." />
          </div>
        )}
        {player.playerRef.current?.paused && (
          <div className="pointer-events-none absolute inset-0 flex w-full items-center justify-center bg-linear-to-t from-black/80 via-transparent to-black/80">
            <div className="rounded-full bg-primary/20 p-5 backdrop-blur-sm border border-primary/20">
              <Pause className="h-10 w-10 fill-white text-white" />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 w-full" onClick={(e) => e.stopPropagation()}>
          <CustomControls
            currentTime={player.currentTime}
            duration={player.duration || 0}
            isPlaying={player.isPlaying}
            isFullscreen={player.isFullscreen}
            buffered={player.buffered}
            volume={volume}
            isMuted={isMuted}
            playbackRate={player.playbackRate}
            onPlayPause={player.togglePlay}
            onSeek={player.seek}
            onVolumeChange={setVolume}
            onToggleMute={player.toggleMute}
            onToggleFullscreen={player.toggleFullscreen}
            onNext={handlePlayNext}
            onPrev={handlePlayPrev}
            hasNext={hasNext}
            hasPrev={hasPrev}
            title={title || ''}
            onToggleAspectRatio={() => {
              const currentIndex = ASPECT_RATIOS.indexOf(aspectRatio);
              const nextIndex = (currentIndex + 1) % ASPECT_RATIOS.length;
              const next = ASPECT_RATIOS[nextIndex];
              setAspectRatio(next);
              setPreferredAspectRatio(next);
            }}
            onRateIncrease={() => {
              const next = player.playbackRate + 0.25;
              player.setPlaybackRate(next);
              setPreferredRate(next);
            }}
            onRateDecrease={() => {
              const next = player.playbackRate - 0.25;
              player.setPlaybackRate(next);
              setPreferredRate(next);
            }}
            onTogglePiP={player.togglePiP}
            aspectRatio={aspectRatio}
          />
        </div>
      </MediaPlayer>
    </div>
  );
}

export default VideoPlayer;
