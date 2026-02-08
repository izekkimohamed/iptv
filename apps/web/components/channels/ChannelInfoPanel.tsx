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
                  "group relative overflow-hidden rounded-2xl border transition-all duration-500",
                  isLive
                    ? "border-primary/40 bg-primary/5 shadow-[0_0_30px_-10px_rgba(var(--primary),0.2)]"
                    : "border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5"
                )}
              >
                {/* Progress Background Layer */}
                {isLive && (
                  <div
                    className="absolute inset-y-0 left-0 z-0 bg-primary/10 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                )}

                <div className="relative z-10 flex flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      {isLive && (
                         <div className="flex items-center gap-2 mb-1">
                            <span className="relative flex h-2 w-2">
                               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                               <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                            </span>
                            <span className="text-[10px] font-black tracking-widest text-primary uppercase">
                               Live Now
                            </span>
                         </div>
                      )}
                      <h4
                        className={cn(
                          "font-black tracking-tight leading-snug transition-colors",
                          isLive ? "text-lg text-white group-hover:text-primary" : "text-base text-white/60"
                        )}
                      >
                        {decodeBase64(listing.title)}
                      </h4>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={cn(
                          "text-[12px] font-black tabular-nums transition-colors",
                          isLive ? "text-primary" : "text-white/20"
                        )}
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
                    className={cn(
                      "line-clamp-2 text-xs font-medium leading-relaxed transition-colors",
                      isLive ? "text-white/70" : "text-white/20"
                    )}
                  >
                    {decodeBase64(listing.description)}
                  </p>

                  {/* Progress Line */}
                  {isLive && (
                    <div className="mt-5 space-y-1.5">
                       <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                         <div
                           className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-1000 ease-in-out"
                           style={{ width: `${progress}%` }}
                         />
                       </div>
                       <div className="flex justify-end">
                          <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">
                             {Math.round(progress)}% Complete
                          </span>
                       </div>
                    </div>
                  )}
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute inset-x-0 bottom-0 h-[1px] bg-linear-to-r from-transparent via-primary/50 to-transparent" />
                </div>
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
