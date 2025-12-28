import { ChevronRight, Folder, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { useAutoScrollToSelected } from '@/hooks/useAutoScrollToSelected';
import { Category } from '@/lib/types';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import LoadingSpinner from '../ui/LoadingSpinner';

interface CategoriesSidebarProps {
  categories?: Category[];
  isLoading: boolean;
  selectedCategoryId: string | null;
  categoryType: 'movies' | 'channels' | 'series';
}

export default function CategoriesSidebar(props: CategoriesSidebarProps) {
  const pathname = usePathname();
  const newChannels = useSearchParams().get('new');
  const { categories, isLoading, selectedCategoryId, categoryType } = props;
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

  return (
    <div className="flex h-full w-100 flex-col border-r border-white/10 backdrop-blur-sm">
      {/* Search */}
      <div className="border-b border-white/10 px-1 py-3 pr-4">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <Input
            id="search-input"
            placeholder="Search categories..."
            className="w-full rounded-md border border-white/15 bg-transparent py-2 pr-10 pl-10 text-sm text-amber-400 placeholder-gray-400 focus:border-amber-400 focus:ring-1 active:ring-1"
            style={{}}
            value={searchValue}
            onChange={handleChange}
            onKeyDown={(e) => e.stopPropagation()}
          />
          {searchValue && (
            <Button
              onClick={() => setSearchValue('')}
              className="absolute right-0 rounded-l-none border border-amber-400/10 bg-transparent text-gray-400 hover:text-amber-400"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-1 py-1" ref={categoryRef}>
        {isLoading ? (
          <LoadingSpinner />
        ) : !filteredCategories?.length ? (
          <div className="space-y-3 py-12 text-center text-gray-400">
            <Folder className="mx-auto h-8 w-8 opacity-40" />
            <p>{searchValue ? 'No categories found' : 'No categories available'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Link
              href={`/${pathname.split('/')[1]}?new=true`}
              data-category-id="new"
              title="New"
              className={`flex items-center justify-between rounded-lg border px-1 py-3 transition-all ${
                newChannels
                  ? 'border-amber-500/40 bg-white/15 text-amber-400 shadow-md shadow-amber-500/10 backdrop-blur-md'
                  : 'border-white/20 text-gray-300 hover:bg-white/5 hover:text-white'
              } `}
            >
              <div className="flex min-w-0 items-center gap-2">
                <Folder className={`h-4 w-4 text-gray-500`} />
                <span className="truncate font-medium">
                  New{' '}
                  {pathname.split('/')[1]?.charAt(0).toUpperCase() +
                    pathname.split('/')[1]?.slice(1)}
                </span>{' '}
              </div>

              <ChevronRight
                className={`h-4 w-4 -translate-x-2 text-gray-500 transition group-hover:text-white`}
              />
            </Link>
            {filteredCategories.map((category) => {
              const isSelected = selectedCategoryId === category.categoryId.toString();

              return (
                <Link
                  key={category.categoryId}
                  href={`/${categoryType}?categoryId=${category.categoryId}`}
                  data-category-id={category.categoryId}
                  title={category.categoryName}
                  className={`flex items-center justify-between rounded-lg border px-1 py-3 transition-all ${
                    isSelected
                      ? 'border-amber-500/40 bg-white/15 text-amber-400 shadow-md shadow-amber-500/10 backdrop-blur-md'
                      : 'border-white/20 text-gray-300 hover:bg-white/5 hover:text-white'
                  } `}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Folder
                      className={`h-4 w-4 ${isSelected ? 'text-amber-400' : 'text-gray-500'}`}
                    />
                    <span className="truncate font-medium">{category.categoryName}</span>
                  </div>

                  <ChevronRight
                    className={`h-4 w-4 transition ${
                      isSelected
                        ? 'translate-x-0 text-amber-400 opacity-100'
                        : '-translate-x-2 text-gray-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Count */}
      <div className="border-t border-white/10 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{searchValue ? 'Matching' : 'Total'}</span>
          <span className="rounded border border-white/10 px-3 py-1 font-semibold text-white">
            {filteredCategories?.length || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
