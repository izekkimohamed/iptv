'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useRef } from 'react';

import { CastSection } from '@/shared/components/common/CastSection';
import { EpisodesSection } from '@/shared/components/common/EpisodesSection';
import { TrailerModal } from '@/shared/components/common/TrailerModels';
import { TrailersSection } from '@/shared/components/common/TrailersSection';
import { useTrailerPlayback } from '@/shared/hooks/useDetails';
import { ItemsDetailsProps } from '@/shared/lib/types';
import { usePlaylistStore, useWatchedSeriesStore } from '@repo/store';

import { SeriesActions, SeriesDescription, SeriesHero, SeriesMetadata, SeriesPoster } from './index';

type SeriesDetailsProps = Omit<ItemsDetailsProps, 'container_extension'> & {
  seasons: NonNullable<ItemsDetailsProps['seasons']>;
  episodes: NonNullable<ItemsDetailsProps['episodes']>;
};

function SeriesDetailsContent({
  description,
  image,
  name,
  rating,
  stream_id,
  seasons,
  episodes,
  tmdb,
}: SeriesDetailsProps) {
  const searchParams = useSearchParams();
  const serieId = searchParams.get('serieId');
  const urlSeasonId = searchParams.get('seasonId');
  const urlEpisodeNumber = searchParams.get('episodeNumber');

  const { selectedPlaylist } = usePlaylistStore();
  const { series: watchedSeries } = useWatchedSeriesStore();
  const episodesSectionRef = useRef<any>(null);

  const { trailer, handleTrailerClick, handleCloseTrailer } = useTrailerPlayback(tmdb?.videos);

  const episodeToPlay = useMemo(() => {
    if (!serieId) return null;

    const serieIdNum = parseInt(serieId);
    const urlSeasonIdNum = urlSeasonId ? parseInt(urlSeasonId) : 1;
    const urlEpisodeNum = urlEpisodeNumber ? parseInt(urlEpisodeNumber) : 1;

    const watchedSerieItem = watchedSeries.find((s) => s.id === serieIdNum);

    if (watchedSerieItem && watchedSerieItem.episodes.length > 0) {
      const lastEpisode = watchedSerieItem.episodes[watchedSerieItem.episodes.length - 1];
      return {
        seasonId: lastEpisode.seasonId,
        episodeNumber: lastEpisode.episodeNumber,
        isResume: true,
      };
    } else {
      return {
        seasonId: urlSeasonIdNum,
        episodeNumber: urlEpisodeNum,
        isResume: false,
      };
    }
  }, [serieId, urlSeasonId, urlEpisodeNumber, watchedSeries]);

  const handlePlayMovie = () => {
    if (episodeToPlay) {
      const episode = episodes[episodeToPlay.seasonId]?.find(
        (ep) => ep.episode_num === episodeToPlay.episodeNumber,
      );
      if (episode && episodesSectionRef.current) {
        episodesSectionRef.current.playEpisode(episode);
      }
    }
  };

  const backdrop = tmdb?.backdrop || image;

  if (!selectedPlaylist) return null;

  return (
    <SeriesHero backdrop={backdrop} name={name}>
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        <SeriesPoster image={image} name={name} />

        <div className="flex-1 space-y-8 max-w-4xl">
          <SeriesMetadata
            name={name}
            rating={rating}
            tmdb={tmdb}
            seasons={seasons}
          />

          <SeriesDescription
            description={description}
            overview={tmdb?.overview}
          />

          <SeriesActions
            episodeToPlay={episodeToPlay}
            onPlay={handlePlayMovie}
          />
        </div>
      </div>

      <div className="mt-10 space-y-10">
        <div data-episodes-section>
          <EpisodesSection
            ref={episodesSectionRef}
            seasons={seasons}
            episodes={episodes}
            tmdbPoster={tmdb?.poster || undefined}
            fallbackImage={image}
            containerExtension={'mp4'}
            streamId={stream_id}
            image={image}
            tmdb={tmdb}
          />
        </div>

        {tmdb?.cast && <CastSection cast={tmdb.cast} />}
        {tmdb?.videos && <TrailersSection videos={tmdb.videos} onTrailerClick={handleTrailerClick} />}
      </div>
      <TrailerModal isOpen={!!trailer} onClose={handleCloseTrailer} trailerId={trailer} />
    </SeriesHero>
  );
}

export default function SeriesDetails(props: SeriesDetailsProps) {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-green-500" /></div>}>
      <SeriesDetailsContent {...props} />
    </Suspense>
  );
}
