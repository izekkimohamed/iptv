import React, { forwardRef, useEffect, useCallback, RefObject } from "react";

/// Extend Document interface to include vendor-prefixed fullscreen properties
interface DocumentWithFullscreen extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
}

type ControlsProps = {
  isFullscreen: boolean;
  isPlaying: boolean;
  isControlsVisible: boolean;
  isMuted: boolean;
  duration: number;
  volume: number;
  currentTime: number;

  setIsFullscreen: (isFs: boolean) => void;
  toggleFullscreen: () => void;
  setIsControlsVisible: (isVisible: boolean) => void;
  togglePlay: () => void;
  handleSeek: (time: number) => void;
  toggleMute: () => void;
  handleVolumeSliderChange: (pos: number) => void;
};

const Controls = ({
  currentTime,
  duration,
  handleSeek,
  handleVolumeSliderChange,
  toggleMute,
  isFullscreen,
  isMuted,
  isPlaying,
  toggleFullscreen,
  volume,
  togglePlay,
}: ControlsProps) => {
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300
       ${isFullscreen ? "p-8" : "p-4"}`}
    >
      {/* Progress Bar */}
      <div className='mb-4'>
        <div
          className={`flex items-center space-x-2 text-white mb-2 ${isFullscreen ? "text-lg" : "text-sm"}`}
        >
          <span>{formatTime(currentTime)}</span>
          <div
            className={`flex-1 bg-gray-600 rounded overflow-hidden cursor-pointer ${isFullscreen ? "h-2" : "h-1"}`}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              handleSeek(pos * duration);
            }}
          >
            <div
              className='h-full bg-purple-500 transition-all duration-150'
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className='text-white hover:text-purple-400 transition-colors'
          >
            {isPlaying ?
              <svg
                className={`${isFullscreen ? "w-12 h-12" : "w-8 h-8"}`}
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M6 4h4v16H6V4zm8 0h4v16h-4V4z' />
              </svg>
            : <svg
                className={`${isFullscreen ? "w-12 h-12" : "w-8 h-8"}`}
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M8 5v14l11-7z' />
              </svg>
            }
          </button>

          {/* Volume */}
          <div className='flex items-center space-x-2'>
            <button
              onClick={toggleMute}
              className='text-white hover:text-purple-400 transition-colors'
            >
              {isMuted || volume === 0 ?
                <svg
                  className={`${isFullscreen ? "w-8 h-8" : "w-6 h-6"}`}
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z' />
                </svg>
              : <svg
                  className={`${isFullscreen ? "w-8 h-8" : "w-6 h-6"}`}
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' />
                </svg>
              }
            </button>
            <div
              className={`bg-gray-600 rounded overflow-hidden cursor-pointer ${isFullscreen ? "w-24 h-2" : "w-16 h-1"}`}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                handleVolumeSliderChange(pos);
              }}
            >
              <div
                className='h-full bg-purple-500'
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
            <span
              className={`text-white ${isFullscreen ? "text-sm" : "text-xs"} min-w-8`}
            >
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className='flex items-center space-x-4'>
          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className='text-white hover:text-purple-400 transition-colors'
          >
            {isFullscreen ?
              <svg
                className={`${isFullscreen ? "w-8 h-8" : "w-6 h-6"}`}
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z' />
              </svg>
            : <svg
                className={`${isFullscreen ? "w-8 h-8" : "w-6 h-6"}`}
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z' />
              </svg>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
