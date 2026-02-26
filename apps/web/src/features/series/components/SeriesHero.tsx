'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SeriesHeroProps {
  backdrop: string;
  name: string;
  children: React.ReactNode;
}

export function SeriesHero({ backdrop, name, children }: SeriesHeroProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
      <div className="absolute inset-0 w-full">
        <Image
          src={backdrop}
          alt={name}
          fill
          sizes="100vw"
          className="object-cover opacity-50 blur-[1px]"
          priority
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-background/70 " />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 via-50% to-transparent to-100%" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent from-10% via-50% to-100% hidden lg:block" />
      </div>
      <div className="relative z-10 mx-auto max-w-[95vw] px-6 pt-[5vh] pb-20 lg:px-16 lg:pt-[5vh]">
        {children}
      </div>
    </div>
  );
}
