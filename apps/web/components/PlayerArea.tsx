import VideoPlayer from '@/features/player/components/VideoPlayer';
import { usePlaylistStore } from '@/store/appStore';
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
    <div className="flex-1 flex flex-col">
      <PlayerHeader selectedChannel={selectedChannel} />

      <div className="flex-1 overflow-y-auto">
        {selectedChannel ? (
          <div className="h-full flex flex-col md:flex-row">
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

            <div className="h-1/3 md:h-1/2 overflow-y-auto">
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
  );
}

export default PlayerArea;
