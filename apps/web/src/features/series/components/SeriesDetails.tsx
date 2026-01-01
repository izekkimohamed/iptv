import { useSearchParams } from 'next/navigation';
import { useMemo, useRef } from 'react';

import { CastSection } from '@/components/commen/CastSection';
import { EpisodesSection } from '@/components/commen/EpisodesSection';
import { HeaderSection } from '@/components/commen/HeaderSection';
import { TrailerModal } from '@/components/commen/TrailerModels';
import { TrailersSection } from '@/components/commen/TrailersSEction';
import { useTrailerPlayback } from '@/hooks/useDetails';
import { ItemsDetailsProps } from '@/lib/types';
import { usePlaylistStore, useWatchedSeriesStore } from '@repo/store';
import Image from 'next/image';

type SeriesDetailsProps = Omit<ItemsDetailsProps, 'container_extension'> & {
  seasons: NonNullable<ItemsDetailsProps['seasons']>;
  episodes: NonNullable<ItemsDetailsProps['episodes']>;
};

export default function SeriesDetails({
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

  if (!selectedPlaylist) return null;

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
        const el = document.querySelector('[data-episodes-section]');
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }
  };

  return (
    <div className="relative h-full">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat">
        <Image src={tmdb?.backdrop || image} alt={name} fill />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-lg" />
      </div>
      <div className="relative h-full overflow-hidden">
        <div className="h-full overflow-y-auto border-t border-white/10">
          <HeaderSection
            name={name}
            overview={tmdb?.overview || description}
            backdrop={tmdb?.backdrop ?? image}
            poster={tmdb?.poster ?? image}
            genres={tmdb?.genres}
            rating={rating}
            releaseDate={tmdb?.releaseDate}
            runtime={tmdb?.runtime}
            dbMovies={[]}
            currentSrc={''} // Pass the state from Page
            episodeToPlay={episodeToPlay}
            handlePlayMovie={handlePlayMovie} // Pass the function from Page
            onBack={() => window.history.back()}
          />
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
          <CastSection cast={tmdb?.cast} />
          <TrailersSection videos={tmdb?.videos} onTrailerClick={handleTrailerClick} />
        </div>
      </div>
      <TrailerModal isOpen={!!trailer} onClose={handleCloseTrailer} trailerId={trailer} />
    </div>
  );
}
