import { ChevronRight, Flame, Folder, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { useAutoScrollToSelected } from '@/hooks/useAutoScrollToSelected';
import { Category } from '@/lib/types';

import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import LoadingSpinner from '../ui/LoadingSpinner';

interface CategoriesSidebarProps {
  categories?: Category[];
  isLoading: boolean;
  selectedCategoryId: string | null;
  categoryType: 'movies' | 'channels' | 'series';
}

export default function CategoriesSidebar({ categories, isLoading, selectedCategoryId, categoryType }: CategoriesSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';
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
    <div className="flex h-full w-96 flex-col border-r border-white/5 bg-background/40 backdrop-blur-xl">
      {/* Search Header */}
      <div className="flex flex-col gap-6 p-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="h-11 rounded-xl border border-white/5 bg-white/5 pl-10 pr-10 text-sm font-medium placeholder:text-muted-foreground/50 transition-all focus:bg-white/10 focus:ring-1 focus:ring-primary/40"
            value={searchValue}
            onChange={handleChange}
          />
          {searchValue && (
            <button
              onClick={() => { setSearchValue(''); setFilteredCategories(categories); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-white/10 text-muted-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>


      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide" ref={categoryRef}>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
             <LoadingSpinner />
          </div>
        ) : !filteredCategories?.length ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
               <Folder className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
               {searchValue ? 'No results found' : 'No categories available'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* "New" Filter */}
            <Link
              href={`/${categoryType}?new=true`}
              className={cn(
                "group relative flex items-center justify-between rounded-xl border border-transparent p-3 transition-all duration-300",
                isNew
                  ? "bg-primary/10 border-primary/20 text-primary shadow-lg shadow-primary/5"
                  : "hover:bg-white/5 hover:border-white/5 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  isNew ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                   <Flame className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold truncate">New {typeName}</span>
              </div>
              <ChevronRight className={cn("h-4 w-4 transition-all", isNew ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0")} />
            </Link>

            {/* Category List */}
            {filteredCategories.map((category) => {
              const isSelected = selectedCategoryId === category.categoryId.toString();

              return (
                <Link
                  key={category.categoryId}
                  href={`/${categoryType}?categoryId=${category.categoryId}`}
                  data-category-id={category.categoryId}
                  className={cn(
                    "group relative flex items-center justify-between rounded-xl border border-transparent p-3 transition-all duration-300",
                    isSelected
                      ? "bg-primary/10 border-primary/20 text-primary shadow-lg shadow-primary/5"
                      : "hover:bg-white/5 hover:border-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      isSelected ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground group-hover:bg-white/10"
                    )}>
                       <Folder className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold truncate">{category.categoryName}</span>
                  </div>
                  <ChevronRight className={cn("h-4 w-4 transition-all", isSelected ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0")} />

                  {isSelected && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-l-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-white/5 p-4 bg-white/5">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          <span>{searchValue ? 'Matches Found' : 'Total Groups'}</span>
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-foreground ring-1 ring-white/10">
            {filteredCategories?.length || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

