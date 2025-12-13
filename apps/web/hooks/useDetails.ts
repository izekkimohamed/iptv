import { Episode } from '@/lib/types';
import { useCallback, useMemo, useState } from 'react';

export const useMoviePlayback = (initialPlay: boolean) => {
  const [playing, setPlaying] = useState<boolean>(initialPlay);

  const handlePlayMovie = useCallback<() => void>(() => {
    setPlaying(true);
  }, []);

  const handleCloseMovie = useCallback<() => void>(() => {
    setPlaying(false);
  }, []);

  return { playing, setPlaying, handlePlayMovie, handleCloseMovie };
};

/**
 * Hook to manage episode playback state
 */
export const useEpisodePlayback = () => {
  const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(null);

  const handleEpisodeSelect = useCallback<(episode: Episode) => void>((episode: Episode) => {
    setPlayingEpisode(episode);
  }, []);

  const handleCloseEpisode = useCallback<() => void>(() => {
    setPlayingEpisode(null);
  }, []);

  return {
    playingEpisode,
    setPlayingEpisode,
    handleEpisodeSelect,
    handleCloseEpisode,
  };
};

/**
 * Hook to manage trailer playback state
 */
export const useTrailerPlayback = (videos?: Array<{ key: string }>) => {
  const [trailer, setTrailer] = useState<string | null>(null);

  const handleTrailerClick = useCallback<(key: string) => void>((key: string) => {
    setTrailer(key);
  }, []);

  const handlePlayTrailer = useCallback<() => void>(() => {
    const firstVideo = videos?.[0];
    setTrailer(firstVideo?.key ?? null);
  }, [videos]);

  const handleCloseTrailer = useCallback<() => void>(() => {
    setTrailer(null);
  }, []);

  return {
    trailer,
    setTrailer,
    handleTrailerClick,
    handlePlayTrailer,
    handleCloseTrailer,
  };
};

/**
 * Hook to manage series resume state
 */
export const useSeriesResume = (searchParams: URLSearchParams, initialResume: boolean) => {
  const [resumeSeries, setResumeSeries] = useState<boolean>(initialResume);

  const resumeSeriesProps = useMemo(
    () => ({
      src: searchParams.get('src') ?? '',
      poster: searchParams.get('poster') ?? '',
      title: `${searchParams.get('title')} - S${searchParams.get('seasonId')}E${searchParams.get('episodeNumber')}`,
      episodeNumber: Number(searchParams.get('episodeNumber')) || 0,
      seasonId: Number(searchParams.get('seasonId')) || 0,
    }),
    [searchParams],
  );

  const handleCloseSeries = useCallback<() => void>(() => {
    setResumeSeries(false);
  }, []);

  return { resumeSeries, resumeSeriesProps, handleCloseSeries };
};

/**
 * Hook to manage season selection
 */
export const useSeasonSelection = (seasons?: number[]) => {
  const [selectedSeason, setSelectedSeason] = useState<number>(() => {
    return seasons && seasons.length > 0 ? seasons[0] : 1;
  });

  return { selectedSeason, setSelectedSeason };
};

/**
 * Hook to manage streaming URLs
 */
export const useStreamingUrls = (
  selectedPlaylist: any,
  stream_id: string,
  container_extension?: string,
) => {
  const srcUrl = useMemo<string>(
    () =>
      `${selectedPlaylist.baseUrl}/movie/${selectedPlaylist.username}/${selectedPlaylist.password}/${stream_id}.${
        container_extension || 'mp4'
      }`,
    [selectedPlaylist, stream_id, container_extension],
  );

  const getEpisodeSrcUrl = useCallback<(episode: Episode) => string>(
    (episode: Episode) =>
      `${selectedPlaylist.baseUrl}/series/${selectedPlaylist.username}/${selectedPlaylist.password}/${episode.id}.${episode.container_extension}`,
    [selectedPlaylist],
  );

  return { srcUrl, getEpisodeSrcUrl };
};
