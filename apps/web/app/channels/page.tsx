"use client";

import { trpc } from "@/lib/trpc";
import { useRouter, useSearchParams } from "next/navigation";
import CategoriesSidebar from "@/components/iptv/CategoriesSidebar";
import ChannelsSidebar from "@/components/iptv/ChannelsSidebar";
import PlayerHeader from "@/components/iptv/PlayerHeader";
import VideoPlayer from "@/components/iptv/VideoPlayer";
import ChannelInfoPanel from "@/components/iptv/ChannelInfoPanel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function ChannelsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("categoryId");
  const selectedChannelId = searchParams.get("channelId");

  // Data queries
  const { data: playlists, isLoading: isFetchingPlaylists } =
    trpc.playlists.getPlaylists.useQuery();

  const { data: categories, isLoading: isFetchingCategories } =
    trpc.channels.getCategories.useQuery(
      {
        playlistId: playlists?.[0]?.id || 0,
      },
      {
        enabled: !!playlists?.length,
      }
    );

  const { data: channels, isLoading: isFetchingChannels } =
    trpc.channels.getChannels.useQuery(
      {
        categoryId: parseInt(selectedCategoryId || "0"),
        playlistId: playlists?.[0]?.id || 0,
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

  type Channel = {
    id: number;
    name: string;
    streamType: string;
    streamId: number;
    categoryId: number;
    isFavorite: boolean;
    url: string;
    streamIcon?: string;
    playlistId?: number;
  };

  const handleToggleFavorite = (channel: Channel) => {
    // TODO: Implement toggle favorite mutation
    console.log("Toggle favorite for channel:", channel.id);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // TODO: Show toast notification
    console.log("URL copied to clipboard");
  };

  const handlePlayStream = () => {
    // TODO: Implement stream player logic
    console.log("Playing stream:", selectedChannel?.url);
  };

  // Derived data
  const selectedCategory = categories?.find(
    (cat) => cat.categoryId.toString() === selectedCategoryId
  );

  const selectedChannel = channels?.find(
    (channel) => channel.id.toString() === selectedChannelId
  );

  // Loading states
  if (isFetchingPlaylists) {
    return <LoadingSpinner message='Loading playlists...' fullScreen />;
  }

  if (!playlists?.length) {
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
    <div className='font-mono h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex'>
      {/* Categories Sidebar */}
      <CategoriesSidebar
        categories={categories}
        isLoading={isFetchingCategories}
        selectedCategoryId={selectedCategoryId}
        onCategoryClick={handleCategoryClick}
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
          {selectedChannel ?
            <div className='h-full flex flex-col'>
              {/* Video Player Area */}
              <VideoPlayer
                selectedChannel={selectedChannel}
                onPlayStream={handlePlayStream}
              />

              {/* Channel Info */}
              <ChannelInfoPanel
                selectedChannel={selectedChannel}
                selectedCategory={selectedCategory}
                onToggleFavorite={handleToggleFavorite}
                onCopyUrl={handleCopyUrl}
              />
            </div>
          : <div className='flex-1 flex items-center justify-center'>
              <div className='text-center'>
                <div className='text-6xl mb-4 opacity-50'>🎬</div>
                <h4 className='text-xl font-semibold text-white mb-2'>
                  Ready to Stream
                </h4>
                <p className='text-gray-400 max-w-md'>
                  Select a category and channel to start watching your favorite
                  content
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
