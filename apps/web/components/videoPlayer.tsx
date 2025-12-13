'use client';

import { usePlayer } from '@/hooks/usePlayer';
import { cn, getVideoType } from '@/lib/utils';
import { usePlaylistStore } from '@/store/appStore';
import { usePlayerStore } from '@/store/player-store';
import { useWatchedMoviesStore, useWatchedSeriesStore } from '@/store/watchedStore';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import '@vidstack/react/player/styles/default/layouts/video.css';
import '@vidstack/react/player/styles/default/theme.css';
import { AlertTriangle, Pause, Play } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CustomControls } from './CustomControls';
import LoadingSpinner from './ui/LoadingSpinner';
import { Button } from './ui/button';

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
  playNextEpisode?: () => void;
  playPrevEpisode?: () => void;
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
  playNextEpisode,
  playPrevEpisode,
  hasNext,
  hasPrev,
}: VideoPlayerProps) {
  const mediaType = usePathname();
  const player = usePlayer();
  const { selectedPlaylist } = usePlaylistStore();
  const { volume, isMuted, setMutated, setVolume, fullScreen, toggleFullScreen } = usePlayerStore();
  const { movies, saveProgress, removeItem } = useWatchedMoviesStore();
  const { saveProgress: saveProgressSeries, getEpisodeProgress } = useWatchedSeriesStore();

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [playbackError, setPlaybackError] = useState<PlayerError>(null);

  // Refs to track current values for cleanup
  const saveProgressRef = useRef<() => void>(() => {});

  const videoType = getVideoType(src);

  // Save movie progress
  const saveMovieProgress = useCallback(() => {
    if (!player.playerRef.current) return;

    const currentTime = player.playerRef.current.currentTime;
    const duration = player.playerRef.current.duration;
    const movieItem = movies.find((item) => item.id.toString() === movieId);

    // Remove from continue watching if finished (within last 5 seconds)
    if (duration > 0 && currentTime >= duration - 5 && movieItem) {
      removeItem(movieItem.id, selectedPlaylist?.id || 0);
      return;
    }

    // Don't save if invalid duration
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

  // Save series episode progress
  const saveEpisodeProgress = useCallback(() => {
    if (!player.playerRef.current) return;

    const currentTime = player.playerRef.current.currentTime;
    const duration = player.playerRef.current.duration;
    const episodeNum = episodeNumber || 0;
    const seriesIdNum = parseInt(serieId || '0');

    // Don't save if invalid data
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

  // Update ref whenever save functions change
  useEffect(() => {
    if (mediaType === '/movies' || mediaType === '/movies/movie') {
      saveProgressRef.current = saveMovieProgress;
    } else if (mediaType === '/series' || mediaType === '/series/serie') {
      saveProgressRef.current = saveEpisodeProgress;
    }
  }, [mediaType, saveMovieProgress, saveEpisodeProgress]);

  // Handle play next with progress save
  const handlePlayNext = useCallback(() => {
    if (!hasNext || !playNextEpisode) return;
    saveEpisodeProgress();
    playNextEpisode();
  }, [hasNext, playNextEpisode, saveEpisodeProgress]);

  // Handle play previous with progress save
  const handlePlayPrev = useCallback(() => {
    if (!hasPrev || !playPrevEpisode) return;
    saveEpisodeProgress();
    playPrevEpisode();
  }, [hasPrev, playPrevEpisode, saveEpisodeProgress]);

  // Initialize player position on mount/src change
  useEffect(() => {
    setPlaybackError(null);

    if (mediaType === '/movies' || mediaType === '/movies/movie') {
      // Load saved movie progress
      const movieItem = movies.find((item) => item.id.toString() === movieId);
      if (movieItem && player.playerRef.current) {
        player.playerRef.current.currentTime = movieItem.position;
      }
    } else if (mediaType === '/series' || mediaType === '/series/serie') {
      // Load saved episode progress
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

  // Save progress on unmount and every 30 seconds during playback
  useEffect(() => {
    // Save every 30 seconds while playing
    const interval = setInterval(() => {
      if (player.isPlaying) {
        saveProgressRef.current();
      }
    }, 30000); // 30 seconds

    // Save on unmount
    return () => {
      clearInterval(interval);
      // Ensure progress is saved when component unmounts
      saveProgressRef.current();
    };
  }, []);

  // Also save when video ends
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

  // Handle time updates
  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(player.currentTime);
    }
  }, [player.currentTime, onTimeUpdate]);

  // Handle fullscreen changes
  useEffect(() => {
    if (fullScreen === true) {
      player.playerRef.current?.enterFullscreen();
    } else {
      player.playerRef.current?.exitFullscreen();
    }
  }, [fullScreen, player.playerRef]);

  //add key event listner "SHIFT + n" to play next episode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      //check if the media type is series
      if (mediaType !== '/series' && mediaType !== '/series/serie') {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        handlePlayNext();
      }
      if (e.key === 'b' || e.key === 'B') {
        handlePlayPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePlayNext]);

  if (!src) {
    return null;
  }

  // Error UI
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
      <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 rounded-lg p-8">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">{errorMessage}</h2>
        <p className="text-gray-400 text-center max-w-lg mb-6">{detailedMessage}</p>
        <Button
          onClick={() => setPlaybackError(null)}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
        >
          <Play className="w-4 h-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
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
        onEnded={onEnded}
        onFullscreenChange={(details) => {
          toggleFullScreen(details);
        }}
        onEnd={() => {
          if (hasNext && playNextEpisode) {
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
        onDoubleClick={() => toggleFullScreen(!fullScreen)}
        onClick={() => player.togglePlay()}
        className={cn(
          'w-full h-full overflow-hidden bg-black relative',
          player.isPlaying && fullScreen && 'cursor-none',
        )}
        data-isfullscreen={fullScreen}
        data-aspect-ratio={aspectRatio}
        data-is-paused={player.playerRef.current?.addEventListener('', () => {})}
      >
        <MediaProvider>
          <source src={src} type={videoType} />
        </MediaProvider>

        {!player.isPlaying && !player.isLoading && (
          <div className="absolute pointer-events-none flex items-center justify-center inset-0 w-full bg-gradient-to-t from-black/80 via-transparent to-black/80">
            <div className="p-5 rounded-full bg-amber-400/20 backdrop-blur-sm">
              <Pause className="w-10 h-10 text-white fill-white" />
            </div>
          </div>
        )}

        {player.isLoading && !player.isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="large" message="Loading..." />
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
              setAspectRatio(ASPECT_RATIOS[nextIndex]);
            }}
            aspectRatio={aspectRatio}
          />
        </div>
      </MediaPlayer>
    </div>
  );
}

export default VideoPlayer;
