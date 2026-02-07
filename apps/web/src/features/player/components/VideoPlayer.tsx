'use client';

import '@vidstack/react/player/styles/default/layouts/video.css';
import '@vidstack/react/player/styles/default/theme.css';

import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

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
import { FeedbackAction, SeekFeedback } from './SeekFeedback';

// ... interface VideoPlayerProps (same as before) ...
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
  const player = usePlayer(); // Uses the new Hook
  const { selectedPlaylist } = usePlaylistStore();

  // Zustand Stores
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

  // New State for Visual Feedback
  const [feedbackAction, setFeedbackAction] = useState<FeedbackAction>(null);
  const feedbackTimeout = useRef<NodeJS.Timeout | null>(null);

  const triggerFeedback = useCallback((action: FeedbackAction) => {
    setFeedbackAction(action);
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = setTimeout(() => setFeedbackAction(null), 600);
  }, []);

  // Clear error state when source changes
  useEffect(() => {
    setPlaybackError(null);
  }, [src]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  const videoType = getVideoType(src);

  // --- Logic: Saving Progress (Same as your original, kept concise here) ---
  const saveProgressRef = useRef<() => void>(() => {});

  const saveMovieProgress = useCallback(() => {
    if (!player.instance) return; // Note: using .instance now
    const currentTime = player.currentTime;
    const duration = player.duration;
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
    player.instance,
    player.currentTime,
    player.duration,
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

  // ... saveEpisodeProgress similar implementation using player.instance ...

  useEffect(() => {
    if (mediaType === '/movies' || mediaType === '/movies/movie') {
      saveProgressRef.current = saveMovieProgress;
    }
    // ... else logic
  }, [mediaType, saveMovieProgress]); // simplified deps

  // --- Handlers ---

  const handlePlayNext = useCallback(() => {
    if (!hasNext || !playNext) return;
    saveProgressRef.current(); // Use ref to call correct save fn
    const wasFullscreen = player.instance?.state.fullscreen ?? fullScreen;
    playNext();
    setTimeout(() => {
      if (wasFullscreen && player.instance) player.instance.enterFullscreen();
    }, 100);
  }, [hasNext, playNext, fullScreen, player.instance]);

  const handlePlayPrev = useCallback(() => {
    if (!hasPrev || !playPrev) return;
    saveProgressRef.current();
    const wasFullscreen = player.instance?.state.fullscreen ?? fullScreen;
    playPrev();
    setTimeout(() => {
      if (wasFullscreen && player.instance) player.instance.enterFullscreen();
    }, 100);
  }, [hasPrev, playPrev, fullScreen, player.instance]);

  // --- Effects ---

  useEffect(() => {
    // Restore Position
    if (!player.instance) return;

    // logic to restore position from store
    // (Ensure you check player.canPlay before seeking ideally, or rely on Vidstack internal behavior)
    if (mediaType.includes('movie')) {
      const item = movies.find((m) => m.id.toString() === movieId);
      if (item) player.instance.currentTime = item.position;
    }
    // ... series logic
  }, [src, player.instance, movieId, mediaType, movies]); // simplified

  // Keyboard Controls with Visual Feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          player.togglePlay();
          triggerFeedback(player.isPlaying ? 'pause' : 'play');
          break;
        case 'ArrowRight':
          player.forward(5);
          triggerFeedback('forward');
          break;
        case 'ArrowLeft':
          player.backward(5);
          triggerFeedback('backward');
          break;
        case 'f':
        case 'F':
          player.toggleFullscreen();
          break;
        case 'm':
        case 'M':
          player.toggleMute();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, triggerFeedback]);

  if (!src) return null;

  if (playbackError) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-black">
        <div className="space-y-4 text-center">
          <div className="text-lg font-semibold text-red-500">Playback Error</div>
          <p className="max-w-md text-gray-300">{playbackError.message}</p>
          <div className="text-sm text-gray-400">Error Code: {playbackError.code}</div>
          <button
            onClick={() => setPlaybackError(null)}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group/video relative h-full w-full bg-black">
      <MediaPlayer
        key={src}
        ref={player.playerRef} // Pass callback ref
        src={src}
        poster={poster}
        volume={volume}
        onVolumeChange={(detail) => {
          setVolume(detail.volume);
          setMutated(detail.muted);
        }}
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        playsInline
        onEnded={onEnded}
        onFullscreenChange={toggleFullScreen}
        onEnd={() => {
          if (hasNext) handlePlayNext();
        }}
        onError={(_, details) =>
          setPlaybackError({
            message: details.detail.message,
            code: details.detail.code ?? 0,
            error: details.detail.error,
          })
        }
        className={cn('relative h-full w-full overflow-hidden')}
        data-aspect-ratio={aspectRatio}
        // Double click to toggle fullscreen
        onDoubleClick={(e) => {
          // Prevent double click if target is controls
          if (!(e.target as HTMLElement).closest('.controls-layer')) {
            player.toggleFullscreen();
          }
        }}
        // Click to toggle play (optional, Netflix style)
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('.controls-layer')) {
            player.togglePlay();
            triggerFeedback(player.isPlaying ? 'pause' : 'play');
          }
        }}
      >
        <MediaProvider>
          <source src={src} type={videoType} />
        </MediaProvider>

        {/* Visual Feedback Overlay */}
        <SeekFeedback action={feedbackAction} />

        {/* Big Play Button (Initial State) */}
        {!player.isPlaying && !player.isLoading && player.currentTime === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
            {/* Icon */}
          </div>
        )}

        {/* Loading Spinner */}
        {player.isLoading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <LoadingSpinner size="large" message="Buffering..." />
          </div>
        )}

        {/* Controls */}
        <div
          className="controls-layer absolute bottom-0 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <CustomControls
            currentTime={player.currentTime}
            duration={player.duration}
            isPlaying={player.isPlaying}
            isFullscreen={player.isFullscreen}
            buffered={player.buffered}
            volume={volume}
            isMuted={isMuted}
            playbackRate={player.playbackRate}
            aspectRatio={aspectRatio}
            title={title || ''}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onPlayPause={() => {
              player.togglePlay();
              // No visual feedback needed for button clicks usually, but optional
            }}
            onSeek={player.seek}
            onVolumeChange={player.setVolume}
            onToggleMute={player.toggleMute}
            onToggleFullscreen={player.toggleFullscreen}
            onNext={handlePlayNext}
            onPrev={handlePlayPrev}
            onTogglePiP={player.togglePiP}
            onToggleAspectRatio={() => {
              const next =
                ASPECT_RATIOS[(ASPECT_RATIOS.indexOf(aspectRatio) + 1) % ASPECT_RATIOS.length];
              setAspectRatio(next);
              setPreferredAspectRatio(next);
            }}
            onRateIncrease={() => {
              const next = Math.min(2, player.playbackRate + 0.25);
              player.setPlaybackRate(next);
            }}
            onRateDecrease={() => {
              const next = Math.max(0.5, player.playbackRate - 0.25);
              player.setPlaybackRate(next);
            }}
          />
        </div>
      </MediaPlayer>
    </div>
  );
}

export default VideoPlayer;
