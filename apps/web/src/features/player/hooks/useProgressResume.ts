import { useEffect } from 'react';

import { useProgressTracking } from './useProgressTracking';

interface UseProgressResumeOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  src?: string;
  movieId?: string;
  serieId?: string;
  episodeNumber?: number;
  seasonId?: number;
  setPlaybackError: (error: { message: string; code: number } | null) => void;
}

export function useProgressResume({
  videoRef,
  src,
  movieId,
  serieId,
  episodeNumber,
  seasonId,
  setPlaybackError,
}: UseProgressResumeOptions) {
  const { movies, getEpisodeProgress } = useProgressTracking({
    videoRef,
    isPlaying: false,
    src: '',
    movieId: undefined,
    serieId: undefined,
    categoryId: undefined,
    poster: undefined,
    title: undefined,
    episodeNumber: undefined,
    seasonId: undefined,
    totalEpisodes: undefined,
  });

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
    videoRef,
  ]);
}
