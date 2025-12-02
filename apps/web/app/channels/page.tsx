"use client";

import CategoriesSidebar from "@/components/iptv/CategoriesSidebar";
import ChannelInfoPanel from "@/components/iptv/ChannelInfoPanel";
import ChannelsSidebar from "@/components/iptv/ChannelsSidebar";
import PlayerHeader from "@/components/iptv/PlayerHeader";
import VideoPlayer from "@/components/videoPlayer";
import EmptyState from "@/components/ui/EmptyState";
import { trpc } from "@/lib/trpc";
import { usePlaylistStore } from "@/store/appStore";
import { useRouter, useSearchParams } from "next/navigation";
import { usePlayerStore } from "@/store/player-store";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ChannelsPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("categoryId");
  const selectedChannelId = searchParams.get("channelId");
  const { setSrc, setPoster, setTitle, src, poster, title, clearPlayer } =
    usePlayerStore();

  // Data queries
  const { selectedPlaylist: playlist } = usePlaylistStore();

  const { data: categories, isLoading: isFetchingCategories } =
    trpc.channels.getCategories.useQuery(
      {
        playlistId: playlist?.id || 0,
      },
      {
        enabled: !!playlist,
      }
    );

  const { data: channels, isLoading: isFetchingChannels } =
    trpc.channels.getChannels.useQuery(
      {
        categoryId: parseInt(selectedCategoryId || "0"),
        playlistId: playlist?.id || 0,
      },
      {
        enabled: !!selectedCategoryId,
      }
    );

  // Event handlers
  const handleCategoryClick = (categoryId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("categoryId", categoryId.toString());
    params.delete("channelId");
    router.push(`?${params.toString()}`);
  };

  const handleChannelClick = (channelId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("channelId", channelId.toString());
    router.push(`?${params.toString()}`);
  };

  // Derived data
  const selectedCategory = categories?.find(
    (cat) => cat.categoryId.toString() === selectedCategoryId
  );

  const selectedChannel = channels?.find(
    (chan) => chan.id.toString() === selectedChannelId
  );
  // Update player when selectedChannel changes
  useEffect(() => {
    if (selectedChannel) {
      setSrc(selectedChannel.url);
      setPoster(selectedChannel.streamIcon || "");
      setTitle(selectedChannel.name);
    }
  }, [selectedChannel, setSrc, setPoster, setTitle]);

  // Check if player has content (either from store or selected channel)
  const hasPlayerContent = !!src || !!selectedChannel;

  if (!playlist) {
    return (
      <EmptyState
        icon='📺'
        title='No Playlists Found'
        description='Please add a playlist to view channels'
        fullScreen
      />
    );
  }

  return (
    <>
      {/* Categories Sidebar */}
      <div className='flex flex-1 overflow-y-auto'>
        <CategoriesSidebar
          categories={categories}
          isLoading={isFetchingCategories}
          selectedCategoryId={selectedCategoryId}
          categoryType='channels'
        />

        {/* Channels Sidebar */}
        <ChannelsSidebar
          channels={channels}
          isLoading={isFetchingChannels}
          selectedCategoryId={selectedCategoryId}
          selectedChannelId={selectedChannelId}
          selectedCategory={selectedCategory}
          onChannelClick={handleChannelClick}
        />

        {/* Player Area */}
        <div className='flex-1 flex flex-col'>
          {/* Player Header */}
          <PlayerHeader selectedChannel={selectedChannel} />

          {/* Player Content */}
          <div className='flex-1 overflow-y-auto'>
            {hasPlayerContent ?
              <div className='h-full flex flex-col'>
                {/* Video Player Area */}
                <div className='h-1/2'>
                  <VideoPlayer
                    id={selectedChannel ? selectedChannel.id : 0}
                    categoryId={
                      selectedCategory ? selectedCategory.categoryId : 0
                    }
                    autoPlay
                    src={src}
                    poster={poster}
                    title={title}
                  />
                </div>

                {/* Channel Info */}
                <div className='h-1/2'>
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
            : <div className='flex-1 flex items-center justify-center h-full'>
                <div className='text-center'>
                  <div className='text-6xl mb-4 opacity-50'>🎬</div>
                  <h4 className='text-xl font-semibold text-white mb-2'>
                    Ready to Stream
                  </h4>
                  <p className='text-gray-400 max-w-md'>
                    Select a category and channel to start watching your
                    favorite content
                  </p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </>
  );
}
