import { CastSectionProps } from '@/lib/types';
import { User2, Users } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

export const CastSection: FC<CastSectionProps> = ({ cast }) => {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="mt-16 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-950 rounded-lg border border-blue-700">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Cast</h2>
          <p className="text-sm text-slate-400 mt-1">Featuring talented actors</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cast.slice(0, 12).map((actor, idx) => (
          <div
            key={`${actor.name}-${idx}`}
            className="group rounded-lg overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300 bg-white/5 hover:bg-white/10"
          >
            {actor.profilePath ? (
              <div className="relative h-48 overflow-hidden bg-slate-800">
                <Image
                  src={actor.profilePath}
                  alt={actor.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-linear-to-br from-slate-800 to-slate-900">
                <User2 size={48} className="text-gray-600" />
              </div>
            )}
            <p className="px-3 py-2 text-xs font-medium text-center truncate text-gray-200 bg-black/40">
              {actor.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
