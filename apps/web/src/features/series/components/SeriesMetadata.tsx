'use client';

import { Calendar, Clock, Play, Star, Tag, Tv, Globe, Users } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/shared/components/ui/button';

interface SeriesMetadataProps {
  name: string;
  rating?: string;
  tmdb?: {
    title?: string;
    releaseDate?: string;
    genres?: { id: number; name: string }[];
    voteAverage?: number | null;
    voteCount?: number | null;
    status?: string | null;
    numberOfSeasons?: number | null;
    numberOfEpisodes?: number | null;
    networks?: { name: string; logo: string | null }[] | null;
    createdBy?: string[] | null;
    runtime?: number | null;
    originalLanguage?: string | null;
  };
  seasons: number[];
}

export function SeriesMetadata({ name, rating, tmdb, seasons }: SeriesMetadataProps) {
  const displayRating = tmdb?.voteAverage ?? (rating ? parseFloat(rating) : null);
  const displayVoteCount = tmdb?.voteCount;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl drop-shadow-2xl">
          {name}
        </h1>
      </div>
      {tmdb?.title && tmdb.title !== name && (
        <p className="text-xl font-medium text-primary/80 italic tracking-tight">
          {tmdb.title}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {tmdb?.releaseDate && (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-bold text-foreground/80 backdrop-blur-md">
            <Calendar className="h-4 w-4" />
            {new Date(tmdb.releaseDate).getFullYear()}
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-bold text-foreground/80 backdrop-blur-md">
          <Tv className="h-4 w-4" />
          {tmdb?.numberOfSeasons ?? seasons.length} Seasons
        </div>
        {tmdb?.numberOfEpisodes && (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-bold text-foreground/80 backdrop-blur-md">
            <Clock className="h-4 w-4" />
            {tmdb.numberOfEpisodes} Episodes
          </div>
        )}
        {displayRating !== null && (
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-black text-primary backdrop-blur-md">
            <Star className="h-4 w-4 fill-current" />
            {displayRating.toFixed(1)}
            {displayVoteCount && (
              <span className="text-primary/60 text-xs font-medium">({displayVoteCount.toLocaleString()})</span>
            )}
          </div>
        )}
        {tmdb?.status && (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-bold text-foreground/80 backdrop-blur-md">
            {tmdb.status}
          </div>
        )}
        {tmdb?.originalLanguage && (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-bold text-foreground/80 backdrop-blur-md uppercase">
            <Globe className="h-4 w-4" />
            {tmdb.originalLanguage}
          </div>
        )}
      </div>

      {tmdb?.networks && tmdb.networks.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {tmdb.networks.map((network) => (
            network.logo ? (
              <div key={network.name} className="relative h-7 w-16 rounded-sm bg-white/10 p-1">
                <Image fill sizes="64px" src={network.logo} alt={network.name} className="object-contain" />
              </div>
            ) : (
              <span key={network.name} className="rounded-sm border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-foreground/60">
                {network.name}
              </span>
            )
          ))}
        </div>
      )}

      {tmdb?.createdBy && tmdb.createdBy.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <Users className="h-4 w-4 shrink-0" />
          <span className="font-medium">Created by</span>
          <span>{tmdb.createdBy.join(', ')}</span>
        </div>
      )}

      {tmdb?.genres && (
        <div className="flex flex-wrap gap-2">
          {tmdb.genres.map((genre: { id: number; name: string }) => (
            <span key={genre.id} className="rounded-sm border border-white/5 bg-white/5 px-3 py-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {genre.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface SeriesActionsProps {
  episodeToPlay: { isResume: boolean } | null;
  onPlay: () => void;
}

export function SeriesActions({ episodeToPlay, onPlay }: SeriesActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 pt-4">
      <Button
        onClick={onPlay}
        className="h-16 rounded-sm px-10 text-lg font-black shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
      >
        <Play className="mr-3 h-6 w-6 fill-current" />
        {episodeToPlay?.isResume ? 'Resume' : 'Start Watching'}
      </Button>

      <Button variant="outline" className="h-16 rounded-sm border-white/10 bg-white/5 px-8 text-lg font-bold backdrop-blur-md transition-all hover:bg-white/10 active:scale-95">
        <Tag className="mr-2 h-5 w-5" />
        Add to List
      </Button>
    </div>
  );
}

interface SeriesDescriptionProps {
  description?: string;
  overview?: string;
}

export function SeriesDescription({ description, overview }: SeriesDescriptionProps) {
  return (
    <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl font-medium">
      {description || overview || "No description available for this series."}
    </p>
  );
}
