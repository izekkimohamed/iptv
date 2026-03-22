'use client';

import { Calendar, Clock, Star, User, Globe, MapPin } from 'lucide-react';

interface MovieMetadataProps {
  name: string;
  releaseDate?: string;
  runtime?: number;
  voteAverage?: number | null;
  voteCount?: number | null;
  tagline?: string | null;
  director?: string | null;
  productionCountries?: string[] | null;
  spokenLanguages?: string[] | null;
}

export function MovieMetadata({
  name,
  releaseDate,
  runtime,
  voteAverage,
  voteCount,
  tagline,
  director,
  productionCountries,
  spokenLanguages,
}: MovieMetadataProps) {
  return (
    <>
      <h1 className="max-w-4xl text-5xl font-black leading-none tracking-tighter text-white drop-shadow-2xl md:text-7xl">
        {name}
      </h1>

      {tagline && (
        <p className="text-lg font-medium italic text-primary/70">{tagline}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-neutral-400">
        {voteAverage != null && (
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-primary text-primary" />
            <span className="text-xl text-white">{voteAverage.toFixed(1)}</span>
            {voteCount != null && (
              <span className="text-sm text-white/30">({voteCount.toLocaleString()})</span>
            )}
          </div>
        )}
        {releaseDate && (
          <>
            <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-white/40" />
              {new Date(releaseDate).getFullYear()}
            </div>
          </>
        )}
        {runtime != null && runtime > 0 && (
          <>
            <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/40" />
              {Math.floor(runtime / 60)}h {runtime % 60}m
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50">
        {director && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 shrink-0" />
            <span className="font-medium text-white/70">Directed by</span>
            <span>{director}</span>
          </div>
        )}
        {productionCountries && productionCountries.length > 0 && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{productionCountries.join(', ')}</span>
          </div>
        )}
        {spokenLanguages && spokenLanguages.length > 0 && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 shrink-0" />
            <span>{spokenLanguages.join(', ')}</span>
          </div>
        )}
      </div>
    </>
  );
}
