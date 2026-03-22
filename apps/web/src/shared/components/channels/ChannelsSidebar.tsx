import { Search, Star, Tv, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';

import { Input } from '../ui/input';

import { useAutoScrollToSelected } from '@/shared/hooks/useAutoScrollToSelected';
import { Channel } from '@/shared/lib/types';
import { usePlayerStore } from '@repo/store';

import { cn } from '@/shared/lib/utils';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ChannelsSidebarProps {
  channels?: Channel[];
  isLoading: boolean;
}

function ChannelsSidebarContent({
  channels,
  isLoading,
}: ChannelsSidebarProps) {
  const selectedCategoryId = useSearchParams().get('categoryId');
  const selectedChannelId = useSearchParams().get('channelId');
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const newChannels = useSearchParams().get('new');
  const { setSrc, setTitle } = usePlayerStore();
  const [searchValue, setSearchValue] = useState('');


  useAutoScrollToSelected({
    containerRef: listRef,
    selectedId: selectedChannelId,
    primaryAttr: 'data-channel-id',
    fallbackAttr: 'data-channel-streamid',
    deps: [channels?.length],
    isLoading,
  });

  return (
    <div className="border-border/50 bg-background/50 flex h-full w-72 flex-col border-r">
      {/* Header */}
      <div className="border-border/50 flex flex-col gap-6 border-b px-4 py-6">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search channels..."
            className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring/20 h-11 rounded-sm border pr-10 pl-10 text-sm font-medium focus:ring-2"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="text-muted-foreground hover:bg-accent absolute top-1/2 right-3 -translate-y-1/2 rounded-sm p-1"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Scroll Area */}
      <div
        className="scrollbar-hide flex-1 overflow-y-auto p-2"
        ref={listRef}
      >
        {!selectedCategoryId && !newChannels ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
            <Search className="text-muted-foreground/40 h-12 w-12" />
            <p className="text-muted-foreground text-sm font-medium">
              Select a category to view channels
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : !channels?.length ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
            <Tv className="text-muted-foreground/40 h-12 w-12" />
            <p className="text-muted-foreground text-sm font-medium">
              No channels in this category
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {channels.map((channel, index) => {
              const id = newChannels ? index.toString() : (channel as Channel).id.toString();
              const isSelected = selectedChannelId === id;

              const Content = (
                <div
                  className={cn(
                    'group relative flex items-center gap-2 overflow-hidden rounded-sm border border-transparent p-2 transition-all duration-300',
                    isSelected
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : ' text-foreground border-white/5 bg-white/5',
                  )}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-white/5 bg-white/5 md:h-12 md:w-12">
                    <Image
                      fill
                      sizes="48px"
                      className="object-contain p-1 md:p-2"
                      src={channel.streamIcon || '/icon.png'}
                      alt={channel.name}
                      onError={(e) => {
                        e.currentTarget.src = '/icon.png';
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1 pr-1">
                    <p
                      className={cn(
                        'text-start font-mono font-medium size-fit text-sm',
                        isSelected
                          ? 'text-primary'
                          : 'text-foreground/80 group-hover:text-foreground',
                      )}
                    >
                      {channel.name}
                    </p>
                  </div>

                  {channel.isFavorite && (
                    <Star
                      className={cn(
                        'fill-primary text-primary h-4 w-4 shrink-0',
                        !isSelected && 'opacity-40',
                      )}
                    />
                  )}

                  {isSelected && (
                    <div className="bg-primary absolute top-1/2 left-0 h-full w-1 -translate-y-1/2 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  )}
                </div>
              );

              return newChannels ? (
                <button
                  key={`new-channel-${channel.id || channel.name || index}`}
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
                  key={(channel as Channel).streamId}
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
      <div className="border border-white/5 bg-white/5 p-4">
        <div className="text-muted-foreground/60 flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
          <span>{searchValue ? 'Matches Found' : 'Total Channels'}</span>
          <span className="text-foreground rounded-sm bg-white/5 px-2 py-0.5 ring-1 ring-white/10">
            {channels?.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChannelsSidebar(props: ChannelsSidebarProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-96 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2" />
        </div>
      }
    >
      <ChannelsSidebarContent {...props} />
    </Suspense>
  );
}
