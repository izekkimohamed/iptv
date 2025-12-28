import { User2, Users } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

import { CastSectionProps } from '@/lib/types';

export const CastSection: FC<CastSectionProps> = ({ cast }) => {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="mt-16 space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-blue-700 bg-blue-950 p-3">
          <Users className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Cast</h2>
          <p className="mt-1 text-sm text-slate-400">Featuring talented actors</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {cast.slice(0, 12).map((actor, idx) => (
          <div
            key={`${actor.name}-${idx}`}
            className="group overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all duration-300 hover:border-amber-500/50 hover:bg-white/10"
          >
            {actor.profilePath ? (
              <div className="relative h-48 overflow-hidden bg-slate-800">
                <Image
                  src={actor.profilePath}
                  alt={actor.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center bg-linear-to-br from-slate-800 to-slate-900">
                <User2 size={48} className="text-gray-600" />
              </div>
            )}
            <p className="truncate bg-black/40 px-3 py-2 text-center text-xs font-medium text-gray-200">
              {actor.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
