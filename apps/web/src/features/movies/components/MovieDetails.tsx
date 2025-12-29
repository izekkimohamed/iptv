import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { ActionButtons } from '@/components/commen/ActionButtons';
import { CastSection } from '@/components/commen/CastSection';
import { HeaderSection } from '@/components/commen/HeaderSection';
import { TrailerModal } from '@/components/commen/TrailerModels';
import { TrailersSection } from '@/components/commen/TrailersSEction';
import { Button } from '@/components/ui/button';
import { useMoviePlayback, useStreamingUrls, useTrailerPlayback } from '@/hooks/useDetails';
import { ItemsDetailsProps } from '@/lib/types';
import { VideoPlayerModal } from '@/shared/components/common/VideoPlayerModal';
import { usePlaylistStore, useWatchedMoviesStore } from '@repo/store';

type MovieDetailsProps = Omit<ItemsDetailsProps, 'seasons' | 'episodes'>;

export default function MovieDetails({
  container_extension,
  description,
  image,
  name,
  rating,
  stream_id,
  tmdb,
}: MovieDetailsProps) {
  const searchParams = useSearchParams();
  const movieId = searchParams.get('movieId');
  const categoryId = searchParams.get('categoryId');

  const { selectedPlaylist } = usePlaylistStore();
  if (!selectedPlaylist) return null;
  const { getProgress } = useWatchedMoviesStore();

  const {
    playing,
    handlePlayMovie: handlePlayMovieBase,
    handleCloseMovie,
  } = useMoviePlayback(searchParams.get('play') === 'true');
  const { trailer, handleTrailerClick, handlePlayTrailer, handleCloseTrailer } = useTrailerPlayback(
    tmdb?.videos,
  );
  const { srcUrl } = useStreamingUrls(selectedPlaylist, stream_id, container_extension);

  const resumeItem = getProgress(parseInt(movieId || '0'), selectedPlaylist.id);

  const handlePlayMovie = () => {
    handlePlayMovieBase();
  };

  return (
    <div className="relative h-full">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${tmdb?.backdrop || image})`,
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
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
                    alt={name || 'Movie Image'}
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

                <div className="space-y-2">
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
                  hasSeasons={false}
                  onPlayMovie={handlePlayMovie}
                  hasTrailer={!!(tmdb?.videos && tmdb.videos.length > 0)}
                  onPlayTrailer={handlePlayTrailer}
                  isMovieResume={resumeItem?.id === parseInt(movieId || '0')}
                />
              </div>
            </div>

            <CastSection cast={tmdb?.cast} />
            <TrailersSection videos={tmdb?.videos} onTrailerClick={handleTrailerClick} />
          </div>
        </div>
      </div>

      <VideoPlayerModal
        isOpen={playing}
        onClose={handleCloseMovie}
        src={srcUrl}
        poster={image}
        title={name}
        autoPlay
        categoryId={categoryId}
        serieId={null}
        movieId={movieId}
        totalEpisodes={0}
      />

      <TrailerModal isOpen={!!trailer} onClose={handleCloseTrailer} trailerId={trailer} />
    </div>
  );
}
