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
import {
  useWatchedMoviesStore,
  useWatchedSeriesStore,
} from "@/store/watchedStore";
import { usePathname, useSearchParams } from "next/navigation";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  episodeNumber?: number;
  seasonId?: number;

  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
}

export function VideoPlayer({
  autoPlay = false,
  loop = false,
  onEnded,
  onTimeUpdate,
  src,
  poster,
  title,
  episodeNumber,
  seasonId,
}: VideoPlayerProps) {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId");
  const seriesId = searchParams.get("serieId");
  const categoryId = searchParams.get("categoryId");
  const mediaType = usePathname();
  const player = usePlayer();
  const {
    volume,
    isMuted,
    setMutated,
    setVolume,
    fullScreen,
    toggleFullScreen,
  } = usePlayerStore();
  const { movies, saveProgress, removeItem } = useWatchedMoviesStore();
  const {
    series,
    saveProgress: saveProgressSeries,
    removeItem: removeSeriesItem,
  } = useWatchedSeriesStore();

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
    switch (mediaType) {
      case "/movies":
        const movieWatchedItem = movies.find(
          (item) => item.id.toString() === movieId
        );
        if (movieWatchedItem && player.playerRef.current) {
          player.playerRef.current.currentTime = movieWatchedItem.position;
        }
        return () => {
          const currentTime = player.playerRef.current?.currentTime ?? 0;
          const duration = player.playerRef.current?.duration ?? 0;
          const movieWatchedItem = movies.find(
            (item) => item.id.toString() === movieId
          );
          //check if the  currentTime is less than duration to avoid saving completed movies if the movie is already in moives store clear it
          // with a 5 minute tolerance
          if (movieWatchedItem && currentTime >= duration - 300) {
            removeItem(movieWatchedItem.id);
            return;
          }
          if (currentTime >= duration - 300) return;
          saveProgress({
            id: parseInt(movieId || "0"),
            categoryId: parseInt(categoryId || "0"),
            position: currentTime,
            duration,
            poster: poster,
            title: title,
            src: src,
          });
        };
      case "/series":
        const seriesWatchedItem = series.find(
          (item) => item.id.toString() === seriesId
        );
        if (
          seriesWatchedItem &&
          episodeNumber === seriesWatchedItem.episodeNumber &&
          seasonId === seriesWatchedItem.seasonId &&
          player.playerRef.current
        ) {
          player.playerRef.current.currentTime = seriesWatchedItem.position;
        }
        return () => {
          const currentTime = player.playerRef.current?.currentTime ?? 0;
          const duration = player.playerRef.current?.duration ?? 0;
          const seriesWatchedItem = movies.find(
            (item) => item.id.toString() === seriesId
          );
          //check if the  currentTime is less than duration to avoid saving completed series if the series is already in moives store clear it
          // with a 1 minute tolerance
          if (seriesWatchedItem && currentTime >= duration - 60) {
            removeSeriesItem(seriesWatchedItem.id);
            return;
          }
          if (currentTime >= duration - 60) return;
          saveProgressSeries({
            id: parseInt(seriesId || "0"),
            categoryId: parseInt(categoryId || "0"),
            position: currentTime,
            duration,
            poster: poster,
            title: title,
            src: src,
            episodeNumber: episodeNumber || 0,
            seasonId: seasonId || 0,
          });
        };

        break;

      // You can add more cases for different media types if needed
      default:
        break;
    }
  }, []);

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

  if (!src) {
    return null;
  }
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
