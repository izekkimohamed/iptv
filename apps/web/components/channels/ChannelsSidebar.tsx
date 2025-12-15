import { useAutoScrollToSelected } from '@/hooks/useAutoScrollToSelected';
import { Channel } from '@/lib/types';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ChannelsSidebarProps {
  channels?: Channel[];
  isLoading: boolean;
}

export default function ChannelsSidebar(props: ChannelsSidebarProps) {
  const { channels, isLoading } = props;
  const selectedCategoryId = useSearchParams().get('categoryId');
  const selectedChannelId = useSearchParams().get('channelId');
  const listRef = React.useRef<HTMLDivElement | null>(null);

  useAutoScrollToSelected({
    containerRef: listRef,
    selectedId: selectedChannelId,
    primaryAttr: 'data-channel-id',
    fallbackAttr: 'data-channel-streamid',
    deps: [channels?.length],
    isLoading,
  });

  return (
    <div className="max-w-[400px] h-full flex flex-col border-r border-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-white/90">Channels</h2>

        {selectedCategoryId && (
          <span className="text-xs px-2 py-1 rounded border border-white/10 text-gray-400">
            {channels?.length || 0}
          </span>
        )}
      </div>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3" ref={listRef}>
        {!selectedCategoryId ? (
          <div className="text-center py-12 flex flex-col items-center space-y-3 text-gray-400">
            <div className="text-4xl opacity-40">📺</div>
            <p>Select a category to view channels</p>
          </div>
        ) : isLoading ? (
          <LoadingSpinner />
        ) : !channels?.length ? (
          <div className="text-center py-12 flex flex-col items-center space-y-3 text-gray-400">
            <div className="text-4xl opacity-40">📂</div>
            <p>No channels in this category</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {channels.map((channel) => {
              const isSelected = selectedChannelId === channel.id.toString();
              return (
                <Link
                  href={`/channels?categoryId=${selectedCategoryId}&channelId=${channel.id}`}
                  key={channel.id}
                  data-channel-id={channel.id}
                  className={`
                    group grid items-center grid-cols-[65px_1fr_auto] gap-3 px-3 py-2 rounded-lg border transition-all
                    ${
                      isSelected
                        ? 'border-amber-500/40 shadow-md bg-amber-500/10 backdrop-blur-sm shadow-amber-500/10 text-amber-100'
                        : 'border-transparent hover:border-white/10 hover:bg-white/5 text-gray-300 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 w-[65px] h-[50px] relative rounded-md overflow-hidden bg-white/10 ">
                    {channel.streamIcon ? (
                      <Image
                        fill
                        src={channel.streamIcon}
                        alt={channel.name}
                        className="object-center object-contain p-1 scale-110"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                        <span className="text-lg">📺</span>
                      </div>
                    )}
                  </div>
                  <span className="text-wrap font-medium line-clamp-2">{channel.name}</span>

                  {channel.isFavorite && (
                    <span className="text-amber-400 text-lg">
                      <Star className="w-4 h-4" fill="currentColor" />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
