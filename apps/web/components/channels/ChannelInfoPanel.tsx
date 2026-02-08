import { trpc } from '@/lib/trpc';
import { Channel, PlaylistProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { decodeBase64, getProgress } from '@repo/utils';

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
    <div className="flex h-full flex-1 flex-col overflow-hidden border-t border-white/10 bg-black/40 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          Live Schedule
        </h5>
        <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/60">
           {selectedChannel.name}
        </div>
      </div>

      <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto">
        {epg?.length ? (
          epg.map((listing: any) => {
            const progress = getProgress(listing.start, listing.end);
            const isLive = progress > 0 && progress < 100;

            return (
              <div
                key={listing.id}
                className={cn(
                  "group relative overflow-hidden rounded-[1.25rem] border transition-all duration-500",
                  isLive
                    ? "border-primary/40 bg-linear-to-br from-primary/10 to-transparent shadow-[0_20px_40px_-15px_rgba(var(--primary),0.15)]"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                )}
              >
                {/* Progress Background Layer */}
                {isLive && (
                  <div
                    className="absolute inset-y-0 left-0 z-0 bg-primary/[0.03] transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                )}

                <div className="relative z-10 flex flex-col p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      {isLive && (
                         <div className="flex items-center gap-2.5">
                            <div className="relative flex h-2 w-2">
                               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                               <span className="relative inline-flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                            </div>
                            <span className="text-[9px] font-black tracking-[0.2em] text-primary uppercase">
                               Currently Streaming
                            </span>
                         </div>
                      )}
                      <h4
                        className={cn(
                          "font-black tracking-tight leading-tight transition-all duration-300",
                          isLive ? "text-xl text-white drop-shadow-sm" : "text-base text-white/40"
                        )}
                      >
                        {decodeBase64(listing.title)}
                      </h4>
                    </div>

                    <div className="shrink-0">
                      <div className={cn(
                        "rounded-sm px-2.5 py-1.5 text-[11px] font-black tabular-nums transition-all duration-300",
                        isLive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 text-white/30"
                      )}>
                        {new Date(listing.start).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </div>
                    </div>
                  </div>

                  <p
                    className={cn(
                      "line-clamp-2 text-[13px] font-medium leading-relaxed transition-colors",
                      isLive ? "text-white/70" : "text-white/20"
                    )}
                  >
                    {decodeBase64(listing.description)}
                  </p>

                  {/* Progress Line */}
                  {isLive && (
                    <div className="mt-6 space-y-2">
                       <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                         <div
                           className="h-full bg-linear-to-r from-primary/80 to-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all duration-1000 ease-in-out"
                           style={{ width: `${progress}%` }}
                         />
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">
                             {new Date(listing.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(listing.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                             {Math.round(progress)}%
                          </span>
                       </div>
                    </div>
                  )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 h-24 w-24 bg-linear-to-bl from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            );
          })
        ) : (
          <div className="flex h-40 flex-col items-center justify-center space-y-4 rounded-3xl border border-dashed border-white/5 bg-white/2 opacity-40">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5">
               <span className="text-xl">📅</span>
            </div>
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">No Schedule Found</span>
          </div>
        )}
      </div>
    </div>
  );
}
