'use client';

import { Play, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';

interface SearchResultCardProps {
  item: {
    id: number;
    name?: string;
    plot?: string;
    streamIcon?: string;
    cover?: string;
    rating?: string;
    categoryId?: number;
    streamId?: number;
    seriesId?: number;
  };
  type: 'channels' | 'movies' | 'series';
  query: string;
  variant?: 'grid' | 'carousel';
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  const q = query.trim();
  try {
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <span key={`highlight-${i}-${part}`} className="rounded bg-primary/20 px-1 text-primary">
          {part}
        </span>
      ) : (
        <span key={`text-${i}-${part}`}>{part}</span>
      ),
    );
  } catch {
    return text;
  }
}

const SearchResultCardComponent = ({ item, type, query, variant = 'carousel' }: SearchResultCardProps) => {
  const imageSrc = type === 'channels' 
    ? (item.streamIcon || '/icon.png') 
    : type === 'movies' 
      ? (item.streamIcon || '/icon.png') 
      : (item.cover || '/icon.png');

  const href = type === 'channels' 
    ? `/channels?categoryId=${item.categoryId}&channelId=${item.id}` 
    : type === 'movies' 
      ? `/movies?categoryId=${item.categoryId}&movieId=${item.streamId}` 
      : `/series?categoryId=${item.categoryId}&serieId=${item.seriesId}`;

  const isGrid = variant === 'grid';

  return (
    <Link
      href={href}
      className={`group relative ${isGrid ? '' : 'w-48 shrink-0 lg:w-56'}`}
    >
      <div 
        className={`relative overflow-hidden rounded-sm border border-white/5 bg-white/5 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.1)] ${
          isGrid ? 'aspect-[2/3]' : 'aspect-[2/3]'
        }`}
      >
        <Image
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          src={imageSrc}
          alt={item.name || ''}
          onError={(e) => { e.currentTarget.src = '/icon.png'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

        {item.rating && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-sm bg-black/40 px-2 py-1 text-[10px] font-black text-amber-400 backdrop-blur-md border border-white/5">
            <Star className="h-3 w-3 fill-current" />
            {parseFloat(item.rating).toFixed(1)}
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <div className={`rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-2xl ${
            isGrid ? 'h-14 w-14 scale-75 group-hover:scale-100' : 'h-12 w-12'
          } transition-transform`}>
            <Play className={`fill-current ${isGrid ? 'ml-1 h-8 w-8' : 'ml-0.5 h-6 w-6'}`} />
          </div>
        </div>
      </div>
      <div className={`${isGrid ? 'mt-3' : 'mt-3'}`}>
        <p className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
          {highlightText(item.name || item.plot || '', query)}
        </p>
      </div>
    </Link>
  );
};

export const SearchResultCard = memo(SearchResultCardComponent);
