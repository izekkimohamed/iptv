import { useMemo } from 'react';

import { BackButton } from './BackButton';
import { MovieActionButtons } from './MovieActionButtons';
import { MovieMetadata } from './MovieMetadata';
import { MoviePoster } from './MoviePoster';
import { MobilePoster } from './MobilePoster';
import { MovieSynopsis } from './MovieSynopsis';
import { MovieTags } from './MovieTags';

interface DbMovie {
  id: number;
  streamId: number;
  name: string;
  rating: string;
  url: string;
  categoryId: number;
}

interface EpisodeToPlay {
  seasonId: number;
  episodeNumber: number;
  isResume: boolean;
}

interface HeaderSectionProps {
  name: string;
  overview?: string;
  backdrop?: string;
  poster?: string;
  releaseDate?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  rating?: string;
  dbMovies: DbMovie[];
  currentSrc: string;
  episodeToPlay?: EpisodeToPlay | null;
  handlePlayMovie: (movie?: DbMovie) => void;
  onBack: () => void;
}

export function HeaderSection({
  name,
  overview,
  poster,
  releaseDate,
  runtime,
  genres,
  rating,
  dbMovies,
  currentSrc,
  handlePlayMovie,
  onBack,
  episodeToPlay,
}: HeaderSectionProps) {
  return (
    <div className="">
      <BackButton onBack={onBack} />

      <div className="relative z-20 mx-auto max-w-400 px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <MoviePoster poster={poster} name={name} />

          <div className="flex flex-col justify-end lg:col-span-9">
            <div className="mb-6 space-y-4">
              <MobilePoster poster={poster} name={name} />

              <MovieTags genres={genres} />

              <MovieMetadata
                name={name}
                releaseDate={releaseDate}
                runtime={runtime}
                rating={rating}
              />
            </div>

            <MovieSynopsis overview={overview} />

            <MovieActionButtons
              dbMovies={dbMovies}
              currentSrc={currentSrc}
              handlePlayMovie={handlePlayMovie}
              episodeToPlay={episodeToPlay}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
