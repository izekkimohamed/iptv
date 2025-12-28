'use client';
import Image from 'next/image';

import { trpc } from '@/lib/trpc';

import { Button } from '../ui/button';

interface TmdbProps {
  tmdbId: number | null;
  name: string;
  year: number;
}

function Tmdb(props: TmdbProps) {
  const { tmdbId, name, year } = props;
  const clearName = name.replace(/[^|]*\|/g, '');
  const { data, isLoading } = trpc.movies.getMovieDetails.useQuery({
    tmdbId: tmdbId ? tmdbId : null,
    name: clearName,
    year,
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) {
    return null;
  }
  return (
    <div className="container mx-auto space-y-16 px-6 py-12">
      {/* Description */}
      <section className="max-w-4xl">
        <h2 className="mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
          Synopsis
        </h2>
        <p className="text-lg leading-relaxed text-gray-300">{data.overview}</p>
      </section>

      {/* Cast */}
      <section>
        <h2 className="mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
          Cast
        </h2>
        <div className="flex space-x-4 overflow-x-auto py-3">
          {data.cast?.map((c, i) => (
            <div
              key={i}
              className="group relative flex aspect-square min-w-[150px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-400 text-center"
            >
              <div className="absolute flex size-full items-center justify-center bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-lg font-semibold">{c.name}</p>
              </div>
              <Image fill src={c.profilePath ? c.profilePath : ''} alt={c.name} sizes="200px" />
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-lg font-semibold">{c.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trailers */}
      <section>
        <h2 className="mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
          Trailers & Clips
        </h2>
        <div className="flex gap-6 space-x-4 overflow-x-auto py-3">
          {data.videos?.map((t, i) => (
            <a
              href={`https://www.youtube.com/watch?v=${t.key}&t=0s`}
              key={i}
              target="_blank"
              title={t.name}
              className="relative aspect-video min-w-[200px] transform overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                <div className="relative flex flex-col items-center justify-center gap-1">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 transition-transform duration-300 group-hover:scale-110">
                    <span className="text-2xl">▶</span>
                  </div>
                  <span className="text-center">trailer</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
            You Might Also Like
          </h2>
          <Button className="text-gray-400 transition-colors duration-300 hover:text-white">
            View All →
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"></div>
      </section>
    </div>
  );
}

export default Tmdb;
