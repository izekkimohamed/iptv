import { Channel, PlaylistProps } from '@/lib/types';
import { trpc } from '@/lib/trpc';
import { decodeBase64, formatDate, getProgress } from '@/lib/utils';
import React from 'react';
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

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {epg?.length ? (
          epg.map(
            (listing: {
              id: string | number;
              title: string;
              description: string;
              start: string;
              end: string;
            }) => {
              const progress = getProgress(listing.start, listing.end);

              return (
                <div key={listing.id} className="bg-white/5 rounded-lg p-4 flex flex-col relative">
                  {/* Program Title & Time */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-medium">{decodeBase64(listing.title)}</span>
                    <span className="text-gray-400 text-xs">
                      {formatDate(listing.start)} - {formatDate(listing.end)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm line-clamp-3 mb-2">
                    {decodeBase64(listing.description)}
                  </p>

                  {/* Progress bar only if current program */}
                  {progress > 0 && progress < 100 && (
                    <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            },
          )
        ) : (
          <div className="text-gray-400 text-sm">No EPG available</div>
        )}
      </div>
    </div>
  );
}
