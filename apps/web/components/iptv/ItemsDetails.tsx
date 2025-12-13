import { useMoviePlayback, useStreamingUrls, useTrailerPlayback } from '@/hooks/useDetails';
import { ItemsDetailsProps } from '@/lib/types';
import { usePlaylistStore } from '@/store/appStore';
import { useWatchedSeriesStore } from '@/store/watchedStore';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FC, useMemo, useRef } from 'react';
import { ActionButtons } from '../commen/ActionButtons';
import { CastSection } from '../commen/CastSection';
import { EpisodesSection } from '../commen/EpisodesSection';
import { HeaderSection } from '../commen/HeaderSection';
import { TrailerModal } from '../commen/TrailerModels';
import { TrailersSection } from '../commen/TrailersSEction';
import { VideoPlayerModal } from '../commen/VideoModels';
import { Button } from '../ui/button';

const ItemsDetails: FC<ItemsDetailsProps> = (props) => {
  const {
    container_extension,
    description,
    image,
    name,
    rating,
    stream_id,
    seasons,
    episodes,
    tmdb,
  } = props;

  const searchParams = useSearchParams();
  const movieId = searchParams.get('movieId');
  const serieId = searchParams.get('serieId');
  const categoryId = searchParams.get('categoryId');
  const urlSeasonId = searchParams.get('seasonId');
  const urlEpisodeNumber = searchParams.get('episodeNumber');

  const { selectedPlaylist } = usePlaylistStore();
  const { series: watchedSeries, getEpisodeProgress } = useWatchedSeriesStore();
  const episodesSectionRef = useRef<any>(null);

  // Determine if this is a series
  const isSeries = !!serieId;

  // Get episode details to play
  const episodeToPlay = useMemo(() => {
    if (!isSeries || !serieId) return null;

    const serieIdNum = parseInt(serieId);
    const urlSeasonIdNum = urlSeasonId ? parseInt(urlSeasonId) : 1;
    const urlEpisodeNum = urlEpisodeNumber ? parseInt(urlEpisodeNumber) : 1;

    // Check if series exists in watched store
    const watchedSerieItem = watchedSeries.find((s) => s.id === serieIdNum);

    if (watchedSerieItem && watchedSerieItem.episodes.length > 0) {
      // Get the last watched episode
      const lastEpisode = watchedSerieItem.episodes[watchedSerieItem.episodes.length - 1];
      return {
        seasonId: lastEpisode.seasonId,
        episodeNumber: lastEpisode.episodeNumber,
        isResume: true,
      };
    } else {
      // Start from the first episode or URL params
      return {
        seasonId: urlSeasonIdNum,
        episodeNumber: urlEpisodeNum,
        isResume: false,
      };
    }
  }, [isSeries, serieId, urlSeasonId, urlEpisodeNumber, watchedSeries]);

  // Return early if no playlist is selected
  if (!selectedPlaylist) {
    return null;
  }

  // Initialize all custom hooks
  const {
    playing,
    handlePlayMovie: handlePlayMovieBase,
    handleCloseMovie,
  } = useMoviePlayback(searchParams.get('play') === 'true');
  const { trailer, handleTrailerClick, handlePlayTrailer, handleCloseTrailer } = useTrailerPlayback(
    tmdb?.videos,
  );

  const { srcUrl } = useStreamingUrls(selectedPlaylist, stream_id, container_extension);

  // Smart play handler that determines movie or episode
  const handlePlayMovie = () => {
    if (isSeries && episodeToPlay && episodes) {
      // For series, find the episode and trigger playback through the ref
      const episode = episodes[episodeToPlay.seasonId]?.find(
        (ep) => ep.episode_num === episodeToPlay.episodeNumber,
      );
      if (episode && episodesSectionRef.current) {
        episodesSectionRef.current.playEpisode(episode);
        // Smooth scroll to episodes section
        const episodesSection = document.querySelector('[data-episodes-section]');
        if (episodesSection) {
          setTimeout(() => {
            episodesSection.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    } else {
      // For movies, use the regular movie playback
      handlePlayMovieBase();
    }
  };

  return (
    <div className="relative h-full">
      {/* Background with gradient overlay */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage: `url(${tmdb?.backdrop || image})`,
        }}
      >
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
      </div>

      <div className="relative h-full overflow-hidden">
        <div className="h-full overflow-y-auto border-t border-white/10">
          {/* Back button */}
          <div className="sticky z-10 top-0 p-3 left-0 bg-black/10 backdrop-blur-md">
            <Button
              onClick={() => window.history.back()}
              className="flex items-center bg-transparent gap-2 px-4 py-2 text-white transition-all duration-300 border rounded-full cursor-pointer group hover:bg-white/20 hover:border-white/40 border-white/20"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-semibold text-sm">Back</span>
            </Button>
          </div>
          {/* Main Content */}
          <div className="max-w-7xl mx-auto pt-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Poster */}
              <div className="lg:col-span-1 flex justify-center lg:justify-start">
                <div className="relative group">
                  <Image
                    src={tmdb?.poster || image}
                    alt={name || 'Movie Image'}
                    className="relative rounded-lg shadow-2xl border border-white/10"
                    width={400}
                    height={600}
                    priority
                  />
                </div>
              </div>

              {/* Movie Info */}
              <div className="lg:col-span-2 flex flex-col space-y-6">
                <HeaderSection
                  name={name}
                  rating={rating}
                  runtime={tmdb?.runtime}
                  releaseDate={tmdb?.releaseDate}
                  genres={tmdb?.genres}
                />

                {/* Synopsis */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Synopsis</h3>
                  <p className="text-gray-300 leading-relaxed line-clamp-4">
                    {tmdb?.overview || description || 'No description available.'}
                  </p>
                </div>

                {/* Director */}
                {tmdb?.director && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                      Director
                    </h4>
                    <p className="text-white font-medium">{tmdb.director}</p>
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
              containerExtension={container_extension!}
              streamId={stream_id}
              image={image}
              tmdb={tmdb}
            />

            <CastSection cast={tmdb?.cast} />
            <TrailersSection videos={tmdb?.videos} onTrailerClick={handleTrailerClick} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <VideoPlayerModal
        isOpen={playing}
        onClose={handleCloseMovie}
        src={srcUrl}
        poster={image}
        title={name}
        autoPlay
        categoryId={categoryId}
        serieId={serieId}
        movieId={movieId}
        totalEpisodes={0}
      />

      <TrailerModal isOpen={!!trailer} onClose={handleCloseTrailer} trailerId={trailer} />
    </div>
  );
};

export default ItemsDetails;
