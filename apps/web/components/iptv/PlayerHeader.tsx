import React from "react";

interface Channel {
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

interface PlayerHeaderProps {
  selectedChannel?: Channel;
}

export default function PlayerHeader({ selectedChannel }: PlayerHeaderProps) {
  return (
    <div className='bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4'>
      <div className='flex items-center justify-between'>
        <div>
          {selectedChannel ?
            <>
              <h3 className='text-2xl font-bold text-white flex items-center'>
                {selectedChannel.streamIcon && (
                  <img
                    src={selectedChannel.streamIcon}
                    alt={selectedChannel.name}
                    className='w-8 h-8 rounded mr-3 object-cover'
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                {selectedChannel.name}
              </h3>
              <p className='text-gray-400 capitalize'>
                {selectedChannel.streamType} Stream
              </p>
            </>
          : <>
              <h3 className='text-2xl font-bold text-white'>
                Select a Channel
              </h3>
              <p className='text-gray-400'>
                Choose a channel from the sidebar to start watching
              </p>
            </>
          }
        </div>
        {selectedChannel && (
          <div className='flex items-center space-x-2'>
            <button className='bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1 rounded text-sm transition-colors'>
              🔴 LIVE
            </button>
            <div className='bg-purple-500/20 text-purple-300 px-3 py-1 rounded text-sm'>
              ID: {selectedChannel.streamId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
