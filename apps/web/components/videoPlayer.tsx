import { useEffect } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { usePlayer } from "@/hooks/usePlayer";
import {
  DefaultAudioLayout,
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { usePlayerStore } from "@/store/player-store";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
}

export function VideoPlayer({
  src,
  poster,
  title = "Video",
  autoPlay = false,
  loop = false,
  onEnded,
  onTimeUpdate,
}: VideoPlayerProps) {
  const player = usePlayer();
  const {
    volume,
    isMuted,
    setMutated,
    setVolume,
    fullScreen,
    toggleFullScreen,
  } = usePlayerStore();

  // Determine video type based on URL
  const getVideoType = (url: string): string => {
    if (url.includes(".m3u8") || url.includes("m3u8")) {
      return "application/x-mpegURL"; // HLS
    } else if (url.includes(".mpd")) {
      return "application/dash+xml"; // DASH
    } else if (url.includes(".mp4")) {
      return "video/mp4";
    } else if (url.includes(".webm")) {
      return "video/webm";
    } else if (url.includes(".ogg")) {
      return "video/ogg";
    }
    return "video/mp4"; // default
  };

  const videoType = getVideoType(src);

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(player.currentTime);
    }
  }, [player.currentTime, onTimeUpdate]);

  useEffect(() => {
    //set the plyerRef to the fullscreen state
    if (fullScreen === true) {
      player.playerRef.current?.enterFullscreen();
    } else {
      player.playerRef.current?.exitFullscreen();
    }
  }, [fullScreen, player.playerRef]);

  return (
    <div className={`relative w-full h-full`}>
      <MediaPlayer
        ref={player.playerRef}
        src={src}
        poster={poster}
        volume={volume}
        onVolumeChange={(details) => {
          setVolume(details.volume);
          setMutated(details.muted);
        }}
        title={title}
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        playsInline
        onEnded={onEnded}
        onFullscreenChange={(details) => {
          toggleFullScreen(details);
        }}
        className='w-full h-full overflow-hidden bg-black rounded-lg'
        data-isfullscreen={fullScreen}
      >
        <MediaProvider>
          <source src={src} type={videoType} />
        </MediaProvider>

        <DefaultAudioLayout icons={defaultLayoutIcons} />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}

export default VideoPlayer;
