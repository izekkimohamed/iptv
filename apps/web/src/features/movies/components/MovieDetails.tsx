import { ActionButtons } from '@/components/commen/ActionButtons';
import { CastSection } from '@/components/commen/CastSection';
import { HeaderSection } from '@/components/commen/HeaderSection';
import { TrailerModal } from '@/components/commen/TrailerModels';
import { TrailersSection } from '@/components/commen/TrailersSEction';
import { Button } from '@/components/ui/button';
import { useMoviePlayback, useStreamingUrls, useTrailerPlayback } from '@/hooks/useDetails';
import { ItemsDetailsProps } from '@/lib/types';
import { VideoPlayerModal } from '@/shared/components/common/VideoPlayerModal';
import { usePlaylistStore } from '@/store/appStore';
import { useWatchedMoviesStore } from '@/store/watchedStore';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

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
        className="absolute inset-0 bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage: `url(${tmdb?.backdrop || image})`,
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      </div>

      <div className="relative h-full overflow-hidden">
        <div className="h-full overflow-y-auto border-t border-white/10">
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
          <div className="max-w-7xl mx-auto pt-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
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

              <div className="lg:col-span-2 flex flex-col space-y-6">
                <HeaderSection
                  name={name}
                  rating={rating}
                  runtime={tmdb?.runtime}
                  releaseDate={tmdb?.releaseDate}
                  genres={tmdb?.genres}
                />

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Synopsis</h3>
                  <p className="text-gray-300 leading-relaxed line-clamp-4">
                    {tmdb?.overview || description || 'No description available.'}
                  </p>
                </div>

                {tmdb?.director && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                      Director
                    </h4>
                    <p className="text-white font-medium">{tmdb.director}</p>
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
