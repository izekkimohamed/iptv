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
    if (volumeLevel === 0) return "volume-off";
    if (volumeLevel < 0.3) return "volume-low";
    if (volumeLevel < 0.7) return "volume-medium";
    return "volume-high";
  }, [volumeLevel]);

  const brightnessIcon = useCallback(() => {
    if (brightnessLevel < 0.3) return "brightness-4";
    if (brightnessLevel < 0.7) return "brightness-5";
    return "brightness-6";
  }, [brightnessLevel]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar hidden style='light' />
      <GestureDetector gesture={composedGesture}>
        <View
          collapsable={false}
          style={[
            styles.videoContainer,
            isFullScreen ? styles.fullScreen : styles.standardView,
          ]}
        >
          <VideoView
            style={styles.video}
            player={player}
            fullscreenOptions={{ enable: true }}
            allowsPictureInPicture
            startsPictureInPictureAutomatically
            onPictureInPictureStop={() => player.pause()}
            nativeControls={false}
            contentFit={!isFullScreen ? "contain" : resizeMode}
          />

          {/* --- Loading State --- */}
          {status === "loading" && (
            <View style={styles.centerOverlay}>
              <View
                style={[
                  styles.loadingBackdrop,
                  {
                    backgroundColor: theme.glassMedium,
                    borderColor: theme.borderMuted,
                  },
                ]}
              >
                <View
                  style={[
                    styles.loadingGlow,
                    { backgroundColor: theme.primaryGlow },
                  ]}
                />
                <ActivityIndicator size='large' color={theme.primary} />
              </View>
            </View>
          )}

          {/* --- Error State --- */}
          {status === "error" && (
            <View style={styles.centerOverlay}>
              <View
                style={[
                  styles.errorBackdrop,
                  {
                    backgroundColor: theme.glassMedium,
                    borderColor: theme.borderMuted,
                  },
                ]}
              >
                <View
                  style={[
                    styles.errorIconContainer,
                    { backgroundColor: "rgba(239, 68, 68, 0.15)" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name='alert-circle-outline'
                    size={36}
                    color={theme.accentError}
                  />
                </View>
                <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
                  Playback Error
                </Text>
                <Text
                  style={[styles.errorMessage, { color: theme.textSecondary }]}
                >
                  Unable to load video. Check your connection.
                </Text>
              </View>
            </View>
          )}

          {/* --- Double Tap Ripples --- */}
          <Animated.View
            pointerEvents='none'
            style={[
              styles.rippleContainer,
              styles.rippleLeft,
              { opacity: leftDoubleTapAnim },
            ]}
          >
            <View
              style={[
                styles.rippleArcLeft,
                { backgroundColor: theme.glassMedium },
              ]}
            />

            <View style={styles.rippleContent}>
              <View
                style={[
                  styles.rippleIconBg,
                  { backgroundColor: theme.glassLight },
                ]}
              >
                <MaterialCommunityIcons
                  name='rewind-10'
                  size={32}
                  color={theme.primary}
                />
              </View>
              <Text style={[styles.rippleText, { color: theme.textPrimary }]}>
                -10 sec
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            pointerEvents='none'
            style={[
              styles.rippleContainer,
              styles.rippleRight,
              { opacity: rightDoubleTapAnim },
            ]}
          >
            <View
              style={[
                styles.rippleArcRight,
                { backgroundColor: theme.glassMedium },
              ]}
            />

            <View style={styles.rippleContent}>
              <View
                style={[
                  styles.rippleIconBg,
                  { backgroundColor: theme.glassLight },
                ]}
              >
                <MaterialCommunityIcons
                  name='fast-forward-10'
                  size={32}
                  color={theme.primary}
                />
              </View>
              <Text style={[styles.rippleText, { color: theme.textPrimary }]}>
                +10 sec
              </Text>
            </View>
          </Animated.View>

          {/* --- Volume HUD --- */}
          <Animated.View
            style={[
              styles.hudBar,
              styles.hudLeft,
              {
                opacity: volumeAnim,
                backgroundColor: theme.glassMedium,
                borderColor: theme.borderMuted,
              },
            ]}
          >
            <View
              style={[styles.hudTrack, { backgroundColor: theme.trackBg }]}
            />

            <View
              style={[
                styles.hudFill,
                {
                  height: `${volumeLevel * 100}%`,
                  backgroundColor: theme.primary,
                },
              ]}
            />

            <View style={styles.hudIconContainer}>
              <View
                style={[
                  styles.hudIconBg,
                  { backgroundColor: theme.glassLight },
                ]}
              >
                <MaterialCommunityIcons
                  name={volumeIcon()}
                  size={20}
                  color={theme.textPrimary}
                />
              </View>
            </View>

            <View style={styles.hudPercentage}>
              <Text
                style={[styles.hudPercentageText, { color: theme.textPrimary }]}
              >
                {Math.round(volumeLevel * 100)}%
              </Text>
            </View>
          </Animated.View>

          {/* --- Brightness HUD --- */}
          <Animated.View
            style={[
              styles.hudBar,
              styles.hudRight,
              {
                opacity: brightnessAnim,
                backgroundColor: theme.glassMedium,
                borderColor: theme.borderMuted,
              },
            ]}
          >
            <View
              style={[styles.hudTrack, { backgroundColor: theme.trackBg }]}
            />

            <View
              style={[
                styles.hudFill,
                {
                  height: `${brightnessLevel * 100}%`,
                  backgroundColor: theme.accentWarning,
                },
              ]}
            />

            <View style={styles.hudIconContainer}>
              <View
                style={[
                  styles.hudIconBg,
                  { backgroundColor: theme.glassLight },
                ]}
              >
                <MaterialCommunityIcons
                  name={brightnessIcon()}
                  size={20}
                  color={theme.textPrimary}
                />
              </View>
            </View>

            <View style={styles.hudPercentage}>
              <Text
                style={[styles.hudPercentageText, { color: theme.textPrimary }]}
              >
                {Math.round(brightnessLevel * 100)}%
              </Text>
            </View>
          </Animated.View>

          {/* --- Controls --- */}
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
    width: "100%",
    position: "relative",
    justifyContent: "center",
  },
  standardView: {
    aspectRatio: 16 / 9,
    width: "100%",
  },
  fullScreen: {
    height: "100%",
    width: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },

  // Center Overlays
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  loadingBackdrop: {
    borderRadius: 200,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    borderWidth: 1,
    backdropFilter: "blur(10px)",
    position: "relative",
    overflow: "hidden",
  },
  loadingGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 60,
    opacity: 0.2,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  errorBackdrop: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    backdropFilter: "blur(10px)",
    maxWidth: 320,
  },
  errorIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // Double Tap Ripples
  rippleContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "45%",
    justifyContent: "center",
    zIndex: 15,
    overflow: "hidden",
  },
  rippleLeft: {
    left: 0,
    alignItems: "flex-start",
  },
  rippleRight: {
    right: 0,
    alignItems: "flex-end",
  },
  rippleArcLeft: {
    position: "absolute",
    left: -80,
    top: 0,
    bottom: 0,
    width: "120%",
    borderTopRightRadius: 500,
    borderBottomRightRadius: 500,
  },
  rippleArcRight: {
    position: "absolute",
    right: -80,
    top: 0,
    bottom: 0,
    width: "120%",
    borderTopLeftRadius: 500,
    borderBottomLeftRadius: 500,
  },
  rippleContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  rippleIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  rippleText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // HUD Bars
  hudBar: {
    position: "absolute",
    top: "18%",
    bottom: "28%",
    width: 52,
    borderRadius: 26,
    overflow: "hidden",
    zIndex: 999,
    borderWidth: 1,
    justifyContent: "flex-end",
    backdropFilter: "blur(10px)",
  },
  hudLeft: {
    left: 16,
  },
  hudRight: {
    right: 16,
  },
  hudTrack: {
    ...StyleSheet.absoluteFillObject,
  },
  hudFill: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  hudIconContainer: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 12,
    zIndex: 10,
  },
  hudIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  hudPercentage: {
    position: "absolute",
    top: 12,
    width: "100%",
    alignItems: "center",
  },
  hudPercentageText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
