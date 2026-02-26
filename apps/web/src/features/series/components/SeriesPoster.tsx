'use client';

import Image from 'next/image';

interface SeriesPosterProps {
  image: string;
  name: string;
}

export function SeriesPoster({ image, name }: SeriesPosterProps) {
  return (
    <div className="relative h-[400px] w-full max-w-[280px] shrink-0 overflow-hidden rounded-sm border border-white/10 shadow-2xl transition-transform duration-500 hover:scale-[1.02] lg:h-[460px] lg:max-w-[320px]">
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 280px, 320px"
        onError={(e) => { e.currentTarget.src = '/icon.png'; }}
      />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
    </div>
  );
}
