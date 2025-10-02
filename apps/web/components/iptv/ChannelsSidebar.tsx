import Image from "next/image";
import React from "react";

interface Channel {
  id: number;
  name: string;
  streamType: string;
  streamId: number;
  streamIcon?: string;
  categoryId: number;
  playlistId?: number;
  isFavorite: boolean;
  url: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  type: string;
  playlistId: number;
}

interface ChannelsSidebarProps {
  channels?: Channel[];
  isLoading: boolean;
  selectedCategoryId?: string | null;
  selectedChannelId?: string | null;
  selectedCategory?: Category;
  onChannelClick: (channelId: number) => void;
}

export default function ChannelsSidebar({
  channels,
  isLoading,
  selectedCategoryId,
  selectedChannelId,
  selectedCategory,
  onChannelClick,
}: ChannelsSidebarProps) {
  // ref for the scrollable list container (NOT each button)
  const listRef = React.useRef<HTMLDivElement | null>(null);

  // sort by favorite
  const sortedCategories = channels?.toSorted((channel) =>
    channel.isFavorite ? -1 : 1
  );

  return (
    <div className='w-[350px] bg-black/15 backdrop-blur-md border border-white/10 flex flex-col'>
      <div className='p-3 flex items-center justify-between border-b border-white/10'>
        <h2 className='text-xl font-bold text-white'>Channels</h2>
        {selectedCategory ?
          <div>
            <p className='text-gray-400 text-sm mt-1'>
              {channels?.length || 0} channels
            </p>
          </div>
        : ""}
      </div>

      <div className='flex-1 overflow-y-auto' ref={listRef}>
        {!selectedCategoryId ?
          <div className='text-center py-12 px-6 justify-center items-center h-full flex flex-col'>
            <div className='text-4xl mb-4 opacity-50'>📺</div>
            <p className='text-gray-400'>Select a category to view channels</p>
          </div>
        : isLoading ?
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500'></div>
          </div>
        : !sortedCategories?.length ?
          <div className='text-center py-12 px-6'>
            <div className='text-4xl mb-4 opacity-50'>📂</div>
            <p className='text-gray-400'>No channels in this category</p>
          </div>
        : <div className='py-2'>
            {sortedCategories.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelClick(channel.id)}
                className={`w-full text-left px-2 py-3 cursor-pointer hover:bg-white/10 transition-colors border-l-4 ${
                  selectedChannelId === channel.id.toString() ?
                    "border-purple-500 bg-white/10 text-white"
                  : "border-transparent text-gray-300 hover:text-white"
                }`}
                data-channel-id={channel.id}
                data-channel-streamid={channel.streamId}
              >
                <div className='flex items-center space-x-3'>
                  {channel.streamIcon ?
                    <Image
                      width={60}
                      height={60}
                      src={channel.streamIcon}
                      alt={channel.name}
                      className='rounded w-auto h-auto'
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  : <div className='w-8 h-8 bg-gray-600 rounded flex items-center justify-center flex-shrink-0'>
                      <span className='text-xs text-gray-300'>📺</span>
                    </div>
                  }
                  <div className='flex-1 min-w-0 flex justify-between items-center'>
                    <div className='truncate font-medium'>{channel.name}</div>
                    <div className='flex items-center space-x-2 text-xs text-gray-500 '>
                      {channel.isFavorite && (
                        <span className='text-yellow-400 text-lg'>♥️</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
