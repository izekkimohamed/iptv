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
    <div className="space-y-4">
      <h1 className="text-4xl sm:text-6xl font-black text-white leading-[1.1] tracking-tight">
        {cleanName(name)}
      </h1>

      <div className="flex items-center gap-3 flex-wrap">
        {rating && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
            <Star className="w-4 h-4 text-green-400 fill-green-400" />
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5"
              >
                <item.icon className="w-4 h-4 text-white/40" />
                <span className="text-xs font-bold text-white/60 tracking-wide">{item.value}</span>
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
            className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/40 border border-white/10 rounded-full bg-white/[0.02]"
          >
            {cleanName(genre.name)}
          </span>
        ))}
      </div>
    )}
  </div>
);
