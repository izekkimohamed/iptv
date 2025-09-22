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

interface Category {
  categoryId: number;
  categoryName: string;
  type: string;
  playlistId: number;
}

interface ChannelInfoPanelProps {
  selectedChannel: Channel;
  selectedCategory?: Category;
  onToggleFavorite?: (channel: Channel) => void;
  onCopyUrl?: (url: string) => void;
}

export default function ChannelInfoPanel({
  selectedChannel,
  selectedCategory,
  onToggleFavorite,
  onCopyUrl,
}: ChannelInfoPanelProps) {
  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(selectedChannel);
    }
  };

  const handleCopyUrl = () => {
    if (onCopyUrl) {
      onCopyUrl(selectedChannel.url);
    } else {
      // Default behavior
      navigator.clipboard.writeText(selectedChannel.url);
    }
  };

  return (
    <div className='bg-black/20 backdrop-blur-md border-t border-white/10 p-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white/5 rounded-lg p-4'>
          <h5 className='text-sm font-medium text-gray-400 mb-2'>
            Channel Info
          </h5>
          <div className='space-y-1 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Name:</span>
              <span className='text-white'>{selectedChannel.name}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Type:</span>
              <span className='text-white capitalize'>
                {selectedChannel.streamType}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Stream ID:</span>
              <span className='text-white'>{selectedChannel.streamId}</span>
            </div>
          </div>
        </div>

        <div className='bg-white/5 rounded-lg p-4'>
          <h5 className='text-sm font-medium text-gray-400 mb-2'>Category</h5>
          <div className='space-y-1 text-sm'>
            <div className='text-white font-medium'>
              {selectedCategory?.categoryName || "Unknown"}
            </div>
            <div className='text-gray-400 capitalize'>
              {selectedCategory?.type || "Unknown"}
            </div>
          </div>
        </div>

        <div className='bg-white/5 rounded-lg p-4'>
          <h5 className='text-sm font-medium text-gray-400 mb-2'>Actions</h5>
          <div className='space-y-2'>
            <button
              onClick={handleToggleFavorite}
              className='w-full bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-white py-1 px-3 rounded text-sm transition-colors'
            >
              {selectedChannel.isFavorite ?
                "⭐ Remove Favorite"
              : "☆ Add Favorite"}
            </button>
            <button
              onClick={handleCopyUrl}
              className='w-full bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white py-1 px-3 rounded text-sm transition-colors'
            >
              📋 Copy URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
