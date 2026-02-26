'use client';

import HorizontalCarousel from '../../common/HorizontalCarousel';
import { SearchResultCard } from './SearchResultCard';

interface SearchResultsSectionProps {
  type: 'channels' | 'movies' | 'series';
  results: any[];
  query: string;
  viewMode: 'grid' | 'carousel';
}

export function SearchResultsSection({ type, results, query, viewMode }: SearchResultsSectionProps) {
  if (results.length === 0) return null;

  const typeIcons = {
    channels: '📺',
    movies: '🎬',
    series: '📼',
  };

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-1 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
        <h3 className="text-2xl font-black capitalize tracking-tight text-foreground">
          {type} <span className="text-muted-foreground/40 ml-2">({results.length})</span>
        </h3>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((item) => (
            <SearchResultCard
              key={item.id}
              item={item}
              type={type}
              query={query}
              variant="grid"
            />
          ))}
        </div>
      ) : (
        <HorizontalCarousel scrollBy={800}>
          {results.map((item) => (
            <SearchResultCard
              key={item.id}
              item={item}
              type={type}
              query={query}
              variant="carousel"
            />
          ))}
        </HorizontalCarousel>
      )}
    </section>
  );
}
