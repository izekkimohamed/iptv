import Image from "next/image";
import React, { useEffect } from "react";
import { Button } from "../ui/button";

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
  const listRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedCategoryId || !listRef.current || !channels?.length) {
      return;
    }

    const container = listRef.current;

    const scrollToSelected = () => {
      // try to find by id attribute first
      let selectedEl = container.querySelector(
        `[data-channel-id="${selectedChannelId}"]`
      ) as HTMLElement | null;

      // fallback: maybe the page used streamId in the link
      if (!selectedEl) {
        selectedEl = container.querySelector(
          `[data-channel-streamid="${selectedChannelId}"]`
        ) as HTMLElement | null;
      }

      if (!selectedEl) {
        // Could be timing / element not yet rendered. Try again next frame.
        // But also log to help debugging if it truly can't be found.
        requestAnimationFrame(() => {
          const retryEl = container.querySelector(
            `[data-channel-id="${selectedChannelId}"],[data-channel-streamid="${selectedChannelId}"]`
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
              `channelsSidebar: couldn't find DOM element for selectedChannelId=${selectedChannelId}. ` +
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
  }, [selectedCategoryId, channels?.length, isLoading]);

  return (
    <div className='w-[350px]  backdrop-blur-md border border-white/10 flex flex-col'>
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
        : !channels?.length ?
          <div className='text-center py-12 px-6'>
            <div className='text-4xl mb-4 opacity-50'>📂</div>
            <p className='text-gray-400'>No channels in this category</p>
          </div>
        : <div className='py-2'>
            {channels.map((channel) => (
              <Button
                key={channel.id}
                onClick={() => onChannelClick(channel.id)}
                className={`w-full text-left cursor-pointer hover:bg-white/10 transition-colors border-l-4 bg-transparent rounded-none ${
                  selectedChannelId === channel.id.toString() ?
                    "border-purple-500 bg-white/10 text-white"
                  : "border-transparent text-gray-300 hover:text-white"
                }`}
                data-channel-id={channel.id}
                data-channel-streamid={channel.streamId}
              >
                <div className='flex relative items-center justify-between w-full space-x-3  '>
                  {channel.streamIcon ?
                    <Image
                      width={40}
                      height={40}
                      src={channel.streamIcon.trim()}
                      alt={channel.name}
                      className='rounded '
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  : <div className='w-8 h-8 bg-gray-600 rounded flex items-center justify-center flex-shrink-0'>
                      <span className='text-xs text-gray-300'>📺</span>
                    </div>
                  }
                  <div className='flex-1 min-w-0 flex justify-between items-center'>
                    <div
                      className='truncate text-lg
                     font-medium'
                    >
                      {channel.name}
                    </div>
                    <div className='flex items-center space-x-2 text-xs text-gray-500 '>
                      {channel.isFavorite && (
                        <span className='text-yellow-400 text-lg'>♥️</span>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
