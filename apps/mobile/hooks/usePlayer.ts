import { useEvent } from "expo";
import { router } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useVideoPlayer, VideoContentFit, VideoPlayerStatus } from "expo-video";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";

export function usePlayer(url?: string, mediaType?: "live" | "vod") {
  const [status, setStatus] = useState<VideoPlayerStatus>();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLive, setIsLive] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [resizeMode, setResizeMode] = useState<VideoContentFit>("fill");
  const [videoSource, setVideoSource] = useState<{ uri: string }>({
    uri: url || "",
  });
  const [isError, setIsError] = useState(false);
  const [seekIndicator, setSeekIndicator] = useState<{
    time: number;
    direction: "forward" | "backward";
  } | null>(null);

  const RESIZE_MODES: VideoContentFit[] = ["contain", "cover", "fill"];

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.timeUpdateEventInterval = 0.25;
    player.showNowPlayingNotification = false;
    player.muted = false;
    player.play();
  });

  const timeUpdate = useEvent(player, "timeUpdate");
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });
  const changeSource = (source: string) => {
    player.pause();
    player.replace({ uri: source });
    setVideoSource({ uri: source });
    player.play();
  };
  useEffect(() => {
    setIsLive(player?.isLive || false);
  }, [player?.isLive]);
  // show/hide controlers after 3s
  useEffect(() => {
    if (isPlaying && showControls) {
      const interval = setInterval(() => {
        setShowControls(false);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, showControls]);
  //handle status change
  useEffect(() => {
    toggleFullScreen();
    if (player) {
      const subscription = player.addListener(
        "statusChange",
        ({ status, error }) => {
          if (status === "error") setIsError(true);
          if (status === "readyToPlay") {
            setShowControls(true);
            player.play();
          }
          setStatus(status);
        }
      );
      return () => {
        subscription?.remove();
        setIsError(false);
      };
    }
  }, [player]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      player?.pause();
    } else {
      player?.play();
    }
  };

  const handleSeek = (position: number) => {
    player?.seekBy(position - (player?.currentTime || 0));
  };

  const handleVolumeChange = (newVolume: number) => {
    if (player) {
      player.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const toggleFullScreen = async () => {
    if (isFullScreen) {
      router.dismiss();
      setIsFullScreen(false);
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
      StatusBar.setHidden(false);
    } else {
      setIsFullScreen(true);
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
      StatusBar.setHidden(true);
    }
  };

  const toggleResizeMode = () => {
    const currentIndex = RESIZE_MODES.indexOf(resizeMode);
    const nextIndex = (currentIndex + 1) % RESIZE_MODES.length;
    setResizeMode(RESIZE_MODES[nextIndex]);
  };

  const skipForward = () => {
    const newPosition = Math.min(
      Math.round(timeUpdate?.currentTime ?? 0) + 10,
      player?.duration || 0
    );
    setSeekIndicator({ time: 10, direction: "forward" });
    setTimeout(() => setSeekIndicator(null), 500);
    handleSeek(newPosition);
  };

  const skipBackward = () => {
    const newPosition = Math.max(
      Math.round(timeUpdate?.currentTime ?? 0) - 10,
      0
    );
    setSeekIndicator({ time: 10, direction: "backward" });
    setTimeout(() => setSeekIndicator(null), 500);
    handleSeek(newPosition);
  };

  const handleBackPress = () => {
    if (isFullScreen) {
      toggleFullScreen();
      return true;
    } else if (!isFullScreen && videoSource !== null) {
      router.dismiss();
      return true;
    }
    return false;
  };

  return {
    player,
    status,
    isError,
    isFullScreen,
    isPlaying,
    isLive,
    volume,
    resizeMode,
    showControls,
    timeUpdate,
    seekIndicator,
    RESIZE_MODES,
    setShowControls,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    toggleFullScreen,
    toggleResizeMode,
    skipForward,
    skipBackward,
    handleBackPress,
    changeSource,
    videoSource,
    setVideoSource,
  };
}
