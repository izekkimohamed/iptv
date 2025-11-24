import React from "react";
import PlayerHeader from "./iptv/PlayerHeader";
import VideoPlayer from "./videoPlayer";
import ChannelInfoPanel from "./iptv/ChannelInfoPanel";
import { usePlaylistStore } from "@/store/appStore";

interface SelectedChannel {
  id: number;
  name: string;
  streamType: string;
  streamId: number;
  categoryId: number;
  playlistId: number;
  isFavorite: boolean;
  url: string;
  streamIcon?: string | undefined;
}

function PlayerArea({
  selectedChannel,
}: {
  selectedChannel: SelectedChannel | undefined;
}) {
  const { selectedPlaylist: playlist } = usePlaylistStore();

  if (!playlist || !selectedChannel) {
    return null;
  }
  return (
    <div className='flex-1 flex flex-col'>
      {/* Player Header */}
      <PlayerHeader selectedChannel={selectedChannel} />

      {/* Player Content */}
      <div className='flex-1 overflow-y-auto'>
        {selectedChannel ?
          <div className='h-full flex flex-col'>
            {/* Video Player Area */}
            <div className='h-1/2'>
              {/* <VideoPlayer src={selectedChannel?.url} /> */}
              <VideoPlayer
                src={selectedChannel?.url}
                poster={selectedChannel?.streamIcon}
                title={selectedChannel?.name}
                autoPlay
              />
            </div>

            {/* Channel Info */}
            <div className='h-1/2 '>
              <ChannelInfoPanel
                selectedChannel={selectedChannel}
                playlistProps={{
                  url: playlist?.baseUrl,
                  username: playlist?.username,
                  password: playlist?.password,
                }}
              />
            </div>
          </div>
        : <div className='flex-1 flex items-center justify-center h-full backdrop-blur-md bg-black/10'>
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
  );
}

export default PlayerArea;
