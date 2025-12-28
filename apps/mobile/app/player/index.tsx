import { VideoControls } from "@/components/player/Controllers";
import { usePlayer } from "@/hooks/usePlayer";
import { usePlayerGestures } from "@/hooks/usePlayerGestures";
import { usePlayerTheme } from "@/theme/playerTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
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
  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(value.value * 100)}%`,
    } as unknown as TextInputProps;
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid='transparent'
      editable={false}
      value='0%'
      style={[style, { color: color }]}
      animatedProps={animatedProps}
    />
  );
};

// --- Main Component ---

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
    tapGesture,
    volumeValue,
    brightnessValue,
    volumeAnim,
    brightnessAnim,
    leftDoubleTapAnim,
    rightDoubleTapAnim,
  } = usePlayerGestures({
    showControls,
    setShowControls,
    skipForward,
    skipBackward,
  });

  // --- Icon Logic (Optimized) ---
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

  // --- Animated Styles ---
  const volumeBarStyle = useAnimatedStyle(() => ({
    height: `${volumeValue.value * 100}%`,
  }));

  const volumeContainerStyle = useAnimatedStyle(() => ({
    opacity: volumeAnim.value,
  }));

  const brightnessBarStyle = useAnimatedStyle(() => ({
    height: `${brightnessValue.value * 100}%`,
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
            nativeControls={false}
            contentFit={!isFullScreen ? "contain" : resizeMode}
          />

          {/* Loading State */}
          {status === "loading" && (
            <View style={styles.centerOverlay}>
              <View
                style={[
                  styles.loadingBackdrop,
                  {
                    backgroundColor: theme.glassHighlight,
                    borderColor: theme.borderMuted,
                  },
                ]}
              >
                <ActivityIndicator size={42} color={theme.primary} />
              </View>
            </View>
          )}

          {/* Error State */}
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
                <MaterialCommunityIcons
                  name='alert-circle-outline'
                  size={36}
                  color={theme.accentError}
                />
                <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
                  Playback Error
                </Text>
              </View>
            </View>
          )}

          {/* Left Ripple */}
          <Animated.View
            pointerEvents='none'
            style={[styles.rippleContainer, styles.rippleLeft, leftRippleStyle]}
          >
            <View style={styles.rippleArcLeft} />
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

          {/* Right Ripple */}
          <Animated.View
            pointerEvents='none'
            style={[
              styles.rippleContainer,
              styles.rippleRight,
              rightRippleStyle,
            ]}
          >
            <View style={styles.rippleArcRight} />
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

          {/* Volume HUD */}
          <Animated.View
            style={[
              styles.hudBar,
              styles.hudLeft,
              volumeContainerStyle,
              {
                backgroundColor: theme.glassMedium,
                borderColor: theme.borderMuted,
              },
            ]}
          >
            <View
              style={[styles.hudTrack, { backgroundColor: theme.trackBg }]}
            />
            <Animated.View
              style={[
                styles.hudFill,
                volumeBarStyle,
                { backgroundColor: theme.primary },
              ]}
            />
            <View style={styles.hudIconContainer}>
              <View style={[styles.hudIconBg]}>
                <MaterialCommunityIcons
                  name={volIcon}
                  size={20}
                  color={theme.textPrimary}
                />
              </View>
            </View>
            <View style={styles.hudPercentage}>
              <ReanimatedPercentage
                value={volumeValue}
                color={theme.textPrimary}
                style={styles.hudPercentageText}
              />
            </View>
          </Animated.View>

          {/* Brightness HUD */}
          <Animated.View
            style={[
              styles.hudBar,
              styles.hudRight,
              brightnessContainerStyle,
              {
                backgroundColor: theme.glassMedium,
                borderColor: theme.borderMuted,
              },
            ]}
          >
            <View
              style={[styles.hudTrack, { backgroundColor: theme.trackBg }]}
            />
            <Animated.View
              style={[
                styles.hudFill,
                brightnessBarStyle,
                { backgroundColor: theme.accentWarning },
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
                  name={brightIcon}
                  size={20}
                  color={theme.textPrimary}
                />
              </View>
            </View>
            <View style={styles.hudPercentage}>
              <ReanimatedPercentage
                value={brightnessValue}
                color={theme.textPrimary}
                style={styles.hudPercentageText}
              />
            </View>
          </Animated.View>

          {/* Controls */}
          {showControls && status !== "loading" && status !== "error" && (
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
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  errorBackdrop: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    maxWidth: 320,
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
  },
  rippleText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // HUD Bars
  hudBar: {
    position: "absolute",
    top: "25%",
    bottom: "25%",
    width: 35,
    borderRadius: 26,
    overflow: "hidden",
    zIndex: 999,
    borderWidth: 1,
    justifyContent: "flex-end",
  },
  hudLeft: {
    left: 10,
  },
  hudRight: {
    right: 10,
  },
  hudTrack: {
    ...StyleSheet.absoluteFillObject,
  },
  hudFill: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    borderRadius: 26,
  },
  hudIconContainer: {
    width: "100%",
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 12,
    zIndex: 10,
  },
  hudIconBg: {
    width: 20,
    height: 20,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  hudPercentage: {
    position: "absolute",
    top: 12,
    width: "100%",
    alignItems: "center",
  },
  hudPercentageText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
