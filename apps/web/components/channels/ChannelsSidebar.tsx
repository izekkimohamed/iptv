import { Search, Star, Tv, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Input } from '../ui/input';

import { useAutoScrollToSelected } from '@/hooks/useAutoScrollToSelected';
import { Channel } from '@/lib/types';
import { usePlayerStore, usePlaylistStore } from '@repo/store';

import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ChannelsSidebarProps {
  channels?: Channel[];
  isLoading: boolean;
}

export default function ChannelsSidebar({ channels, isLoading }: ChannelsSidebarProps) {
  const selectedCategoryId = useSearchParams().get('categoryId');
  const selectedChannelId = useSearchParams().get('channelId');
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const newChannels = useSearchParams().get('new');
  const selectedPlaylist = usePlaylistStore((state) => state.selectedPlaylist);
  const { setSrc, setTitle } = usePlayerStore();
  const [searchValue, setSearchValue] = useState('');
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);

    const { data: newChannelsData, isLoading: loadingNewData } = trpc.new.getNewChannels.useQuery(
    {
      playlistId: selectedPlaylist?.id || 0,
    },
    {
      enabled: !!newChannels,
    },
  );

  useEffect(() => {
    const list = newChannels ? newChannelsData : channels;
    if (!list) return;

    if (!searchValue) {
      setFilteredChannels(list as Channel[]);
      return;
    }

    setFilteredChannels(
      (list as Channel[]).filter((c) =>
        c.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  }, [channels, newChannelsData, newChannels, searchValue]);



  useAutoScrollToSelected({
    containerRef: listRef,
    selectedId: selectedChannelId,
    primaryAttr: 'data-channel-id',
    fallbackAttr: 'data-channel-streamid',
    deps: [channels?.length],
    isLoading,
  });

  return (
    <div className="flex h-full w-96 flex-col border-r border-white/5 bg-background/40 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col gap-6 py-6 px-2 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            className="h-11 rounded-sm border border-white/5 bg-white/5 pl-10 pr-10 text-sm font-medium placeholder:text-muted-foreground/50 transition-all focus:bg-white/10 focus:ring-1 focus:ring-primary/40"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 hover:bg-white/10 text-muted-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide" ref={listRef}>
        {!selectedCategoryId && !newChannels ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
               <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full" />
               <Search className="relative h-12 w-12 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Select a category to view channels</p>
          </div>
        ) : isLoading || loadingNewData ? (
          <div className="flex h-full items-center justify-center">
             <LoadingSpinner />
          </div>
        ) : !channels?.length && !newChannelsData ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
             <Tv className="h-12 w-12 text-muted-foreground/40" />
             <p className="text-sm font-medium text-muted-foreground">No channels in this category</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredChannels.map((channel, index) => {
              const id = newChannels ? index.toString() : (channel as Channel).id.toString();
              const isSelected = selectedChannelId === id;

              const Content = (
                <div className={cn(
                  "group relative flex items-center rounded-sm overflow-hidden gap-2 border border-transparent p-2 transition-all duration-300",
                  isSelected
                    ? "bg-primary/10 border-primary/20 text-primary shadow-lg shadow-primary/5"
                    : "bg-white/5 border-white/5 text-muted-foreground text-foreground"
                )}>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-white/5 bg-white/5">
                    <Image
                      fill
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                      src={channel.streamIcon || '/icon.png'}
                      alt={channel.name}
                      onError={(e) => { e.currentTarget.src = '/icon.png' }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-1">
                    <p className={cn(
                      "truncate transition-colors",
                      isSelected ? "text-primary" : "text-foreground/80 group-hover:text-foreground"
                    )}>
                      {channel.name}
                    </p>

                  </div>

                  {channel.isFavorite && (
                    <Star className={cn("h-4 w-4 shrink-0 fill-primary text-primary", !isSelected && "opacity-40")} />
                  )}

                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  )}
                </div>
              );

              return newChannels ? (
                <button
                  key={index}
                  onClick={() => {
                    setSrc(channel.url);
                    setTitle(channel.name);
                  }}
                  data-channel-id={index}
                  className="w-full text-left outline-none"
                >
                  {Content}
                </button>
              ) : (
                <Link
                  key={(channel as Channel).id}
                  href={`/channels?categoryId=${selectedCategoryId}&channelId=${(channel as Channel).id}`}
                  data-channel-id={(channel as Channel).id}
                  className="w-full outline-none"
                >
                  {Content}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border border-white/5 p-4 bg-white/5">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          <span>{searchValue ? 'Matches Found' : 'Total Channels'}</span>
          <span className="rounded-sm bg-white/5 px-2 py-0.5 text-foreground ring-1 ring-white/10">
            {filteredChannels.length}
          </span>
        </div>
      </div>
    </div>
  );
}

