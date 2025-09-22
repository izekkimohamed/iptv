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
  return (
    <div className='w-80 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col'>
      <div className='px-6 py-4 border-b border-white/10'>
        <h1 className='text-2xl font-bold text-white'>Categories</h1>
        <p className='text-gray-400 text-sm mt-1'>
          {categories?.length || 0} available
        </p>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {isLoading ?
          <div className='flex items-center justify-center py-12'>
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
    </div>
  );
}
