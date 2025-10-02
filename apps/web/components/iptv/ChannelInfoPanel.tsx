import { trpc } from "@/lib/trpc";
import React from "react";
import LoadingSpinner from "../ui/LoadingSpinner";

export interface Channel {
  id: number;
  name: string;
  streamType: string;
  streamId: number;
  streamIcon?: string;
  categoryId: number;
  playlistId?: number;
  isFavorite: boolean;
  url: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  type: string;
  playlistId: number;
}
interface PlaylistProps {
  url: string;
  username: string;
  password: string;
}

interface ChannelInfoPanelProps {
  selectedChannel: Channel;
  selectedCategory?: Category;
  playlistProps: PlaylistProps;
  onToggleFavorite?: (channel: Channel) => void;
  onCopyUrl?: (url: string) => void;
}

// helper to decode base64 safely
const decodeBase64 = (str: string) => {
  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return str;
  }
};

// progress calculation
const getProgress = (start: string, end: string) => {
  const now = Date.now();
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (now < startMs) return 0;
  if (now > endMs) return 100;
  return ((now - startMs) / (endMs - startMs)) * 100;
};

export default function ChannelInfoPanel({
  selectedChannel,
  playlistProps,
}: ChannelInfoPanelProps) {
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
    <div className='flex-1 bg-black/20 backdrop-blur-md border-t border-white/10 p-6 flex flex-col h-full overflow-y-auto'>
      <h5 className='text-sm font-medium text-gray-400 mb-4'>
        Now & Next on {selectedChannel.name}
      </h5>

      <div className='flex-1 overflow-y-auto space-y-4 pr-2'>
        {epg?.length ?
          epg.map((listing) => {
            const progress = getProgress(listing.start, listing.end);

            return (
              <div
                key={listing.id}
                className='bg-white/5 rounded-lg p-4 flex flex-col relative'
              >
                {/* Program Title & Time */}
                <div className='flex justify-between items-center mb-1'>
                  <span className='text-white font-medium'>
                    {decodeBase64(listing.title)}
                  </span>
                  <span className='text-gray-400 text-xs'>
                    {new Date(listing.start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(listing.end).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Description */}
                <p className='text-gray-400 text-sm line-clamp-3 mb-2'>
                  {decodeBase64(listing.description)}
                </p>

                {/* Progress bar only if current program */}
                {progress > 0 && progress < 100 && (
                  <div className='w-full h-1 bg-gray-700 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-purple-500 transition-all'
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })
        : <div className='text-gray-400 text-sm'>No EPG available</div>}
      </div>
    </div>
  );
}
