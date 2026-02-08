'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { Tv } from 'lucide-react';

import ChannelInfoPanel from '@/components/channels/ChannelInfoPanel';
import ChannelsSidebar from '@/components/channels/ChannelsSidebar';
import PlayerHeader from '@/components/iptv/PlayerHeader';
import EmptyState from '@/components/ui/EmptyState';
import VideoPlayer from '@/features/player/components/VideoPlayer';
import { trpc } from '@/lib/trpc';
import { usePlayerStore, usePlaylistStore } from '@repo/store';


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
      <ChannelsSidebar channels={channels} isLoading={isFetchingChannels} />

      {/* Player Area */}
      <div className="flex flex-1 flex-col bg-background/50 backdrop-blur-3xl overflow-hidden">
        {/* Player Header */}
        <PlayerHeader selectedChannel={selectedChannel} />

        {/* Player Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {hasPlayerContent ? (
            <div className="flex h-full flex-col">
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
            <div className="flex h-full flex-1 items-center justify-center p-8 text-center">
              <div className="space-y-6 max-w-sm">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                   <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                   <Tv className="relative h-16 w-16 text-muted-foreground/40" />
                </div>
                <div>
                   <h4 className="text-2xl font-black text-foreground mb-3">Ready to Stream</h4>
                   <p className="text-muted-foreground font-medium">
                     Select a category and channel from the sidebar to begin your playback experience.
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
