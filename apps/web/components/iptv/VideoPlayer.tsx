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

interface VideoPlayerProps {
  selectedChannel?: Channel;
  onPlayStream?: () => void;
}

export default function VideoPlayer({
  selectedChannel,
  onPlayStream,
}: VideoPlayerProps) {
  const handlePlayClick = () => {
    if (onPlayStream) {
      onPlayStream();
    } else {
      // Default behavior - could open stream in new window or integrate with video player
      console.log("Playing stream:", selectedChannel?.url);
    }
  };

  if (!selectedChannel) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-6xl mb-4 opacity-50'>🎬</div>
          <h4 className='text-xl font-semibold text-white mb-2'>
            Ready to Stream
          </h4>
          <p className='text-gray-400 max-w-md'>
            Select a category and channel to start watching your favorite
            content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 bg-black flex items-center justify-center'>
      <div className='text-center'>
        <div className='text-6xl mb-4'>📺</div>
        <h4 className='text-xl font-semibold text-white mb-2'>Video Player</h4>
        <p className='text-gray-400 mb-4'>Stream URL: {selectedChannel.url}</p>
        <button
          onClick={handlePlayClick}
          className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors'
        >
          ▶️ Play Stream
        </button>
      </div>
    </div>
  );
}
