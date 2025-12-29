import { Calendar, Clock, Star } from 'lucide-react';
import { FC } from 'react';

import { HeaderSectionProps } from '@/lib/types';
import { cleanName, formatRuntime } from '@repo/utils';

export const HeaderSection: FC<HeaderSectionProps> = ({
  name,
  rating,
  runtime,
  releaseDate,
  genres,
}) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h1 className="text-4xl leading-[1.1] font-black tracking-tight text-white sm:text-6xl">
        {cleanName(name)}
      </h1>

      <div className="flex flex-wrap items-center gap-3">
        {rating && (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-md">
            <Star className="h-4 w-4 fill-green-400 text-green-400" />
            <span className="text-sm font-black text-white">
              {parseFloat(String(rating)).toFixed(1)}
            </span>
          </div>
        )}

        {[
          { icon: Clock, value: runtime ? formatRuntime(runtime) : null },
          { icon: Calendar, value: releaseDate ? new Date(releaseDate).getFullYear() : null },
        ].map(
          (item, i) =>
            item.value && (
              <div
                key={i}
                className="flex items-center gap-2 rounded-full border border-white/5 bg-white/3 px-3 py-1.5"
              >
                <item.icon className="h-4 w-4 text-white/40" />
                <span className="text-xs font-bold tracking-wide text-white/60">{item.value}</span>
              </div>
            ),
        )}
      </div>
    </div>

    {genres && (
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <span
            key={genre.id}
            className="rounded-full border border-white/10 bg-white/2 px-3 py-1 text-[10px] font-black tracking-widest text-white/40 uppercase"
          >
            {cleanName(genre.name)}
          </span>
        ))}
      </div>
    )}
  </div>
);
