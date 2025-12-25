import { VideoControls } from "@/components/player/Controllers";
import { usePlayer } from "@/hooks/usePlayer";
import { usePlayerGestures } from "@/hooks/usePlayerGestures";
import { usePlayerTheme } from "@/theme/playerTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { VideoView } from "expo-video";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";

export default function Player() {
  const { url, title, mediaType } = useLocalSearchParams<{
    url: string;
    mediaType?: "live" | "vod";
    title: string;
  }>();

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
    changeSource,
  } = usePlayer(url, mediaType);

  const {
    composedGesture,
    volumeLevel,
    volumeAnim,
    brightnessLevel,
    brightnessAnim,
    leftDoubleTapAnim,
    rightDoubleTapAnim,
    tapGesture,
  } = usePlayerGestures({
    showControls,
    setShowControls,
    skipForward,
    skipBackward,
  });

  useEffect(() => {
    activateKeepAwakeAsync();
    return () => {
      deactivateKeepAwake();
    };
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  const volumeIcon = useCallback(() => {
    if (volumeLevel === 0) return "volume-mute";
    if (volumeLevel > 0.5) return "volume-high";
    return "volume-medium";
  }, [volumeLevel]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar hidden />
      <GestureDetector gesture={composedGesture}>
        <View
          collapsable={false}
          style={[styles.videoContainer, isFullScreen && styles.fullScreen]}
        >
          <VideoView
            style={styles.video}
            player={player}
            fullscreenOptions={{
              enable: true,
            }}
            allowsPictureInPicture
            startsPictureInPictureAutomatically
            onPictureInPictureStop={() => player.pause()}
            nativeControls={false}
            contentFit={!isFullScreen ? "fill" : resizeMode}
          />

          {/* Loading state */}
          {status === "loading" && (
            <View
              style={[
                styles.overlayContainer,
                { backgroundColor: theme.glassStrong },
              ]}
            >
              <View style={styles.loadingCard}>
                <View
                  style={[styles.loadingRing, { borderColor: theme.border }]}
                >
                  <ActivityIndicator size='large' color={theme.primary} />
                </View>
                <Text
                  style={[styles.loadingText, { color: theme.textPrimary }]}
                >
                  Preparing content...
                </Text>
              </View>
            </View>
          )}

          {/* Error state */}
          {status === "error" && (
            <View
              style={[
                styles.overlayContainer,
                { backgroundColor: theme.glassStrong },
              ]}
            >
              <View
                style={[styles.errorCard, { borderColor: theme.accentSuccess }]}
              >
                <View
                  style={[
                    styles.errorIconContainer,
                    { backgroundColor: `${theme.accentSuccess}26` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name='alert-circle-outline'
                    size={56}
                    color={theme.accentSuccess}
                  />
                </View>
                <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
                  Unable to load video
                </Text>
                <Text
                  style={[styles.errorMessage, { color: theme.textSecondary }]}
                >
                  Please check your connection and try again
                </Text>
              </View>
            </View>
          )}

          {/* Double tap feedback - backward */}
          <Animated.View
            style={[
              styles.doubleTapContainer,
              styles.leftTap,
              { opacity: leftDoubleTapAnim },
            ]}
          >
            <View
              style={[
                styles.doubleTapInner,
                {
                  borderColor: theme.border,
                  backgroundColor: `${theme.primary}26`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name='rewind-10'
                size={40}
                color={theme.primary}
              />
              <Text style={[styles.doubleTapLabel, { color: theme.primary }]}>
                -10s
              </Text>
            </View>
          </Animated.View>

          {/* Double tap feedback - forward */}
          <Animated.View
            style={[
              styles.doubleTapContainer,
              styles.rightTap,
              { opacity: rightDoubleTapAnim },
            ]}
          >
            <View
              style={[
                styles.doubleTapInner,
                {
                  borderColor: theme.border,
                  backgroundColor: `${theme.primary}26`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name='fast-forward-10'
                size={40}
                color={theme.primary}
              />
              <Text style={[styles.doubleTapLabel, { color: theme.primary }]}>
                +10s
              </Text>
            </View>
          </Animated.View>

          {/* Volume overlay */}
          <Animated.View
            style={[
              styles.sideOverlay,
              styles.volumeOverlay,
              {
                opacity: volumeAnim,
                backgroundColor: theme.glassStrong,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.overlayInner}>
              <MaterialCommunityIcons
                name={volumeIcon()}
                size={22}
                color={theme.primary}
              />
              <View
                style={[
                  styles.trackContainer,
                  { backgroundColor: theme.trackBg },
                ]}
              >
                <View
                  style={[
                    styles.trackFill,
                    {
                      height: `${volumeLevel * 100}%`,
                      backgroundColor: theme.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.valueText, { color: theme.textPrimary }]}>
                {Math.round(volumeLevel * 100)}%
              </Text>
            </View>
          </Animated.View>

          {/* Brightness overlay */}
          <Animated.View
            style={[
              styles.sideOverlay,
              styles.brightnessOverlay,
              {
                opacity: brightnessAnim,
                backgroundColor: theme.glassStrong,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.overlayInner}>
              <MaterialCommunityIcons
                name='brightness-6'
                size={22}
                color={theme.primary}
              />
              <View
                style={[
                  styles.trackContainer,
                  { backgroundColor: theme.trackBg },
                ]}
              >
                <View
                  style={[
                    styles.trackFill,
                    {
                      height: `${brightnessLevel * 100}%`,
                      backgroundColor: theme.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.valueText, { color: theme.textPrimary }]}>
                {Math.round(brightnessLevel * 100)}%
              </Text>
            </View>
          </Animated.View>

          {/* Video controls */}
          {showControls && status !== "loading" && (
            <VideoControls
              showControls={showControls}
              setShowControls={setShowControls}
              changeSource={changeSource}
              player={player}
              isPlaying={isPlaying}
              isFullScreen={isFullScreen}
              isLive={isLive}
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
              title={title}
              gesture={tapGesture}
              volume={volume}
            />
          )}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    height: 300,
    width: "100%",
    position: "relative",
    backgroundColor: "#000000",
  },
  fullScreen: {
    height: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingCard: {
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
  },
  loadingRing: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  errorCard: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  errorMessage: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  doubleTapContainer: {
    position: "absolute",
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  leftTap: {
    left: "10%",
    top: "35%",
  },
  rightTap: {
    right: "10%",
    top: "35%",
  },
  doubleTapInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    gap: 4,
  },
  doubleTapLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  sideOverlay: {
    position: "absolute",
    top: "30%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    zIndex: 999,
    borderWidth: 1,
  },
  volumeOverlay: {
    left: 20,
  },
  brightnessOverlay: {
    right: 20,
  },
  overlayInner: {
    alignItems: "center",
    gap: 10,
  },
  trackContainer: {
    width: 8,
    height: 120,
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  trackFill: {
    width: "100%",
    borderRadius: 4,
  },
  valueText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginTop: 2,
  },
});
