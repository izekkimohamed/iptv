import VideoPlayer from '@/features/player/components/VideoPlayer';
import { usePlaylistStore } from '@repo/store';

import ChannelInfoPanel from './channels/ChannelInfoPanel';
import PlayerHeader from './iptv/PlayerHeader';

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

function PlayerArea({ selectedChannel }: { selectedChannel: SelectedChannel | undefined }) {
  const { selectedPlaylist: playlist } = usePlaylistStore();

  if (!playlist || !selectedChannel) {
    return null;
  }
  return (
    <div className="flex flex-1 flex-col">
      <PlayerHeader selectedChannel={selectedChannel} />

      <div className="flex-1 overflow-y-auto">
        {selectedChannel ? (
          <div className="flex h-full flex-col md:flex-row">
            <div className="h-2/3 md:h-1/2">
              <VideoPlayer
                src={selectedChannel?.url}
                poster={selectedChannel?.streamIcon}
                title={selectedChannel?.name}
                autoPlay
                totalEpisodes={0}
                serieId={null}
                movieId={null}
                categoryId={null}
              />
            </div>

            <div className="h-1/3 overflow-y-auto md:h-1/2">
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
        ) : (
          <div className="flex h-full flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-6xl opacity-50">🎬</div>
              <h4 className="mb-2 text-xl font-semibold text-white">Ready to Stream</h4>
              <p className="max-w-md text-gray-400">
                Select a category and channel to start watching your favorite content
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerArea;
