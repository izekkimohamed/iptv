'use client';

// --- 1. CORE COMPONENTS & HOOKS ---
import { Film } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';


import { CastSection } from '@/components/common/CastSection';
import { DetailSkeleton } from '@/components/common/DetailSkeleton';
import { HeaderSection } from '@/components/common/HeaderSection';
import { TrailerModal } from '@/components/common/TrailerModels';
import { TrailersSection } from '@/components/common/TrailersSection';
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
  if (isLoading) return <DetailSkeleton />;

  // --- Error State ---
  if (error || !movieDetails || movieDetails.length === 0) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-6 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/5 bg-white/2">
          <Film className="h-10 w-10 text-white/20" />
        </div>
        <h2 className="text-4xl font-black tracking-tight text-white">Content Unavailable</h2>
        <p className="mt-4 max-w-sm text-lg font-medium text-white/40 leading-relaxed">
          We couldn&apos;t retrieve the stream details for this title. It might be temporarily offline or restricted.
        </p>
        <Button
          onClick={() => window.history.back()}
          className="mt-10 h-14 rounded-2xl bg-white px-8 text-base font-black text-black transition-all hover:scale-105 active:scale-95"
        >
          Return to Browse
        </Button>
      </div>
    );
  }

  const movie = movieDetails[0];
  const tmdb = movie.tmdb;
  const hasMultipleSources = movie.dbMovies.length > 1;

  return (
    <div className="relative min-h-full w-full overflow-x-hidden bg-background font-sans text-foreground selection:bg-primary/30">
      {/* --- 1. IMMERSIVE BACKDROP --- */}
      <div className="absolute inset-0 z-0 h-full w-full overflow-hidden overflow-y-auto">
        <div className="absolute inset-0 z-10 bg-linear-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 z-10 bg-linear-to-r from-background/90 via-transparent to-transparent hidden lg:block" />
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
