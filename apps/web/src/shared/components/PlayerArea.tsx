import VideoPlayer from '@/features/player/components/VideoPlayer';
import { usePlaylistStore } from '@repo/store';
import { Play } from 'lucide-react';

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
                serieId={undefined}
                movieId={undefined}
                categoryId={undefined}
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
          <div className="bg-background relative flex h-full flex-1 items-center justify-center overflow-hidden">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 z-0">
              <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full blur-[120px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(var(--background),1)_70%)]" />
            </div>

            <div className="relative z-10 text-center">
              <div className="group relative mb-8 inline-block">
                <div className="bg-primary/20 absolute -inset-4 rounded-full opacity-0 blur-2xl transition-all duration-700 group-hover:opacity-100" />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-3xl transition-transform duration-500 hover:scale-110">
                  <Play className="fill-primary text-primary h-12 w-12 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-4xl font-black tracking-tighter text-white">
                  Cinema <span className="text-primary italic">Paradiso</span>
                </h4>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-8 bg-linear-to-r from-transparent to-white/20" />
                  <p className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">
                    Your Premium Streaming Lounge
                  </p>
                  <div className="h-[1px] w-8 bg-linear-to-l from-transparent to-white/20" />
                </div>
                <p className="text-muted-foreground/60 mx-auto max-w-sm text-sm leading-relaxed font-medium">
                  Select a channel from the menu to transform your space into a private screening
                  room.
                </p>
              </div>

              {/* Decorative Accent */}
              <div className="mt-12 flex items-center justify-center gap-2">
                {['dot-0', 'dot-1', 'dot-2'].map((key, i) => (
                  <div
                    key={key}
                    className="bg-primary/20 h-1.5 w-1.5 animate-bounce rounded-full"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerArea;
