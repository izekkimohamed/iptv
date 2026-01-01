import { User } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

import { CastSectionProps } from '@/lib/types';

export const CastSection: FC<CastSectionProps> = ({ cast }) => {
  if (!cast || cast.length === 0) return null;

  return (
    <section className="space-y-6 p-10">
      <div className="flex items-center gap-4">
        <div className="h-8 w-1 rounded-full bg-amber-500" />
        <h2 className="text-2xl font-bold tracking-tight text-white">Top Cast</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {cast.slice(0, 12).map((actor, idx) => (
          <div key={idx} className="group relative flex flex-col gap-3">
            <div className="relative aspect-square overflow-hidden rounded-full border-2 border-transparent transition-all duration-300 group-hover:border-amber-500/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              {actor.profilePath ? (
                <Image
                  src={actor.profilePath}
                  alt={actor.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-neutral-600">
                  <User className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="line-clamp-1 font-bold text-white transition-colors group-hover:text-amber-500">
                {actor.name}
              </p>
              <p className="line-clamp-1 text-xs text-neutral-500">Character Name</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
