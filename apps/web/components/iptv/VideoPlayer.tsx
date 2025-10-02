"use client";

import { useVideoSource } from "@/hooks/useHls";
import React, { useEffect, useState } from "react";
import Controls from "../ui/Controls";

// You'll need to install hls.js: npm install hls.js @types/hls.js
// import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  className?: string;
}
/// Extend Document interface to include vendor-prefixed fullscreen properties
interface DocumentWithFullscreen extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
}

export default function VideoPlayer({
  src,
  poster,
  autoPlay = true,
  muted = false,
  className = "",
}: VideoPlayerProps) {
  const { videoRef, isLoading, error, bandwidth, resolution, totalBytes } =
    useVideoSource({
      src,
      autoPlay,
    });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  // Video event handlers
  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVolumeChange = () => {
    if (videoRef.current) {
      setVolume(videoRef.current.volume);
      setIsMuted(videoRef.current.muted);
    }
  };

  // Control functions
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleVolumeSliderChange = (newVolume: number) => {
    if (videoRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      videoRef.current.volume = clampedVolume;
      videoRef.current.muted = clampedVolume === 0;
    }
  };

  const adjustVolume = (delta: number) => {
    if (videoRef.current) {
      const newVolume = Math.max(
        0,
        Math.min(1, videoRef.current.volume + delta)
      );
      handleVolumeSliderChange(newVolume);
    }
  };

  const seekVideo = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds)
      );
      videoRef.current.currentTime = newTime;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    const videoContainer = videoRef.current.parentElement;
    if (!videoContainer) return;

    if (!isFullscreen) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as DocumentWithFullscreen;

      const isFs =
        !!doc.fullscreenElement ||
        !!doc.webkitFullscreenElement ||
        !!doc.mozFullScreenElement;

      setIsFullscreen(isFs);
      setIsControlsVisible(!isFs); // hide in fullscreen, show otherwise
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    // Only handle keyboard shortcuts when the video player is focused or in fullscreen
    const isPlayerFocused =
      document.activeElement === videoRef.current ||
      document.activeElement?.closest(".video-player-container") ||
      isFullscreen;

    if (!isPlayerFocused) return;

    switch (e.key.toLowerCase()) {
      case "f":
        e.preventDefault();
        toggleFullscreen();
        break;
      case "arrowup":
        e.preventDefault();
        adjustVolume(0.1); // Increase volume by 10%
        break;
      case "arrowdown":
        e.preventDefault();
        adjustVolume(-0.1); // Decrease volume by 10%
        break;
      case "arrowleft":
        e.preventDefault();
        seekVideo(-10); // Seek back 10 seconds
        break;
      case "arrowright":
        e.preventDefault();
        seekVideo(10); // Seek forward 10 seconds
        break;
      case " ":
      case "spacebar":
        e.preventDefault();
        togglePlay();
        break;
      case "m":
        e.preventDefault();
        toggleMute();
        break;
      case "escape":
        if (isFullscreen) {
          e.preventDefault();
          toggleFullscreen();
        }
        break;
    }
  };

  useEffect(() => {
    // Add event listener to document for global shortcuts
    document.addEventListener("keydown", handleKeyDown);
    // Make the video container focusable
    const container = videoRef.current?.parentElement;
    if (container) {
      container.setAttribute("tabIndex", "0");
      container.classList.add("video-player-container");
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoRef, handleKeyDown]);

  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      if (!isFullscreen) return;

      // Show controls immediately
      setIsControlsVisible(true);

      // Reset hide timer
      if (hideTimeout) clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(hideTimeout);
    };
  }, [isFullscreen, isControlsVisible]);

  return (
    <div
      className={`relative w-full h-full bg-black group ${className} ${isFullscreen ? "fixed inset-0 z-50" : ""} video-player-container`}
      tabIndex={0}
      style={{ outline: "none" }}
    >
      <video
        ref={videoRef}
        className={`w-full h-full ${isFullscreen ? "object-fill" : "object-contain"}`}
        poster={poster}
        muted={isMuted}
        playsInline
        controls={false}
        onPlay={handlePlay}
        onCanPlay={() => {
          if (autoPlay) {
            videoRef.current?.play();
          }
        }}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onVolumeChange={handleVolumeChange}
        onDoubleClick={toggleFullscreen}
        style={{
          outline: "none",
          WebkitAppearance: "none",
        }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className='absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center'>
          <div className='text-center text-white'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
            <p>Loading stream...</p>
          </div>
        </div>
      )}
      {error && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md ${isFullscreen ? "p-8" : "p-4"}`}
        >
          <div className='text-center p-8'>
            <div className='text-4xl mb-4'>⚠️</div>
            <h3 className='text-lg font-semibold mb-2'>Playback Error</h3>
            <p className='text-gray-400 text-sm'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors'
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <div className='absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded'>
        <p>Total: {(totalBytes / (1024 * 1024)).toFixed(2)} MB</p>
        <p>Bandwidth: {(bandwidth / 1024 / 1024).toFixed(2)} Mbps</p>
        {resolution && (
          <p>
            Resolution: {resolution.width}×{resolution.height}
          </p>
        )}
      </div>
      {/* Custom Controls */}
      {(!isFullscreen || isControlsVisible) && !isLoading && (
        <Controls
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          toggleFullscreen={toggleFullscreen}
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          duration={duration}
          currentTime={currentTime}
          isControlsVisible={isControlsVisible}
          setIsControlsVisible={setIsControlsVisible}
          handleSeek={seekVideo}
          handleVolumeSliderChange={handleVolumeSliderChange}
          toggleMute={toggleMute}
          togglePlay={togglePlay}
        />
      )}

      {/* Click to Play Overlay */}
      {!isPlaying && !isLoading && (
        <div
          className='absolute inset-0 flex items-center justify-center cursor-pointer'
          onClick={togglePlay}
        >
          <div className='bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors'>
            <svg
              className='w-12 h-12 text-white'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M8 5v14l11-7z' />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
