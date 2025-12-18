import { useAutoScrollToSelected } from '@/hooks/useAutoScrollToSelected';
import { Category } from '@/lib/types';
import { ChevronRight, Folder, Search, X } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface CategoriesSidebarProps {
  categories?: Category[];
  isLoading: boolean;
  selectedCategoryId: string | null;
  categoryType: 'movies' | 'channels' | 'series';
}

export default function CategoriesSidebar(props: CategoriesSidebarProps) {
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
    <div className="w-100 h-full flex flex-col border-r border-white/10 backdrop-blur-sm">
      {/* Search */}
      <div className="px-1 pr-4 py-3 border-b border-white/10">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <Input
            id="search-input"
            placeholder="Search categories..."
            className="w-full pl-10 pr-10 py-2 bg-transparent border rounded-md border-white/15
            focus:ring-1
            active:ring-1 text-sm text-amber-400 placeholder-gray-400 focus:border-amber-400"
            style={{}}
            value={searchValue}
            onChange={handleChange}
            onKeyDown={(e) => e.stopPropagation()}
          />
          {searchValue && (
            <Button
              onClick={() => setSearchValue('')}
              className="absolute bg-transparent rounded-l-none border border-amber-400/10 right-0 text-gray-400 hover:text-amber-400"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-1 py-1" ref={categoryRef}>
        {isLoading ? (
          <LoadingSpinner />
        ) : !filteredCategories?.length ? (
          <div className="text-center py-12 space-y-3 text-gray-400">
            <Folder className="w-8 h-8 mx-auto opacity-40" />
            <p>{searchValue ? 'No categories found' : 'No categories available'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filteredCategories.map((category) => {
              const isSelected = selectedCategoryId === category.categoryId.toString();

              return (
                <Link
                  key={category.categoryId}
                  href={`/${categoryType}?categoryId=${category.categoryId}`}
                  data-category-id={category.categoryId}
                  title={category.categoryName}
                  className={`
                    flex items-center justify-between px-1 py-3 rounded-lg border transition-all
                    ${
                      isSelected
                        ? 'border-amber-500/40 bg-white/15 backdrop-blur-md shadow-md shadow-amber-500/10 text-amber-400'
                        : 'border-white/20  hover:bg-white/5 text-gray-300 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder
                      className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-gray-500'}`}
                    />
                    <span className="truncate font-medium">{category.categoryName}</span>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition ${
                      isSelected
                        ? 'text-amber-400 translate-x-0 opacity-100'
                        : 'text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2'
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Count */}
      <div className="px-4 py-2 border-t border-white/10">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>{searchValue ? 'Matching' : 'Total'}</span>
          <span className="px-3 py-1 border border-white/10 rounded text-white font-semibold">
            {filteredCategories?.length || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
