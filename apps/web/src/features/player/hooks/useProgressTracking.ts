import { usePlaylistStore, useWatchedMoviesStore, useWatchedSeriesStore } from '@repo/store';
import { usePathname } from 'next/navigation';
import { RefObject, useCallback, useEffect, useRef } from 'react';

interface UseProgressTrackingProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  src: string;
  movieId?: string;
  serieId?: string;
  categoryId?: string;
  poster?: string;
  title?: string;
  episodeNumber?: number;
  seasonId?: number;
  totalEpisodes?: number;
}

export function useProgressTracking({
  videoRef,
  isPlaying,
  src,
  movieId,
  serieId,
  categoryId,
  poster,
  title,
  episodeNumber,
  seasonId,
  totalEpisodes,
}: UseProgressTrackingProps) {
  const mediaType = usePathname();
  const { selectedPlaylist } = usePlaylistStore();
  const { movies, saveProgress, removeItem } = useWatchedMoviesStore();
  const { saveProgress: saveProgressSeries, getEpisodeProgress } = useWatchedSeriesStore();

  const saveProgressRef = useRef<() => void>(() => {});

  const saveMovieProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    let currentTime = video.currentTime || 0;
    let dur = video.duration || 0;
    const movieIdNum = parseInt(movieId || '0');
    if (!movieIdNum) return;

    const movieItem = movies.find((item) => item.id === movieIdNum);

    // If duration not yet loaded but we have an existing save, try to keep it
    if ((!dur || currentTime === 0) && movieItem) {
      currentTime = movieItem.position;
      if (!dur) dur = movieItem.duration || 0;
    }

    if (dur > 0 && currentTime >= dur - 5 && movieItem) {
      removeItem(movieItem.id, selectedPlaylist?.id || 0);
      return;
    }

    saveProgress({
      id: movieIdNum,
      categoryId: parseInt(categoryId || '0'),
      position: Math.max(0, currentTime - 10),
      duration: dur,
      poster,
      title,
      src,
      playlistId: selectedPlaylist?.id || 0,
    });
  }, [
    movieId, categoryId, poster, title, src, selectedPlaylist?.id,
    movies, saveProgress, removeItem, videoRef
  ]);

  const saveEpisodeProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    let currentTime = video.currentTime || 0;
    let dur = video.duration || 0;
    const episodeNum = episodeNumber || 0;
    const seriesIdNum = parseInt(serieId || '0');

    if (!seriesIdNum) return;

    // If duration not yet loaded but we have an existing save, try to keep it
    const existingProgress = getEpisodeProgress(seriesIdNum, episodeNum, seasonId || 0);
    if ((!dur || currentTime === 0) && existingProgress) {
      currentTime = existingProgress.position;
      if (!dur) dur = existingProgress.duration || 0;
    }

    saveProgressSeries(
      {
        id: seriesIdNum,
        categoryId: parseInt(categoryId || '0'),
        poster,
        title,
        totalEpisodes: totalEpisodes || 0,
        playlistId: selectedPlaylist?.id || 0,
      },
      {
        episodeNumber: episodeNum,
        seasonId: seasonId || 0,
        position: Math.max(0, currentTime - 10),
        duration: dur,
        src,
      },
    );
  }, [
    episodeNumber, seasonId, serieId, categoryId, poster, title,
    totalEpisodes, selectedPlaylist?.id, saveProgressSeries, src, videoRef
  ]);

  useEffect(() => {
    try {
      if (mediaType?.startsWith?.('/movies')) {
        saveProgressRef.current = saveMovieProgress;
      } else if (mediaType?.startsWith?.('/series')) {
        saveProgressRef.current = saveEpisodeProgress;
      } else {
        saveProgressRef.current = () => {};
      }
    } catch (err) {
      saveProgressRef.current = () => {};
    }
  }, [mediaType, saveMovieProgress, saveEpisodeProgress]);

  // Initial save on component mount / src change
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        saveProgressRef.current();
      } catch (e) {}
    }, 500); // Wait a bit for props/store to settle

    return () => clearTimeout(timer);
  }, [src, movieId, serieId, episodeNumber]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isPlaying) {
      interval = setInterval(() => {
        try {
          saveProgressRef.current();
        } catch (e) {}
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
      try {
        saveProgressRef.current();
      } catch (e) {}
    };
  }, [isPlaying]);

  const saveProgressNow = useCallback(() => {
    try {
      saveProgressRef.current();
    } catch (e) {}
  }, []);

  return { saveEpisodeProgress, saveMovieProgress, getEpisodeProgress, movies, saveProgressNow };
}
