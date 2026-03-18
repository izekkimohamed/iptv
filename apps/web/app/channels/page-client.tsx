'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useMemo } from 'react';

import { Tv } from 'lucide-react';

const VideoPlayer = dynamic(() => import('@/features/player/components/VideoPlayer'), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-video items-center justify-center bg-black">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
    </div>
  ),
});
import ChannelInfoPanel from '@/shared/components/channels/ChannelInfoPanel';
import ChannelsSidebar from '@/shared/components/channels/ChannelsSidebar';
import PlayerHeader from '@/shared/components/iptv/PlayerHeader';
import EmptyState from '@/shared/components/ui/EmptyState';
import { trpc } from '@/shared/lib/trpc';
import { usePlayerStore, usePlaylistStore } from '@repo/store';
import ChannelsContentSkeleton from './Skeleton';

function ChannelsPageInner() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get('categoryId');
  const selectedChannelId = searchParams.get('channelId');
  const { setMedia, src, poster, title } = usePlayerStore();

  // Data queries
  const { selectedPlaylist: playlist } = usePlaylistStore();

  const {
    data: infiniteChannels,
    isLoading: isFetchingChannels,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.channels.getChannels.useInfiniteQuery(
    {
      categoryId: parseInt(selectedCategoryId || '0'),
      playlistId: playlist?.id || 0,
      limit: 50,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!selectedCategoryId && !!playlist,
    },
  );

  const channels = useMemo(
    () => infiniteChannels?.pages.flatMap((page) => page.items) || [],
    [infiniteChannels],
  );

  const utils = trpc.useUtils();
  const { mutate: updateCategoryChannels, isPending: isUpdatingCategory } =
    trpc.channels.updateCategoryChannels.useMutation({
      onSuccess: () => {
        // Revalidate the getChannels query for this category
        utils.channels.getChannels.invalidate({
          categoryId: parseInt(selectedCategoryId || '0'),
          playlistId: playlist?.id || 0,
        });
      },
    });

  const handleRefreshCategory = () => {
    if (!playlist || !selectedCategoryId) return;
    updateCategoryChannels({
      playlistId: playlist.id,
      categoryId: parseInt(selectedCategoryId),
      url: playlist.baseUrl,
      username: playlist.username,
      password: playlist.password,
    });
  };

  const selectedIndex = useMemo(() => {
    if (!channels || !selectedChannelId) return -1;
    return channels.findIndex((c) => c.id.toString() === selectedChannelId);
  }, [channels, selectedChannelId]);

  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < channels.length - 1;

  const playPrevChannel = () => {
    if (selectedIndex < 0) return;
    const prevIndex = selectedIndex - 1;
    if (prevIndex < 0) return;
    const target = channels[prevIndex];
    const params = new URLSearchParams(searchParams.toString());
    params.set('channelId', target.id.toString());
    router.push(`?${params.toString()}`);
  };

  const playNextChannel = () => {
    if (selectedIndex < 0) return;
    const nextIndex = selectedIndex + 1;
    if (nextIndex >= channels.length) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
      return;
    }
    const target = channels[nextIndex];
    const params = new URLSearchParams(searchParams.toString());
    params.set('channelId', target.id.toString());
    router.push(`?${params.toString()}`);
  };

  const selectedChannel = useMemo(
    () => channels.find((chan) => chan.id.toString() === selectedChannelId),
    [channels, selectedChannelId],
  );

  // Update player when selectedChannel changes
  useEffect(() => {
    if (selectedChannel) {
      setMedia({
        src: selectedChannel.url,
        poster: selectedChannel.streamIcon || '',
        title: selectedChannel.name,
      });
    }
  }, [selectedChannel, setMedia]);

  // Check if player has content (either from store or selected channel)
  const hasPlayerContent = !!src || !!selectedChannel;

  if (!playlist) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon="📺"
          title="No Playlists Found"
          description="Please add a playlist to view channels"
          fullScreen
        />
      </div>
    );
  }

  return (
    <>
      <ChannelsSidebar
        channels={channels}
        isLoading={isFetchingChannels}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />

      {/* Player Area */}
      <div className="bg-background/50 flex flex-1 flex-col overflow-hidden backdrop-blur-3xl">
        <PlayerHeader
          selectedChannel={selectedChannel}
          selectedCategoryId={selectedCategoryId ? parseInt(selectedCategoryId) : undefined}
          handleRefreshCategory={handleRefreshCategory}
          isUpdatingCategory={isUpdatingCategory}
        />

        {/* Player Content */}
        <div className="scrollbar-hide flex-1 overflow-y-auto">
          {hasPlayerContent ? (
            <div className="flex h-full flex-col">
              {/* Video Player Area */}
              <div className="max-h-1/2">
                <VideoPlayer
                  autoPlay
                  src={src}
                  poster={poster}
                  title={title}
                  movieId={undefined}
                  serieId={undefined}
                  categoryId={undefined}
                  totalEpisodes={0}
                  hasNext={hasNext}
                  hasPrev={hasPrev}
                  playNext={playNextChannel}
                  playPrev={playPrevChannel}
                />
              </div>

              {/* Channel Info */}
              <div className="h-1/2">
                {selectedChannel && (
                  <ChannelInfoPanel
                    selectedChannel={selectedChannel}
                    playlistProps={{
                      url: playlist?.baseUrl,
                      username: playlist?.username,
                      password: playlist?.password,
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-1 items-center justify-center p-8 text-center">
              <div className="max-w-sm space-y-6">
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                  <div className="bg-primary/20 absolute inset-0 animate-pulse rounded-full blur-3xl" />
                  <Tv className="text-muted-foreground/40 relative h-16 w-16" />
                </div>
                <div>
                  <h4 className="text-foreground mb-3 text-2xl font-black">Ready to Stream</h4>
                  <p className="text-muted-foreground font-medium">
                    Select a category and channel from the sidebar to begin your playback
                    experience.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function ChannelsPageContent() {
  return (
    <Suspense fallback={<ChannelsContentSkeleton />}>
      <ChannelsPageInner />
    </Suspense>
  );
}
