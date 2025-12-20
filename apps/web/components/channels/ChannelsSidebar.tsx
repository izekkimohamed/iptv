import { useAutoScrollToSelected } from '@/hooks/useAutoScrollToSelected';
import { Channel } from '@/lib/types';
import { usePlaylistStore } from '@/store/appStore';
import { usePlayerStore } from '@/store/player-store';
import { useRecentUpdateStore } from '@/store/recentUpdate';
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
  const newChannels = useSearchParams().get('new');
  const selectedPlaylist = usePlaylistStore((state) => state.selectedPlaylist);
  const recentChannels = useRecentUpdateStore((state) =>
    state.getLatestUpdate(selectedPlaylist?.id),
  );
  const newChannelsData = recentChannels?.newItems.channels || [];
  const { setSrc, setTitle } = usePlayerStore();

  useAutoScrollToSelected({
    containerRef: listRef,
    selectedId: selectedChannelId,
    primaryAttr: 'data-channel-id',
    fallbackAttr: 'data-channel-streamid',
    deps: [channels?.length],
    isLoading,
  });

  return (
    <div className="w-[400px] h-full flex flex-col border-r border-white/10 backdrop-blur-sm">
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
      <div className="flex-1 overflow-y-auto px-2 py-1" ref={listRef}>
        {!selectedCategoryId && !newChannels ? (
          <div className="text-center py-12 flex flex-col items-center space-y-3 text-gray-400">
            <div className="text-4xl opacity-40">📺</div>
            <p>Select a category to view channels</p>
          </div>
        ) : isLoading ? (
          <LoadingSpinner fullScreen />
        ) : !channels?.length && !newChannels ? (
          <div className="text-center py-12 flex flex-col items-center space-y-3 text-gray-400">
            <div className="text-4xl opacity-40">📂</div>
            <p>No channels in this category</p>
          </div>
        ) : newChannels && newChannelsData.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {newChannelsData.map((channel, index) => {
              const isSelected = selectedChannelId === index.toString();
              return (
                <button
                  onClick={() => {
                    setSrc(channel.url);
                    setTitle(channel.name);
                  }}
                  key={index}
                  data-channel-id={index}
                  className={`
                    group grid items-center grid-cols-[65px_1fr_auto] gap-3 rounded-lg border  transition-all overflow-hidden px-0.5
                    ${
                      isSelected
                        ? 'border-amber-500/40 shadow-md bg-white/10 backdrop-blur-md shadow-amber-500/10 text-amber-400'
                        : ' hover:bg-white/10 text-white/90 border-white/20'
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-3 w-[65px] h-[50px] relative  overflow-hidden bg-white/10  ">
                    <Image
                      fill
                      className=" object-cover"
                      src={channel.streamIcon || '/icon.png'}
                      alt={channel.name}
                      onError={(e) => {
                        e.currentTarget.src = '/icon.png';
                      }}
                    />
                  </div>
                  <span className="text-wrap font-medium line-clamp-2 ">{channel.name}</span>

                  {channel.isFavorite && (
                    <span className="text-lg px-2 text-amber-500">
                      <Star className="w-4 h-4" fill="currentColor" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {channels?.map((channel) => {
              const isSelected = selectedChannelId === channel.id.toString();
              return (
                <Link
                  href={`/channels?categoryId=${selectedCategoryId}&channelId=${channel.id}`}
                  key={channel.id}
                  data-channel-id={channel.id}
                  className={`
                    group grid items-center grid-cols-[65px_1fr_auto] gap-3 rounded-lg border  transition-all overflow-hidden px-0.5
                    ${
                      isSelected
                        ? 'border-amber-500/40 shadow-md bg-white/10 backdrop-blur-md shadow-amber-500/10 text-amber-400'
                        : ' hover:bg-white/10 text-white/90 border-white/20'
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-3 w-[65px] h-[50px] relative  overflow-hidden bg-white/10  ">
                    <Image
                      fill
                      className=" object-cover"
                      src={channel.streamIcon || '/icon.png'}
                      alt={channel.name}
                      onError={(e) => {
                        e.currentTarget.src = '/icon.png';
                      }}
                    />
                  </div>
                  <span className="text-wrap font-medium line-clamp-2 ">{channel.name}</span>

                  {channel.isFavorite && (
                    <span className="text-lg px-2 text-amber-500">
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
