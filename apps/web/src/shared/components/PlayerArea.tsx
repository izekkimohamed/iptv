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
          <div className="relative flex h-full flex-1 items-center justify-center overflow-hidden bg-background">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px] animate-pulse" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(var(--background),1)_70%)]" />
            </div>

            <div className="relative z-10 text-center">
              <div className="group relative mb-8 inline-block">
                <div className="absolute -inset-4 rounded-full bg-primary/20 opacity-0 blur-2xl transition-all duration-700 group-hover:opacity-100" />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl transition-transform duration-500 hover:scale-110">
                  <Play className="h-12 w-12 fill-primary text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-4xl font-black tracking-tighter text-white">
                  Cinema <span className="text-primary italic">Paradiso</span>
                </h4>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-8 bg-linear-to-r from-transparent to-white/20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                    Your Premium Streaming Lounge
                  </p>
                  <div className="h-[1px] w-8 bg-linear-to-l from-transparent to-white/20" />
                </div>
                <p className="mx-auto max-w-sm text-sm font-medium leading-relaxed text-muted-foreground/60">
                   Select a channel from the menu to transform your space into a private screening room.
                </p>
              </div>

              {/* Decorative Accent */}
              <div className="mt-12 flex items-center justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary/20 animate-bounce"
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
