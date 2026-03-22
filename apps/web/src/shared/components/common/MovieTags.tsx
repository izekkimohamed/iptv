'use client';

import { Badge } from '@/shared/components/ui/badge';

interface MovieTagsProps {
  genres?: { id: number; name: string }[];
  status?: string | null;
}

export function MovieTags({ genres, status }: MovieTagsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge
        variant="outline"
        className="border-primary/40 bg-primary/10 px-3 py-1 font-black tracking-widest text-primary uppercase"
      >
        MOVIE
      </Badge>
      {status && (
        <Badge
          variant="outline"
          className="border-white/10 bg-white/5 px-3 py-1 font-bold text-neutral-400"
        >
          {status}
        </Badge>
      )}
      {genres?.map((g) => (
        <Badge
          key={g.id}
          variant="secondary"
          className="rounded-sm border border-white/5 bg-white/5 px-3 py-1 font-bold text-neutral-300 backdrop-blur-md hover:bg-white/10"
        >
          {g.name}
        </Badge>
      ))}
    </div>
  );
}
