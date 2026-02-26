import { ChevronRight, Folder, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useRef, useState } from 'react';

import { useAutoScrollToSelected } from '@/shared/hooks/useAutoScrollToSelected';
import { Category } from '@/shared/lib/types';

import { cn } from '@/shared/lib/utils';
import { Input } from '../ui/input';
import LoadingSpinner from '../ui/LoadingSpinner';

interface CategoriesSidebarProps {
  categories?: Category[];
  isLoading: boolean;
  categoryType: 'movies' | 'channels' | 'series';
}

function CategoriesSidebarContent({
  categories,
  isLoading,
  categoryType,
}: Omit<CategoriesSidebarProps, 'selectedCategoryId'>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get('categoryId');
  const categoryRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[] | undefined>([]);

  useEffect(() => setFilteredCategories(categories || []), [categories]);

  useAutoScrollToSelected({
    containerRef: categoryRef,
    selectedId: selectedCategoryId,
    primaryAttr: 'data-category-id',
    fallbackAttr: 'data-category-streamid',
    deps: [filteredCategories?.length],
    isLoading,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setFilteredCategories(
      categories?.filter((category) =>
        category.categoryName.toLowerCase().includes(value.toLowerCase()),
      ) || [],
    );
  };

  const typeName = categoryType.charAt(0).toUpperCase() + categoryType.slice(1);

  return (
    <div className="border-border/50 bg-background/50 flex h-full w-72 flex-col border-r">
      {/* Search Header */}
      <div className="border-border/50 flex flex-col gap-6 border-b px-4 py-6">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search categories..."
            className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring/20 h-11 rounded-sm border pr-10 pl-10 text-sm font-medium focus:ring-2"
            value={searchValue}
            onChange={handleChange}
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue('');
                setFilteredCategories(categories);
              }}
              className="text-muted-foreground hover:bg-accent absolute top-1/2 right-3 -translate-y-1/2 rounded-sm p-1"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="scrollbar-hide flex-1 overflow-y-auto p-2" ref={categoryRef}>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : !filteredCategories?.length ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-sm">
              <Folder className="text-muted-foreground/40 h-6 w-6" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              {searchValue ? 'No results found' : 'No categories available'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {/* Category List */}
            {filteredCategories.map((category) => {
              const isSelected = selectedCategoryId === category.categoryId.toString();

              return (
                <Link
                  key={category.categoryId}
                  href={`/${categoryType}?categoryId=${category.categoryId}`}
                  data-category-id={category.categoryId}
                  className={cn(
                    'group relative flex items-center justify-between overflow-hidden rounded-sm border border-transparent p-2 transition-all duration-300',
                    isSelected
                      ? 'bg-primary/10 border-primary/20 text-primary shadow-primary/5 shadow-lg'
                      : 'text-foreground border-white/5 bg-white/5',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-sm transition-colors md:h-12 md:w-12',
                        isSelected
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground bg-white/5 group-hover:bg-white/10',
                      )}
                    >
                      <Folder className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <span className="text-start font-mono font-medium size-fit">{category.categoryName}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-all',
                      isSelected
                        ? 'opacity-100'
                        : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
                    )}
                  />

                  {isSelected && (
                    <div className="bg-primary absolute top-1/2 left-0 h-full w-1 -translate-y-1/2 rounded-l-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border border-white/5 bg-white/5 p-4">
        <div className="text-muted-foreground/60 flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
          <span>{searchValue ? 'Matches Found' : 'Total Groups'}</span>
          <span className="text-foreground rounded-sm bg-white/5 px-2 py-0.5 ring-1 ring-white/10">
            {filteredCategories?.length || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesSidebar(props: CategoriesSidebarProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-96 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2" />
        </div>
      }
    >
      <CategoriesSidebarContent {...props} />
    </Suspense>
  );
}
