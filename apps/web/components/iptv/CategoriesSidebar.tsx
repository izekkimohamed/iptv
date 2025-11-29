import { Search, X } from "lucide-react";
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
  onCategoryClick: (categoryId: number) => void;
}

export default function CategoriesSidebar({
  categories,
  isLoading,
  selectedCategoryId,
  onCategoryClick,
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
      // try to find by id attribute first
      let selectedEl = container.querySelector(
        `[data-category-id="${selectedCategoryId}"]`
      ) as HTMLElement | null;

      // fallback: maybe the page used streamId in the link
      if (!selectedEl) {
        selectedEl = container.querySelector(
          `[data-category-streamid="${selectedCategoryId}"]`
        ) as HTMLElement | null;
      }

      if (!selectedEl) {
        // Could be timing / element not yet rendered. Try again next frame.
        // But also log to help debugging if it truly can't be found.
        requestAnimationFrame(() => {
          const retryEl = container.querySelector(
            `[data-category-id="${selectedCategoryId}"],[data-category-streamid="${selectedCategoryId}"]`
          ) as HTMLElement | null;
          if (retryEl) {
            // center the element in the container
            const offset =
              retryEl.offsetTop -
              container.clientHeight / 2 +
              retryEl.clientHeight / 2;
            container.scrollTo({
              top: Math.max(0, offset),
              behavior: "smooth",
            });
          } else {
            console.warn(
              `categorysSidebar: couldn't find DOM element for selectedCategoryId=${selectedCategoryId}. ` +
                "Check that you pass category.categoryId (not streamId) and that the list has rendered."
            );
          }
        });
        return;
      }

      // center the element vertically inside the container
      const offset =
        selectedEl.offsetTop -
        container.clientHeight / 2 +
        selectedEl.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
    };

    // run scrolling
    scrollToSelected();
    // run once more after a short delay in case layout shifts (images loading etc.)
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
    <div className='w-[350px] h-full flex flex-col relative border-r border-white/10'>
      <div className='border-b rounded-t-sm  border-white/10'>
        <div className='relative w-full'>
          <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
            <Search className='w-5 h-5' />
          </div>
          <input
            className='w-full pl-10 pr-10 py-3.5  rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-0 focus:ring-blue-500 transition-all'
            type='text'
            placeholder='Search categories...'
            value={searchValue}
            onChange={handleChange}
          />
          {searchValue && (
            <button
              onClick={handleClear}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
              title='Clear search'
            >
              <X className='w-5 h-5' />
            </button>
          )}
        </div>
      </div>
      <div
        className='relative flex flex-col flex-1 overflow-y-auto'
        ref={listRef}
      >
        {isLoading ?
          <div className='flex items-center justify-center py-12 '>
            <div className='w-8 h-8 border-b-2 border-purple-500 rounded-full animate-spin'></div>
          </div>
        : !filteredCategories?.length ?
          <div className='px-6 py-12 text-center'>
            <p className='text-gray-400'>No categories available</p>
          </div>
        : <div className='py-2'>
            {filteredCategories.map((category) => (
              <button
                key={category.categoryId}
                onClick={() => onCategoryClick(category.categoryId)}
                className={`w-full text-left px-2 py-3 cursor-pointer hover:bg-white/10 transition-colors border-l-4 ${
                  selectedCategoryId === category.categoryId.toString() ?
                    "border-purple-500 bg-white/10 text-white"
                  : "border-transparent text-gray-300 hover:text-white"
                }`}
                data-category-id={category.categoryId}
                data-category-streamid={category.playlistId}
              >
                <div className='flex items-center space-x-2'>
                  <span className='mr-1'>📁</span>
                  <span className='font-medium truncate'>
                    {category.categoryName}
                  </span>
                </div>
              </button>
            ))}
          </div>
        }
      </div>
      <div className='p-4 border-t rounded-sm bg-white/5 border-white/10'>
        <div className='space-y-1 text-xs text-gray-400'>
          <div className='flex justify-between'>
            <span>Total Categories:</span>
            <span className='font-bold text-white'>
              {filteredCategories?.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
