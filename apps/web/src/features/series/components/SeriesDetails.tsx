import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef } from 'react';

import { ActionButtons } from '@/components/commen/ActionButtons';
import { CastSection } from '@/components/commen/CastSection';
import { EpisodesSection } from '@/components/commen/EpisodesSection';
import { HeaderSection } from '@/components/commen/HeaderSection';
import { TrailerModal } from '@/components/commen/TrailerModels';
import { TrailersSection } from '@/components/commen/TrailersSEction';
import { Button } from '@/components/ui/button';
import { useTrailerPlayback } from '@/hooks/useDetails';
import { ItemsDetailsProps } from '@/lib/types';
import { usePlaylistStore } from '@/store/appStore';
import { useWatchedSeriesStore } from '@/store/watchedStore';

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

  const { trailer, handleTrailerClick, handlePlayTrailer, handleCloseTrailer } = useTrailerPlayback(
    tmdb?.videos,
  );

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
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${tmdb?.backdrop || image})`,
        }}
      >
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
      </div>

      <div className="relative h-full overflow-hidden">
        <div className="h-full overflow-y-auto border-t border-white/10">
          <div className="sticky top-0 left-0 z-10 bg-black/10 p-3 backdrop-blur-md">
            <Button
              onClick={() => window.history.back()}
              className="group flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-transparent px-4 py-2 text-white transition-all duration-300 hover:border-white/40 hover:bg-white/20"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-semibold">Back</span>
            </Button>
          </div>
          <div className="mx-auto max-w-7xl pt-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
              <div className="flex justify-center lg:col-span-1 lg:justify-start">
                <div className="group relative">
                  <Image
                    src={tmdb?.poster || image}
                    alt={name || 'Series Image'}
                    className="relative rounded-lg border border-white/10 shadow-2xl"
                    width={400}
                    height={600}
                    priority
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-6 lg:col-span-2">
                <HeaderSection
                  name={name}
                  rating={rating}
                  runtime={tmdb?.runtime}
                  releaseDate={tmdb?.releaseDate}
                  genres={tmdb?.genres}
                />

                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold text-white">Synopsis</h3>
                  <p className="line-clamp-4 leading-relaxed text-gray-300">
                    {tmdb?.overview || description || 'No description available.'}
                  </p>
                </div>

                {tmdb?.director && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                      Director
                    </h4>
                    <p className="font-medium text-white">{tmdb.director}</p>
                  </div>
                )}

                <ActionButtons
                  hasSeasons={!!(seasons && seasons.length > 0)}
                  onPlayMovie={handlePlayMovie}
                  hasTrailer={!!(tmdb?.videos && tmdb.videos.length > 0)}
                  onPlayTrailer={handlePlayTrailer}
                  episodeToPlay={episodeToPlay}
                />
              </div>
            </div>

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
      </div>

      <TrailerModal isOpen={!!trailer} onClose={handleCloseTrailer} trailerId={trailer} />
    </div>
  );
}
