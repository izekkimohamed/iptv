import React from "react";

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
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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
  return (
    <div className='w-[350px] bg-white/10 backdrop-blur-md rounded-sm border border-white/20  flex flex-col relative'>
      <div className='px-4 py-3 bg-purple-500/5 rounded-t-sm border-b border-white/10'>
        <h3 className='text-lg font-semibold text-white'>Categories</h3>
      </div>
      <div
        className='flex-1 overflow-y-auto flex flex-col relative'
        ref={listRef}
      >
        {isLoading ?
          <div className='flex items-center justify-center py-12 '>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500'></div>
          </div>
        : !categories?.length ?
          <div className='text-center py-12 px-6'>
            <p className='text-gray-400'>No categories available</p>
          </div>
        : <div className='py-2'>
            {categories.map((category) => (
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
                  <span className='truncate font-medium'>
                    {category.categoryName}
                  </span>
                </div>
              </button>
            ))}
          </div>
        }
      </div>
      <div className=' p-4 bg-white/5 rounded-sm border-t border-white/10'>
        <div className='space-y-1 text-xs text-gray-400'>
          <div className='flex justify-between'>
            <span>Total Categories:</span>
            <span className='text-white font-bold'>{categories?.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
