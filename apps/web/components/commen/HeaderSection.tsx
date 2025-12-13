import { HeaderSectionProps } from '@/lib/types';
import { cleanName, formatRuntime } from '@/lib/utils';
import { Calendar, Clock, Star } from 'lucide-react';
import { FC } from 'react';

export const HeaderSection: FC<HeaderSectionProps> = ({
  name,
  rating,
  runtime,
  releaseDate,
  genres,
}) => (
  <div className="space-y-6">
    <div className="space-y-3">
      <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">{cleanName(name)}</h1>
      <div className="flex items-center gap-4 flex-wrap">
        {rating && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-lg font-bold text-yellow-300">
              {parseFloat(String(rating)).toFixed(1)}
            </span>
          </div>
        )}
        {runtime && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <Clock className="w-5 h-5 text-gray-300" />
            <span className="text-sm font-medium text-gray-300">{formatRuntime(runtime)}</span>
          </div>
        )}
        {releaseDate && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <Calendar className="w-5 h-5 text-gray-300" />
            <span className="text-sm font-medium text-gray-300">
              {new Date(releaseDate).getFullYear()}
            </span>
          </div>
        )}
      </div>
    </div>

    {genres && genres.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <span
            key={genre.id}
            className="px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/20 rounded-full border border-amber-500/30"
          >
            {cleanName(genre.name)}
          </span>
        ))}
      </div>
    )}
  </div>
);
