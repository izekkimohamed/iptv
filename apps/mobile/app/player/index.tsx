import { VideoControls } from "@/components/player/Controllers";
import { usePlayer } from "@/hooks/usePlayer";
import { usePlayerGestures } from "@/hooks/usePlayerGestures";
import {
  useWatchedMoviesStore,
  useWatchedSeriesStore,
} from "@/store/watched-store";
import { usePlayerTheme } from "@/theme/playerTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { VideoView } from "expo-video";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

// --- Reanimated Text Helper ---
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const ReanimatedPercentage = ({
  value,
  style,
  color,
}: {
  value: SharedValue<number>;
  style?: any;
  color: string;
}) => {
  const animatedProps = useAnimatedProps(
    () =>
      ({
        text: `${Math.round(value.value * 100)}%`,
      }) as unknown as TextInputProps,
  );

  return (
    <AnimatedTextInput
      underlineColorAndroid='transparent'
      editable={false}
      value='0%'
      style={[style, { color }]}
      animatedProps={animatedProps}
    />
  );
};

// --- Main Component ---
export default function Player() {
  const {
    url,
    title,
    mediaType,
    movieId,
    streamId,
    categoryId,
    playlistId,
    poster,
    seriesId,
    seriesTitle,
    totalEpisodes,
    episodeNumber,
    seasonId,
    resumePosition,
  } = useLocalSearchParams<{
    url: string;
    mediaType?: "live" | "vod";
    title: string;
    movieId?: string;
    streamId?: string;
    categoryId?: string;
    playlistId?: string;
    poster?: string;
    seriesId?: string;
    seriesTitle?: string;
    totalEpisodes?: string;
    episodeNumber?: string;
    seasonId?: string;
    resumePosition?: string;
  }>();

  const { saveProgress: saveMovieProgress } = useWatchedMoviesStore();
  const { saveProgress: saveSeriesProgress } = useWatchedSeriesStore();

  const [isLocked, setIsLocked] = useState(false);

  const onProgress = useCallback(
    (position: number, duration: number) => {
      if (seriesId && playlistId && episodeNumber && seasonId) {
        saveSeriesProgress(
          {
            id: Number(seriesId),
            categoryId: Number(categoryId ?? 0),
            playlistId: Number(playlistId),
            poster: poster || undefined,
            title: seriesTitle || title || undefined,
            totalEpisodes: Number(totalEpisodes ?? 0),
          },
          {
            episodeNumber: Number(episodeNumber),
            seasonId: Number(seasonId),
            position,
            duration,
            src: url ?? "",
          },
        );
      } else if (movieId && playlistId) {
        saveMovieProgress({
          id: Number(movieId),
          streamId: Number(streamId ?? movieId),
          categoryId: Number(categoryId ?? 0),
          position,
          duration,
          poster: poster || undefined,
          title: title || undefined,
          src: url || undefined,
          playlistId: Number(playlistId),
        });
      }
    },
    [
      movieId,
      streamId,
      categoryId,
      seriesId,
      playlistId,
      poster,
      title,
      seriesTitle,
      totalEpisodes,
      episodeNumber,
      seasonId,
      url,
      saveMovieProgress,
      saveSeriesProgress,
    ],
  );

  const theme = usePlayerTheme();

  const {
    player,
    status,
    isFullScreen,
    isPlaying,
    isLive,
    resizeMode,
    showControls,
    timeUpdate,
    bufferedPosition,
    playbackRate,
    SPEED_STEPS,
    setShowControls,
    handlePlayPause,
    handleSeek,
    volume,
    handleVolumeChange,
    toggleFullScreen,
    toggleResizeMode,
    skipForward,
    skipBackward,
    handleBackPress,
    retryPlayback,
    changeSource,
    availableAudioTracks,
    availableSubtitleTracks,
    audioTrack,
    subtitleTrack,
    setAudioTrack,
    setSubtitleTrack,
    setPlaybackRate,
    cyclePlaybackRate,
    startLongPress,
    endLongPress,
    resetHideTimer,
  } = usePlayer(
    url,
    mediaType,
    movieId || seriesId ? onProgress : undefined,
    resumePosition ? Number(resumePosition) : undefined,
  );

  const [isLongPressing, setIsLongPressing] = useState(false);

  const {
    composedGesture,
    tapGesture,
    volumeValue,
    brightnessValue,
    volumeAnim,
    brightnessAnim,
    leftDoubleTapAnim,
    rightDoubleTapAnim,
    leftSeekSeconds,
    rightSeekSeconds,
  } = usePlayerGestures({
    showControls,
    setShowControls,
    skipForward,
    skipBackward,
    seekBy: (seconds: number) => {
      const cur = timeUpdate?.currentTime ?? 0;
      const dur = player?.duration ?? 0;
      handleSeek(Math.min(Math.max(cur + seconds, 0), dur));
    },
    onLongPressStart: () => { setIsLongPressing(true); startLongPress(); },
    onLongPressEnd: () => { setIsLongPressing(false); endLongPress(); },
    onPinch: toggleResizeMode,
  });

  // --- Icon state ---
  const [volIcon, setVolIcon] =
    useState<keyof typeof MaterialCommunityIcons.glyphMap>("volume-high");
  const [brightIcon, setBrightIcon] =
    useState<keyof typeof MaterialCommunityIcons.glyphMap>("brightness-6");

  useDerivedValue(() => {
    const v = volumeValue.value;
    let icon: keyof typeof MaterialCommunityIcons.glyphMap = "volume-off";
    if (v >= 0.7) icon = "volume-high";
    else if (v >= 0.3) icon = "volume-medium";
    else if (v > 0) icon = "volume-low";
    runOnJS(setVolIcon)(icon);
  });

  useDerivedValue(() => {
    const b = brightnessValue.value;
    let icon: keyof typeof MaterialCommunityIcons.glyphMap = "brightness-4";
    if (b >= 0.7) icon = "brightness-6";
    else if (b >= 0.3) icon = "brightness-5";
    runOnJS(setBrightIcon)(icon);
  });

  // --- Animated styles ---
  const volumeBarStyle = useAnimatedStyle(() => ({
    width: `${volumeValue.value * 100}%`,
  }));
  const volumeContainerStyle = useAnimatedStyle(() => ({
    opacity: volumeAnim.value,
  }));
  const brightnessBarStyle = useAnimatedStyle(() => ({
    width: `${brightnessValue.value * 100}%`,
  }));
  const brightnessContainerStyle = useAnimatedStyle(() => ({
    opacity: brightnessAnim.value,
  }));
  const leftRippleStyle = useAnimatedStyle(() => ({
    opacity: leftDoubleTapAnim.value,
  }));
  const rightRippleStyle = useAnimatedStyle(() => ({
    opacity: rightDoubleTapAnim.value,
  }));

  const leftLabelProps = useAnimatedProps(
    () =>
      ({
        text: `-${leftSeekSeconds.value}s`,
      }) as unknown as TextInputProps,
  );
  const rightLabelProps = useAnimatedProps(
    () =>
      ({
        text: `+${rightSeekSeconds.value}s`,
      }) as unknown as TextInputProps,
  );

  useEffect(() => {
    activateKeepAwakeAsync();
    return () => {
      deactivateKeepAwake();
    };
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar hidden style='light' />
      <GestureDetector gesture={isLocked ? tapGesture : composedGesture}>
        <View
          collapsable={false}
          style={[
            styles.videoContainer,
            isFullScreen ? styles.fullScreen : styles.standardView,
          ]}
        >
          {/* Video layer — always interactive */}
          <VideoView
            style={styles.video}
            player={player}
            fullscreenOptions={{ enable: true }}
            allowsPictureInPicture
            startsPictureInPictureAutomatically
            nativeControls={false}
            contentFit={!isFullScreen ? "contain" : resizeMode}
          />

          {/* Gesture-blocking overlay when locked */}
          {isLocked && (
            <View
              style={StyleSheet.absoluteFillObject}
              pointerEvents='box-only'
            />
          )}

          {/* Loading */}
          {status === "loading" && (
            <View style={styles.centerOverlay}>
              <ActivityIndicator size={50} color={theme.primary} />
            </View>
          )}

          {/* Error */}
          {status === "error" && (
            <View style={styles.centerOverlay}>
              <View style={styles.errorCard}>
                <MaterialCommunityIcons name='alert-circle-outline' size={40} color='#EF4444' />
                <Text style={styles.errorTitle}>Playback Error</Text>
                <Text style={styles.errorSub}>Unable to load this stream</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={retryPlayback} activeOpacity={0.8}>
                  <MaterialCommunityIcons name='refresh' size={16} color='#fff' />
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Left double-tap ripple */}
          <Animated.View
            pointerEvents='none'
            style={[styles.rippleSide, styles.rippleLeft, leftRippleStyle]}
          >
            <View style={styles.chevronRow}>
              <MaterialCommunityIcons
                name='chevron-left'
                size={16}
                color='rgba(255,255,255,0.3)'
              />
              <MaterialCommunityIcons
                name='chevron-left'
                size={22}
                color='rgba(255,255,255,0.65)'
              />
              <MaterialCommunityIcons
                name='chevron-left'
                size={28}
                color='#fff'
              />
            </View>
            <AnimatedTextInput
              underlineColorAndroid='transparent'
              editable={false}
              value='-10s'
              style={styles.rippleLabel}
              animatedProps={leftLabelProps}
            />
          </Animated.View>

          {/* Right double-tap ripple */}
          <Animated.View
            pointerEvents='none'
            style={[styles.rippleSide, styles.rippleRight, rightRippleStyle]}
          >
            <View style={styles.chevronRow}>
              <MaterialCommunityIcons
                name='chevron-right'
                size={28}
                color='#fff'
              />
              <MaterialCommunityIcons
                name='chevron-right'
                size={22}
                color='rgba(255,255,255,0.65)'
              />
              <MaterialCommunityIcons
                name='chevron-right'
                size={16}
                color='rgba(255,255,255,0.3)'
              />
            </View>
            <AnimatedTextInput
              underlineColorAndroid='transparent'
              editable={false}
              value='+10s'
              style={styles.rippleLabel}
              animatedProps={rightLabelProps}
            />
          </Animated.View>

          {/* Volume HUD pill */}
          <Animated.View
            pointerEvents='none'
            style={[styles.hudPill, styles.hudTop, volumeContainerStyle]}
          >
            <MaterialCommunityIcons name={volIcon} size={18} color='#fff' />
            <View style={styles.hudTrackWrap}>
              <View style={styles.hudTrack} />
              <Animated.View
                style={[
                  styles.hudFill,
                  volumeBarStyle,
                  { backgroundColor: theme.primary },
                ]}
              />
            </View>
            <ReanimatedPercentage
              value={volumeValue}
              color='rgba(255,255,255,0.7)'
              style={styles.hudPct}
            />
          </Animated.View>

          {/* Brightness HUD pill */}
          <Animated.View
            pointerEvents='none'
            style={[styles.hudPill, styles.hudBottom, brightnessContainerStyle]}
          >
            <MaterialCommunityIcons name={brightIcon} size={18} color='#fff' />
            <View style={styles.hudTrackWrap}>
              <View style={styles.hudTrack} />
              <Animated.View
                style={[
                  styles.hudFill,
                  brightnessBarStyle,
                  { backgroundColor: theme.accentWarning },
                ]}
              />
            </View>
            <ReanimatedPercentage
              value={brightnessValue}
              color='rgba(255,255,255,0.7)'
              style={styles.hudPct}
            />
          </Animated.View>

          {/* Controls overlay — always rendered, handles locked state internally */}
          {status !== "loading" && status !== "error" && (
            <VideoControls
              showControls={showControls}
              setShowControls={setShowControls}
              changeSource={changeSource}
              player={player}
              isPlaying={isPlaying}
              isFullScreen={isFullScreen}
              isLive={isLive}
              isLocked={isLocked}
              resizeMode={resizeMode}
              currentTime={timeUpdate?.currentTime}
              duration={player?.duration}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onToggleFullScreen={toggleFullScreen}
              onToggleResizeMode={toggleResizeMode}
              onSkipForward={skipForward}
              onSkipBackward={skipBackward}
              onToggleLock={() => setIsLocked((v) => !v)}
              title={title}
              seriesTitle={seriesTitle}
              episodeNumber={episodeNumber}
              seasonId={seasonId}
              gesture={tapGesture}
              volume={volume}
              availableAudioTracks={availableAudioTracks}
              availableSubtitleTracks={availableSubtitleTracks}
              audioTrack={audioTrack}
              subtitleTrack={subtitleTrack}
              onSetAudioTrack={setAudioTrack}
              onSetSubtitleTrack={setSubtitleTrack}
              onSetPlaybackRate={setPlaybackRate}
              onCycleSpeed={cyclePlaybackRate}
              onResetHideTimer={resetHideTimer}
              playbackRate={playbackRate}
              speedSteps={SPEED_STEPS}
              bufferedPosition={bufferedPosition}
              resumePosition={resumePosition ? Number(resumePosition) : undefined}
              isLoading={(status as string) === "loading" || status === undefined}
              isLongPressing={isLongPressing}
            />
          )}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  videoContainer: {
    width: "100%",
    position: "relative",
    justifyContent: "center",
  },
  standardView: { aspectRatio: 16 / 9, width: "100%" },
  fullScreen: { height: "100%", width: "100%" },
  video: { width: "100%", height: "100%" },

  // Center overlays
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  errorCard: {
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 20,
    paddingHorizontal: 36,
    paddingVertical: 28,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  errorSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },

  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  // Double-tap ripples
  rippleSide: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "45%",
    zIndex: 15,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  rippleLeft: { left: 0 },
  rippleRight: { right: 0 },
  // Large circle anchored off-screen so only the curved edge is visible
  rippleArcLeft: {
    position: "absolute",
    top: "-20%",
    bottom: "-20%",
    left: "-55%",
    right: "-5%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  rippleArcRight: {
    position: "absolute",
    top: "-20%",
    bottom: "-20%",
    right: "-55%",
    left: "-5%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  // Content floats in the visible crescent area
  rippleContentLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: "5%",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  rippleContentRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "5%",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  chevronRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  rippleLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.4,
    textAlign: "center",
    backgroundColor: "transparent",
    padding: 0,
    minWidth: 52,
  },

  // HUD pills
  hudPill: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -90 }],
    width: 180,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 999,
  },
  hudTop: { top: "20%" },
  hudBottom: { top: "32%" },
  hudTrackWrap: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    position: "relative",
  },
  hudTrack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
  },
  hudFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  hudPct: {
    fontSize: 11,
    fontWeight: "700",
    minWidth: 34,
    textAlign: "right",
  },
});
