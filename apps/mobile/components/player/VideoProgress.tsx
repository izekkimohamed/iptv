import { usePlayerTheme } from "@/theme/playerTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { VideoContentFit } from "expo-video";
import { useCallback, useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Slider } from "react-native-awesome-slider";
import { BorderlessButton } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

interface VideoProgressProps {
  progress: number;
  duration: number;
  currentTime: number;
  isLive?: boolean;
  isFullScreen: boolean;
  volume: number;
  resizeMode: VideoContentFit;
  onSeek?: (time: number) => void;
  onToggleFullScreen: () => void;
  onVolumeChange: (volume: number) => void;
  onTogglePlay: () => void;
  onToggleResizeMode: () => void;
}

const formatTime = (timeInSeconds: number) => {
  if (!timeInSeconds || isNaN(timeInSeconds)) return "00:00";
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const getResizeIcon = (mode: VideoContentFit) => {
  switch (mode) {
    case "contain":
      return "fit-to-page-outline";
    case "cover":
      return "arrow-expand-all";
    case "fill":
      return "stretch-to-page-outline";
    default:
      return "fullscreen";
  }
};

export const VideoProgress = ({
  progress,
  duration,
  currentTime,
  isLive,
  volume,
  isFullScreen,
  resizeMode,
  onToggleResizeMode,
  onSeek,
  onToggleFullScreen,
  onVolumeChange,
}: VideoProgressProps) => {
  const theme = usePlayerTheme();
  const [isSeeking, setIsSeeking] = useState(false);

  const progressData = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(1);

  const handleSeek = (value: number) => {
    setIsSeeking(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSeek?.(value * duration);
  };

  useEffect(() => {
    if (!isSeeking) {
      progressData.value = progress;
    }
    min.value = 0;
    max.value = 1;
  }, [progress, duration, progressData, min, max, isSeeking]);

  const handleButtonPress = useCallback((action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  }, []);

  return (
    <View style={styles.container}>
      {/* Slider Section */}
      {!isLive && (
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={min}
            maximumValue={max}
            progress={progressData}
            onSlidingStart={() => {
              setIsSeeking(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            onSlidingComplete={handleSeek}
            renderThumb={() => (
              <View style={styles.thumbContainer}>
                <View
                  style={[
                    styles.thumbGlow,
                    { backgroundColor: theme.primaryGlow },
                  ]}
                />
                <View
                  style={[
                    styles.customThumb,
                    {
                      backgroundColor: theme.primary,
                      shadowColor: theme.glow,
                    },
                  ]}
                />
              </View>
            )}
            containerStyle={styles.sliderTrackContainer}
            theme={{
              minimumTrackTintColor: theme.primary,
              maximumTrackTintColor: theme.trackBg,
              bubbleBackgroundColor: theme.primary,
            }}
          />
        </View>
      )}

      {/* Bottom Controls Row */}
      <View style={[styles.controlsRow, { backgroundColor: theme.glassLight }]}>
        {/* Left Side: Time or Live Badge */}
        <View style={styles.leftGroup}>
          {isLive ?
            <View
              style={[
                styles.liveContainer,
                {
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                },
              ]}
            >
              <View style={styles.liveDotContainer}>
                <View
                  style={[
                    styles.liveDot,
                    { backgroundColor: theme.accentError },
                  ]}
                />
                <View
                  style={[
                    styles.livePulse,
                    { backgroundColor: theme.accentError },
                  ]}
                />
              </View>
              <Text style={[styles.liveText, { color: theme.textPrimary }]}>
                LIVE
              </Text>
            </View>
          : <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: theme.textPrimary }]}>
                {formatTime(currentTime)}
              </Text>
              <Text style={[styles.timeSeparator, { color: theme.textMuted }]}>
                /
              </Text>
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                {formatTime(duration)}
              </Text>
            </View>
          }
        </View>

        {/* Right Side: Action Icons */}
        <View style={styles.rightGroup}>
          {/* Volume */}
          <BorderlessButton
            onPress={() =>
              handleButtonPress(() => onVolumeChange(volume === 0 ? 1 : 0))
            }
            style={styles.iconButton}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: theme.glassLight },
              ]}
            >
              <MaterialCommunityIcons
                name={volume === 0 ? "volume-mute" : "volume-high"}
                size={20}
                color={theme.textPrimary}
              />
            </View>
          </BorderlessButton>

          {/* Resize */}
          <BorderlessButton
            onPress={() => handleButtonPress(onToggleResizeMode)}
            style={styles.iconButton}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: theme.glassLight },
              ]}
            >
              <MaterialCommunityIcons
                name={getResizeIcon(resizeMode)}
                size={20}
                color={theme.textPrimary}
              />
            </View>
          </BorderlessButton>

          {/* Fullscreen */}
          <BorderlessButton
            onPress={() => handleButtonPress(onToggleFullScreen)}
            style={styles.iconButton}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: theme.glassLight },
              ]}
            >
              <MaterialCommunityIcons
                name={isFullScreen ? "fullscreen-exit" : "fullscreen"}
                size={22}
                color={theme.textPrimary}
              />
            </View>
          </BorderlessButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  sliderContainer: {
    paddingHorizontal: 4,
    height: 24,
    justifyContent: "center",
  },
  slider: {
    height: 5,
    width: "100%",
  },
  sliderTrackContainer: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  thumbContainer: {
    position: "relative",
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbGlow: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.4,
  },
  customThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "white",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backdropFilter: "blur(10px)",
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  // Time Styles
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  timeSeparator: {
    fontSize: 13,
    opacity: 0.5,
  },
  // Live Styles
  liveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  liveDotContainer: {
    position: "relative",
    width: 10,
    height: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  livePulse: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.4,
    zIndex: 1,
  },
  liveText: {
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 1,
  },
  // Icon Buttons
  iconButton: {
    padding: 2,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
});
