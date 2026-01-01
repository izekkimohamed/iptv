'use client';

import { Film } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { CastSection } from '@/components/commen/CastSection';
import { HeaderSection } from '@/components/commen/HeaderSection';
import { TrailerModal } from '@/components/commen/TrailerModels';
import { TrailersSection } from '@/components/commen/TrailersSEction';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { VideoPlayerModal } from '@/src/shared/components/common/VideoPlayerModal';
import { usePlaylistStore } from '@repo/store';
import Image from 'next/image';

export default function Page() {
  const searchParams = useSearchParams();
  const movieId = searchParams.get('movieId');
  const { selectedPlaylist } = usePlaylistStore();
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [srcUrl, setSrc] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [poster, setPoster] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dbMovieId, setDbMovieId] = useState<string>('');
  const [playing, setPlaying] = useState(false);

  const {
    data: movieDetails,
    isLoading,
    error,
  } = trpc.movies.getTmdbMovieDetails.useQuery(
    {
      tmdbId: parseInt(movieId || '0'),
      playlistId: selectedPlaylist?.id || 0,
    },
    {
      enabled: !!movieId && !!selectedPlaylist,
    },
  );

  const currentMovieSource = useMemo(() => {
    if (
      !movieDetails ||
      movieDetails.length === 0 ||
      !movieDetails[0].dbMovies ||
      movieDetails[0].dbMovies.length === 0
    )
      return null;
    return (
      movieDetails[0].dbMovies.find((movie) => movie.url === srcUrl) || movieDetails[0].dbMovies[0]
    );
  }, [movieDetails, srcUrl]);

  const handlePlayMovie = (movie: any) => {
    setTitle(movieDetails![0].tmdb.title);
    setPoster(movieDetails![0].tmdb.poster || '');
    setSrc(movie.url);
    setCategoryId(movie.categoryId.toString());
    setDbMovieId(movie.streamId.toString());
    setPlaying(true);
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-950">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-amber-500/20 duration-1000" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-500/30 bg-neutral-900 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]">
            <Film className="h-8 w-8 animate-pulse text-amber-500" />
          </div>
        </div>
        <p className="mt-6 font-mono text-sm tracking-widest text-amber-500/50 uppercase">
          Loading Metadata...
        </p>
      </div>
    );
  }

  // --- Error State ---
  if (error || !movieDetails || movieDetails.length === 0) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-950 p-6 text-center">
        <Film className="mb-4 h-20 w-20 text-neutral-800" />
        <h2 className="text-2xl font-bold text-neutral-200">Content Unavailable</h2>
        <p className="mt-2 text-neutral-500">
          We couldn&apos;t retrieve the details for this movie.
        </p>
        <Button
          variant="outline"
          className="mt-6 border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const movie = movieDetails[0];
  const tmdb = movie.tmdb;
  const hasMultipleSources = movie.dbMovies.length > 1;

  return (
    <div className="relative min-h-full w-full overflow-x-hidden bg-neutral-950 font-sans text-neutral-100 selection:bg-amber-500/30">
      {/* --- 1. IMMERSIVE BACKDROP --- */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <div className="absolute inset-0 z-10 bg-linear-to-t from-neutral-950 via-neutral-950/60 to-black/20" />
        <div className="absolute inset-0 z-10 bg-linear-to-r from-neutral-950/90 via-neutral-950/40 to-transparent" />
        <Image
          src={tmdb?.backdrop || tmdb.poster || ''}
          alt="Backdrop"
          fill
          className="object-cover opacity-60"
          priority
        />
        <HeaderSection
          name={tmdb.title}
          overview={tmdb.overview ?? ''}
          backdrop={tmdb.backdrop ?? ''}
          poster={tmdb.poster ?? ''}
          releaseDate={tmdb.releaseDate ?? ''}
          runtime={tmdb.runtime ?? 0}
          genres={tmdb.genres ?? []}
          dbMovies={movie.dbMovies}
          currentSrc={srcUrl} // Pass the state from Page
          handlePlayMovie={handlePlayMovie} // Pass the function from Page
          onBack={() => window.history.back()}
        />
        {/* --- 3. MAIN CONTENT --- */}
        <div className="relative z-20 mx-auto max-w-400 px-6 pb-10 lg:px-12">
          {/* CAST CAROUSEL/GRID */}
          {tmdb.cast && tmdb.cast.length > 0 && <CastSection cast={tmdb.cast} />}

          {/* TRAILERS SECTION */}
          {tmdb.videos && tmdb.videos.length > 0 && (
            <TrailersSection videos={tmdb.videos} onTrailerClick={setSelectedTrailer} />
          )}
        </div>
      </div>
      {/* --- MODALS --- */}
      <VideoPlayerModal
        isOpen={playing}
        onClose={() => setPlaying(false)}
        src={srcUrl}
        poster={poster}
        title={title}
        autoPlay
        categoryId={categoryId}
        serieId={null}
        movieId={dbMovieId}
        totalEpisodes={0}
      />

      <TrailerModal
        isOpen={!!selectedTrailer}
        onClose={() => setSelectedTrailer(null)}
        trailerId={selectedTrailer}
      />
    </div>
  );
}
