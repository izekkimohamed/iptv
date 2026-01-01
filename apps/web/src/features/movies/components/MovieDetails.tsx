import { useSearchParams } from 'next/navigation';

import { CastSection } from '@/components/commen/CastSection';
import { HeaderSection } from '@/components/commen/HeaderSection';
import { TrailerModal } from '@/components/commen/TrailerModels';
import { TrailersSection } from '@/components/commen/TrailersSEction';
import { useMoviePlayback, useStreamingUrls, useTrailerPlayback } from '@/hooks/useDetails';
import { ItemsDetailsProps } from '@/lib/types';
import { VideoPlayerModal } from '@/shared/components/common/VideoPlayerModal';
import { usePlaylistStore, useWatchedMoviesStore } from '@repo/store';
import Image from 'next/image';

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
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat">
        <Image src={tmdb?.backdrop || image} alt={name} fill />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" />
      </div>
      <div className="relative h-full overflow-hidden">
        <div className="h-full overflow-y-auto border-t border-white/10">
          <HeaderSection
            name={name}
            overview={tmdb?.overview}
            backdrop={tmdb?.backdrop ?? image}
            poster={tmdb?.poster ?? image}
            genres={tmdb?.genres}
            releaseDate={tmdb?.releaseDate}
            runtime={tmdb?.runtime}
            dbMovies={[]}
            currentSrc={srcUrl} // Pass the state from Page
            handlePlayMovie={handlePlayMovie} // Pass the function from Page
            onBack={() => window.history.back()}
          />
          <CastSection cast={tmdb?.cast} />
          <TrailersSection videos={tmdb?.videos} onTrailerClick={handleTrailerClick} />
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
