import { User } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

import { CastSectionProps } from '@/lib/types';

export const CastSection: FC<CastSectionProps> = ({ cast }) => {
  if (!cast || cast.length === 0) return null;

  return (
    <section className="space-y-8 px-6 lg:px-12">
      <div className="flex items-center gap-4">
        <div className="h-8 w-1.5 rounded-full " />
        <h2 className="text-3xl font-black tracking-tight text-white">Top Cast</h2>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {cast.slice(0, 12).map((actor, idx) => (
          <div key={idx} className="group relative flex flex-col items-center gap-4 text-center">
            <div className="relative aspect-square w-full overflow-hidden rounded-full border-2 border-white/5 bg-white/5 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.2)]">
              {actor.profilePath ? (
                <Image
                  src={actor.profilePath}
                  alt={actor.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/5 text-white/20">
                  <User className="h-12 w-12" />
                </div>
              )}
            </div>
            <div className="space-y-1 px-2">
              <p className="line-clamp-2 text-sm font-black leading-tight text-white transition-colors group-hover:text-primary">
                {actor.name}
              </p>
              {actor.character && (
                <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {actor.character}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
