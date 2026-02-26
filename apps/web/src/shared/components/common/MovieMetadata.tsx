'use client';

import { Calendar, Clock, Star } from 'lucide-react';

interface MovieMetadataProps {
  name: string;
  releaseDate?: string;
  runtime?: number;
  rating?: string;
}

export function MovieMetadata({ name, releaseDate, runtime, rating }: MovieMetadataProps) {
  return (
    <>
      <h1 className="max-w-4xl text-5xl font-black leading-none tracking-tighter text-white drop-shadow-2xl md:text-7xl">
        {name}
      </h1>
      <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-neutral-400">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-primary text-primary" />
          <span className="text-xl text-white">{Number(rating || 0).toFixed(1)}</span>
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/40" />
          {new Date(releaseDate || '').getFullYear()}
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-white/40" />
          {Math.floor((runtime || 0) / 60)}h {(runtime || 0) % 60}m
        </div>
      </div>
    </>
  );
}
