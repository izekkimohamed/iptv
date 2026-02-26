'use client';

import Image from 'next/image';

interface MoviePosterProps {
  poster?: string;
  name: string;
}

export function MoviePoster({ poster, name }: MoviePosterProps) {
  return (
    <div className="my-auto hidden lg:col-span-3 lg:block lg:space-y-6">
      <div className="group relative aspect-2/3 w-full overflow-hidden rounded-sm border border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-primary/50 hover:shadow-primary/20">
        <Image
          src={poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    </div>
  );
}
