'use client';
import ChannelInfoPanel from '@/components/channels/ChannelInfoPanel';
import ChannelsSidebar from '@/components/channels/ChannelsSidebar';
import PlayerHeader from '@/components/iptv/PlayerHeader';
import EmptyState from '@/components/ui/EmptyState';
import VideoPlayer from '@/features/player/components/VideoPlayer';
import { trpc } from '@/lib/trpc';
import { usePlaylistStore } from '@/store/appStore';
import { usePlayerStore } from '@/store/player-store';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export default function ChannelsPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get('categoryId');
  const selectedChannelId = searchParams.get('channelId');
  const { setSrc, setPoster, setTitle, src, poster, title } = usePlayerStore();

  // Data queries
  const { selectedPlaylist: playlist } = usePlaylistStore();

  const { data: channels, isLoading: isFetchingChannels } = trpc.channels.getChannels.useQuery(
    {
      categoryId: parseInt(selectedCategoryId || '0'),
      playlistId: playlist?.id || 0,
    },
    {
      enabled: !!selectedCategoryId,
    },
  );

  const selectedIndex = useMemo(() => {
    if (!channels || !selectedChannelId) return -1;
    return channels.findIndex((c) => c.id.toString() === selectedChannelId);
  }, [channels, selectedChannelId]);

  const hasPrev = selectedIndex > 0;
  const hasNext = !!channels && selectedIndex >= 0 && selectedIndex < channels.length - 1;

  const playPrevChannel = () => {
    if (!channels || selectedIndex < 0) return;
    const prevIndex = selectedIndex - 1;
    if (prevIndex < 0) return;
    const target = channels[prevIndex];
    const params = new URLSearchParams(searchParams.toString());
    params.set('channelId', target.id.toString());
    router.push(`?${params.toString()}`);
  };

  const playNextChannel = () => {
    if (!channels || selectedIndex < 0) return;
    const nextIndex = selectedIndex + 1;
    if (nextIndex >= channels.length) return;
    const target = channels[nextIndex];
    const params = new URLSearchParams(searchParams.toString());
    params.set('channelId', target.id.toString());
    router.push(`?${params.toString()}`);
  };

  // const handleChannelClick = (channelId: number) => {
  //   const params = new URLSearchParams(searchParams.toString());
  //   params.set('channelId', channelId.toString());
  //   router.push(`?${params.toString()}`);
  // };

  const selectedChannel = channels?.find((chan) => chan.id.toString() === selectedChannelId);
  // Update player when selectedChannel changes
  useEffect(() => {
    if (selectedChannel) {
      setSrc(selectedChannel.url);
      setPoster(selectedChannel.streamIcon || '');
      setTitle(selectedChannel.name);
    }
  }, [selectedChannel, setSrc, setPoster, setTitle]);

  // Check if player has content (either from store or selected channel)
  const hasPlayerContent = !!src || !!selectedChannel;

  if (!playlist) {
    return (
      <EmptyState
        icon="📺"
        title="No Playlists Found"
        description="Please add a playlist to view channels"
        fullScreen
      />
    );
  }

  return (
    <>
      <ChannelsSidebar channels={channels} isLoading={isFetchingChannels} />

      {/* Player Area */}
      <div className="flex-1 flex flex-col">
        {/* Player Header */}
        <PlayerHeader selectedChannel={selectedChannel} />

        {/* Player Content */}
        <div className="flex-1 overflow-y-auto">
          {hasPlayerContent ? (
            <div className="h-full flex flex-col">
              {/* Video Player Area */}
              <div className="h-1/2">
                <VideoPlayer
                  autoPlay
                  src={src}
                  poster={poster}
                  title={title}
                  movieId={null}
                  serieId={null}
                  categoryId={null}
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
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-50">🎬</div>
                <h4 className="text-xl font-semibold text-white mb-2">Ready to Stream</h4>
                <p className="text-gray-400 max-w-md">
                  Select a category and channel to start watching your favorite content
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
