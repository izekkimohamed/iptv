'use client';

import Image from 'next/image';

interface MobilePosterProps {
  poster?: string;
  name: string;
}

export function MobilePoster({ poster, name }: MobilePosterProps) {
  return (
    <div className="mb-8 block h-64 w-44 overflow-hidden rounded-sm border border-white/10 shadow-2xl lg:hidden">
      <Image
        src={poster || ''}
        alt={name}
        width={176}
        height={256}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
