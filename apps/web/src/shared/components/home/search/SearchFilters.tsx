import { LayoutGrid, Rows3 } from 'lucide-react';

import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

type FilterType = 'all' | 'channels' | 'movies' | 'series';

interface SearchFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: Record<FilterType, number>;
  viewMode: 'grid' | 'carousel';
  onViewModeChange: (mode: 'grid' | 'carousel') => void;
}

const filters = [
  { id: 'all', label: 'All', icon: '🎯' },
  { id: 'channels', label: 'Channels', icon: '📺' },
  { id: 'movies', label: 'Movies', icon: '🎬' },
  { id: 'series', label: 'Series', icon: '📼' },
] as const;

export function SearchFilters({
  activeFilter,
  onFilterChange,
  counts,
  viewMode,
  onViewModeChange,
}: SearchFiltersProps) {
  return (
    <>
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id as FilterType)}
            className={cn(
              'flex items-center gap-2.5 rounded-sm border px-5 py-2.5 text-sm font-bold transition-all duration-300',
              activeFilter === filter.id
                ? 'border-primary/50 bg-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]'
                : 'border-white/5 bg-white/5 text-muted-foreground hover:border-white/10 hover:bg-white/10 hover:text-foreground'
            )}
          >
            <span className="text-lg opacity-80">{filter.icon}</span>
            {filter.label}
            <span
              className={cn(
                'ml-1 rounded-full px-2 py-0.5 text-[10px] font-black',
                activeFilter === filter.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/10 text-muted-foreground'
              )}
            >
              {counts[filter.id as FilterType]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-sm border border-white/5 bg-white/5 p-1.5 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('carousel')}
          className={cn(
            'rounded-sm px-4 transition-all duration-300',
            viewMode === 'carousel'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'hover:bg-white/5'
          )}
        >
          <Rows3 className="mr-2 h-4 w-4" />
          Carousel
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className={cn(
            'rounded-sm px-4 transition-all duration-300',
            viewMode === 'grid'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'hover:bg-white/5'
          )}
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          Grid
        </Button>
      </div>
    </>
  );
}
