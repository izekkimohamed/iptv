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
    <div className="flex h-full flex-1 flex-col overflow-y-auto border-t border-white/10 bg-black/20 p-6">
      <h5 className="mb-4 text-sm font-medium text-gray-400">
        Now & Next on {selectedChannel.name}
      </h5>

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto pr-2">
        {epg?.length ? (
          epg.map((listing: any) => {
            const progress = getProgress(listing.start, listing.end);
            const isLive = progress > 0 && progress < 100;

            return (
              <div
                key={listing.id}
                className={`group relative rounded-2xl border transition-all ${
                  isLive
                    ? 'border-white/20 bg-white/10 shadow-lg'
                    : 'border-white/5 bg-white/3 hover:bg-white/5'
                } flex flex-col p-4`}
              >
                {/* Progress Background (Subtle fill for Live) */}
                {isLive && (
                  <div
                    className="absolute inset-0 bg-white/5 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                )}

                <div className="relative z-10">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      {isLive && (
                        <span className="animate-pulse text-[9px] font-black tracking-[0.2em] text-red-500 uppercase">
                          On Air Now
                        </span>
                      )}
                      <h4
                        className={`font-bold tracking-tight ${isLive ? 'text-base text-white' : 'text-sm text-white/60'}`}
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
                    className={`line-clamp-2 text-xs leading-relaxed ${isLive ? 'text-white/70' : 'text-white/30'}`}
                  >
                    {decodeBase64(listing.description)}
                  </p>

                  {/* Subtle Progress Line */}
                  {isLive && (
                    <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
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
            <span className="text-xs font-black tracking-widest uppercase">No Schedule Found</span>
          </div>
        )}
      </div>
    </div>
  );
}
