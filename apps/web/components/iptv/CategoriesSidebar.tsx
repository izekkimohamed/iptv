import { Search, X, Folder, ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

interface Category {
  categoryId: number;
  categoryName: string;
  type: string;
  playlistId: number;
}

interface CategoriesSidebarProps {
  categories?: Category[];
  isLoading: boolean;
  selectedCategoryId?: string | null;
  categoryType: "movies" | "channels" | "series";
}

export default function CategoriesSidebar({
  categories,
  isLoading,
  selectedCategoryId,
  categoryType,
}: CategoriesSidebarProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");

  const [filteredCategories, setFilteredCategories] = useState<
    Category[] | undefined
  >(undefined);

  useEffect(() => {
    if (!selectedCategoryId || !listRef.current || !categories?.length) {
      return;
    }

    const container = listRef.current;

    const scrollToSelected = () => {
      let selectedEl = container.querySelector(
        `[data-category-id="${selectedCategoryId}"]`
      ) as HTMLElement | null;

      if (!selectedEl) {
        selectedEl = container.querySelector(
          `[data-category-streamid="${selectedCategoryId}"]`
        ) as HTMLElement | null;
      }

      if (!selectedEl) {
        requestAnimationFrame(() => {
          const retryEl = container.querySelector(
            `[data-category-id="${selectedCategoryId}"],[data-category-streamid="${selectedCategoryId}"]`
          ) as HTMLElement | null;
          if (retryEl) {
            const offset =
              retryEl.offsetTop -
              container.clientHeight / 2 +
              retryEl.clientHeight / 2;
            container.scrollTo({
              top: Math.max(0, offset),
              behavior: "smooth",
            });
          }
        });
        return;
      }

      const offset =
        selectedEl.offsetTop -
        container.clientHeight / 2 +
        selectedEl.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
    };

    scrollToSelected();
    const t = window.setTimeout(scrollToSelected, 120);

    return () => {
      window.clearTimeout(t);
    };
  }, [selectedCategoryId, categories?.length, isLoading]);

  useEffect(() => {
    setFilteredCategories(categories || []);
  }, [categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setFilteredCategories(
      categories?.filter((category) =>
        category.categoryName.toLowerCase().includes(value.toLowerCase())
      ) || []
    );
  };

  const handleClear = () => {
    setSearchValue("");
    setFilteredCategories(categories || []);
  };

  return (
    <div className='w-[340px] h-full flex flex-col bg-gradient-to-b from-slate-900/40 to-slate-950 border-r border-white/10 relative overflow-hidden'>
      {/* Background gradient effect */}
      <div className='absolute inset-0 bg-gradient-to-b  pointer-events-none' />

      {/* Search Section */}
      <div className='relative z-10 p-1.5 border-b border-white/10 '>
        <div className=''>
          <div className='relative group'>
            <div className='absolute inset-0  rounded-lg blur opacity-0 group-focus-within:opacity-40 transition-opacity duration-300' />
            <div className='relative flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 group-hover:border-white/20 rounded-lg transition-all duration-300'>
              <Search className='w-4 h-4 text-gray-400 flex-shrink-0' />
              <input
                className='flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm font-medium'
                type='text'
                placeholder='Search...'
                value={searchValue}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key.toLowerCase() === "f") {
                    e.stopPropagation();
                  }
                }}
              />
              {searchValue && (
                <button
                  onClick={handleClear}
                  className='p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all duration-200'
                  title='Clear search'
                >
                  <X className='w-4 h-4' />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div
        className='relative flex-1 overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent'
        ref={listRef}
      >
        {isLoading ?
          <div className='flex items-center justify-center py-16'>
            <div className='space-y-3 text-center'>
              <div className='w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto' />
              <p className='text-xs text-gray-500 font-medium'>
                Loading categories...
              </p>
            </div>
          </div>
        : !filteredCategories?.length ?
          <div className='flex items-center justify-center py-16 px-4'>
            <div className='text-center space-y-2'>
              <Folder className='w-8 h-8 text-gray-600 mx-auto opacity-50' />
              <p className='text-sm text-gray-400 font-medium'>
                {searchValue ?
                  "No categories found"
                : "No categories available"}
              </p>
            </div>
          </div>
        : <div className='py-2 px-2 space-y-1'>
            {filteredCategories.map((category) => {
              const isSelected =
                selectedCategoryId === category.categoryId.toString();

              return (
                <Link
                  href={`/${categoryType}?categoryId=${category.categoryId}`}
                  key={category.categoryId}
                  // onClick={() => onCategoryClick(category.categoryId)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-300 flex items-center justify-between group relative overflow-hidden cursor-pointer ${
                    isSelected ?
                      "border border-blue-500/40 text-white shadow-lg shadow-blue-500/10"
                    : "text-gray-300 hover:text-white border border-transparent hover:bg-white/10 hover:border-white/20"
                  }`}
                  data-category-id={category.categoryId}
                  data-category-streamid={category.playlistId}
                >
                  {/* Active indicator line */}
                  {isSelected && (
                    <div className='absolute left-0 top-0 bottom-0 w-1 bg-blue-500/40' />
                  )}

                  {/* Content */}
                  <div className='flex items-center gap-2 min-w-0'>
                    <Folder
                      className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                        isSelected ? "text-blue-400" : (
                          "text-gray-500 group-hover:text-gray-400"
                        )
                      }`}
                    />
                    <span className='font-medium text-sm truncate'>
                      {category.categoryName}
                    </span>
                  </div>

                  {/* Chevron */}
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                      isSelected ?
                        "text-blue-400 translate-x-0 opacity-100"
                      : "text-gray-500 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        }
      </div>

      {/* Footer Stats */}
      <div className='relative z-10 p-4 border-t border-white/10'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-gray-500 font-medium'>
              {searchValue ? "Matching" : "Total"}
            </span>
            <span className='inline-flex items-center justify-center w-10 h-10 rounded-sm bg-white/10  text-white text-xs font-bold'>
              {filteredCategories?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
