import { trpc } from '@/lib/trpc';
import { Channel, PlaylistProps } from '@/lib/types';
import { decodeBase64, getProgress } from '@/lib/utils';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ChannelInfoPanelProps {
  selectedChannel: Channel;
  playlistProps: PlaylistProps;
}

export default function ChannelInfoPanel(props: ChannelInfoPanelProps) {
  const { selectedChannel, playlistProps } = props;
  const { url, username, password } = playlistProps;
  const { data: epg, isLoading } = trpc.channels.getShortEpg.useQuery({
    channelId: selectedChannel.streamId,
    url,
    username,
    password,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-1 bg-black/20 border-t border-white/10 p-6 flex flex-col h-full overflow-y-auto">
      <h5 className="text-sm font-medium text-gray-400 mb-4">
        Now & Next on {selectedChannel.name}
      </h5>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
        {epg?.length ? (
          epg.map((listing: any) => {
            const progress = getProgress(listing.start, listing.end);
            const isLive = progress > 0 && progress < 100;

            return (
              <div
                key={listing.id}
                className={`relative group rounded-2xl transition-all border ${
                  isLive
                    ? 'bg-white/10 border-white/20 shadow-lg'
                    : 'bg-white/3 border-white/5 hover:bg-white/5'
                } p-4 flex flex-col`}
              >
                {/* Progress Background (Subtle fill for Live) */}
                {isLive && (
                  <div
                    className="absolute inset-0 bg-white/5 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                )}

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-1">
                      {isLive && (
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] animate-pulse">
                          On Air Now
                        </span>
                      )}
                      <h4
                        className={`font-bold tracking-tight ${isLive ? 'text-white text-base' : 'text-white/60 text-sm'}`}
                      >
                        {decodeBase64(listing.title)}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[11px] font-black tabular-nums ${isLive ? 'text-white' : 'text-white/30'}`}
                      >
                        {new Date(listing.start).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </span>
                    </div>
                  </div>

                  <p
                    className={`text-xs line-clamp-2 leading-relaxed ${isLive ? 'text-white/70' : 'text-white/30'}`}
                  >
                    {decodeBase64(listing.description)}
                  </p>

                  {/* Subtle Progress Line */}
                  {isLive && (
                    <div className="mt-4 w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-20">
            <span className="text-xs font-black uppercase tracking-widest">No Schedule Found</span>
          </div>
        )}
      </div>
    </div>
  );
}
