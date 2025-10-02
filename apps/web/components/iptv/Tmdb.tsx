"use client";
import { trpc } from "@/lib/trpc";
import Image from "next/image";
import React from "react";

function Tmdb({
  tmdbId,
  name,
  year,
}: {
  tmdbId: number;
  name: string;
  year: number;
}) {
  const clearName = name.replace(/[^|]*\|/g, "");
  const { data, isLoading } = trpc.movies.getMovieDetails.useQuery({
    tmdbId: tmdbId ? tmdbId : undefined,
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
    <div className='container mx-auto px-6 py-12 space-y-16 '>
      {/* Description */}
      <section className='max-w-4xl'>
        <h2 className='text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent'>
          Synopsis
        </h2>
        <p className='text-gray-300 text-lg leading-relaxed'>{data.overview}</p>
      </section>

      {/* Cast */}
      <section>
        <h2 className='text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent'>
          Cast
        </h2>
        <div className='flex space-x-4 overflow-x-auto py-3 '>
          {data.cast?.map((c, i) => (
            <div
              key={i}
              className='group text-center cursor-pointer  min-w-[150px] aspect-square relative rounded-full overflow-hidden bg-gray-400 flex items-center justify-center'
            >
              <div className='absolute  bg-gradient-to-t from-black/60 to-transparent size-full flex items-center justify-center'>
                <p className='font-semibold text-lg'>{c.name}</p>
              </div>
              <Image
                fill
                src={c.profilePath ? c.profilePath : ""}
                alt={c.name}
                sizes='200px'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                <p className='font-semibold text-lg'>{c.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trailers */}
      <section>
        <h2 className='text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent'>
          Trailers & Clips
        </h2>
        <div className='flex space-x-4 overflow-x-auto py-3 gap-6'>
          {data.videos?.map((t, i) => (
            <a
              href={`https://www.youtube.com/watch?v=${t.key}&t=0s`}
              key={i}
              target='_blank'
              title={t.name}
              className=' min-w-[200px] aspect-video relative rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 backdrop-blur-sm'
            >
              <div className='absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-col'>
                <div className='relative flex flex-col justify-center items-center gap-1'>
                  <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                    <span className='text-2xl'>▶</span>
                  </div>
                  <span className='text-center'>trailer</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <div className='flex justify-between items-center mb-8'>
          <h2 className='text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent'>
            You Might Also Like
          </h2>
          <button className='text-gray-400 hover:text-white transition-colors duration-300'>
            View All →
          </button>
        </div>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'></div>
      </section>
    </div>
  );
}

export default Tmdb;
