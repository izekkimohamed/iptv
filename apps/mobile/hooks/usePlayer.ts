import { useEvent, useEventListener } from "expo";
import { router } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { AudioTrack, SubtitleTrack, useVideoPlayer, VideoContentFit, VideoPlayerStatus } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { StatusBar } from "react-native";

const SPEED_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function usePlayer(
  url?: string,
  mediaType?: "live" | "vod",
  onProgress?: (position: number, duration: number) => void,
  resumePosition?: number,
) {
  const [status, setStatus] = useState<VideoPlayerStatus>();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLive, setIsLive] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [resizeMode, setResizeMode] = useState<VideoContentFit>("fill");
  const [videoSource, setVideoSource] = useState<{ uri: string }>({ uri: url || "" });
  const [isError, setIsError] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [bufferedPosition, setBufferedPosition] = useState(0);
  const [availableAudioTracks, setAvailableAudioTracks] = useState<AudioTrack[]>([]);
  const [availableSubtitleTracks, setAvailableSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [audioTrack, setAudioTrackState] = useState<AudioTrack | null>(null);
  const [subtitleTrack, setSubtitleTrackState] = useState<SubtitleTrack | null>(null);

  const RESIZE_MODES: VideoContentFit[] = ["contain", "cover", "fill"];

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.25;
    p.showNowPlayingNotification = false;
    p.muted = false;
    p.play();
  });

  const hasResumed = useRef(false);
  const lastSavedRef = useRef(0);
  const isLongPressing = useRef(false);
  const normalSpeedRef = useRef(1);

  const timeUpdate = useEvent(player, "timeUpdate");

  // Progress saving + buffered position
  useEffect(() => {
    if (!timeUpdate) return;
    const pos = timeUpdate.currentTime;
    const dur = player?.duration ?? 0;
    setBufferedPosition(timeUpdate.bufferedPosition ?? 0);
    if (onProgress && dur > 0 && pos - lastSavedRef.current >= 5) {
      lastSavedRef.current = pos;
      onProgress(pos, dur);
    }
  }, [timeUpdate]);

  const { isPlaying } = useEvent(player, "playingChange", { isPlaying: player.playing });

  // Track events
  useEventListener(player, "sourceLoad", ({ availableAudioTracks: a, availableSubtitleTracks: s }) => {
    setAvailableAudioTracks(a ?? []);
    setAvailableSubtitleTracks(s ?? []);
    setAudioTrackState(player.audioTrack);
    setSubtitleTrackState(player.subtitleTrack);
  });
  useEventListener(player, "availableAudioTracksChange", ({ availableAudioTracks: a }) => {
    setAvailableAudioTracks(a ?? []);
  });
  useEventListener(player, "availableSubtitleTracksChange", ({ availableSubtitleTracks: s }) => {
    setAvailableSubtitleTracks(s ?? []);
  });
  useEventListener(player, "audioTrackChange", ({ audioTrack: t }) => setAudioTrackState(t));
  useEventListener(player, "subtitleTrackChange", ({ subtitleTrack: t }) => setSubtitleTrackState(t));

  useEffect(() => {
    setIsLive(player?.isLive || false);
  }, [player?.isLive]);

  // Auto-hide controls
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => {
    if (isPlaying && showControls) {
      resetHideTimer();
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying, showControls]);

  // Status change + initial fullscreen + resume
  useEffect(() => {
    toggleFullScreen();
    if (!player) return;
    const sub = player.addListener("statusChange", ({ status: s }) => {
      if (s === "error") setIsError(true);
      if (s === "readyToPlay") {
        setShowControls(true);
        player.play();
        if (resumePosition && resumePosition > 0 && !hasResumed.current) {
          hasResumed.current = true;
          player.seekBy(resumePosition);
        }
      }
      setStatus(s);
    });
    return () => { sub?.remove(); setIsError(false); };
  }, [player]);

  // Auto-fullscreen on device rotation
  useEffect(() => {
    const sub = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      const { orientation } = orientationInfo;
      const isLandscape =
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      if (isLandscape && !isFullScreen) {
        setIsFullScreen(true);
        StatusBar.setHidden(true);
      } else if (!isLandscape && isFullScreen) {
        setIsFullScreen(false);
        StatusBar.setHidden(false);
      }
    });
    return () => ScreenOrientation.removeOrientationChangeListener(sub);
  }, [isFullScreen]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePlayPause = () => {
    if (isPlaying) player?.pause();
    else player?.play();
  };

  const handleSeek = (position: number) => {
    player?.seekBy(position - (player?.currentTime || 0));
  };

  const handleVolumeChange = (v: number) => {
    if (player) { player.volume = v; setVolume(v); }
  };

  const setAudioTrack = (track: AudioTrack) => {
    player.audioTrack = track;
    setAudioTrackState(track);
  };

  const setSubtitleTrack = (track: SubtitleTrack | null) => {
    player.subtitleTrack = track;
    setSubtitleTrackState(track);
  };

  const setPlaybackRate = (rate: number) => {
    if (player) { player.playbackRate = rate; setPlaybackRateState(rate); }
  };

  const cyclePlaybackRate = () => {
    const idx = SPEED_STEPS.indexOf(playbackRate);
    const next = SPEED_STEPS[(idx + 1) % SPEED_STEPS.length];
    setPlaybackRate(next);
  };

  // Long-press: temporarily boost to 2× while held
  const startLongPress = () => {
    isLongPressing.current = true;
    normalSpeedRef.current = playbackRate;
    if (player) player.playbackRate = 2;
  };

  const endLongPress = () => {
    if (!isLongPressing.current) return;
    isLongPressing.current = false;
    if (player) player.playbackRate = normalSpeedRef.current;
  };

  const toggleFullScreen = async () => {
    if (isFullScreen) {
      router.dismiss();
      setIsFullScreen(false);
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      StatusBar.setHidden(false);
    } else {
      setIsFullScreen(true);
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      StatusBar.setHidden(true);
    }
  };

  const toggleResizeMode = () => {
    const next = (RESIZE_MODES.indexOf(resizeMode) + 1) % RESIZE_MODES.length;
    setResizeMode(RESIZE_MODES[next]);
  };

  const skipForward = () => {
    handleSeek(Math.min((timeUpdate?.currentTime ?? 0) + 10, player?.duration || 0));
  };

  const skipBackward = () => {
    handleSeek(Math.max((timeUpdate?.currentTime ?? 0) - 10, 0));
  };

  const handleBackPress = () => {
    if (isFullScreen) { toggleFullScreen(); return true; }
    if (videoSource !== null) { router.dismiss(); return true; }
    return false;
  };

  const retryPlayback = () => {
    setIsError(false);
    setStatus(undefined);
    player.replace({ uri: videoSource.uri });
    player.play();
  };

  const changeSource = (source: string) => {
    player.pause();
    player.replace({ uri: source });
    setVideoSource({ uri: source });
    player.play();
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
    bufferedPosition,
    playbackRate,
    SPEED_STEPS,
    availableAudioTracks,
    availableSubtitleTracks,
    audioTrack,
    subtitleTrack,
    setShowControls,
    handlePlayPause,
    handleSeek,
    handleVolumeChange,
    setAudioTrack,
    setSubtitleTrack,
    setPlaybackRate,
    cyclePlaybackRate,
    startLongPress,
    endLongPress,
    toggleFullScreen,
    toggleResizeMode,
    skipForward,
    skipBackward,
    handleBackPress,
    retryPlayback,
    changeSource,
    videoSource,
    setVideoSource,
    resetHideTimer,
  };
}
