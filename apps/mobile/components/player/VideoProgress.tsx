import { usePlayerTheme } from "@/theme/playerTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { VideoContentFit } from "expo-video";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
      return "arrow-collapse"; // Indicates fitting inside
    case "cover":
      return "arrow-expand"; // Indicates filling/cropping
    case "fill":
      return "stretch-to-page"; // Indicates stretching
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

  const handleSeek = (value: number) => {
    setIsSeeking(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSeek?.(value * duration);
  };

  const progressData = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(1);

  useEffect(() => {
    if (!isSeeking) {
      progressData.value = progress;
    }
    min.value = 0;
    max.value = 1;
  }, [progress, duration, progressData, min, max, isSeeking]);

  const handleButtonPress = useCallback((action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action();
  }, []);

  return (
    <View style={styles.container}>
      {/* Progress Slider */}
      <View style={styles.sliderSection}>
        {!isLive && (
          <>
            <Slider
              style={styles.slider}
              minimumValue={min}
              maximumValue={max}
              progress={progressData}
              onSlidingStart={() => {
                setIsSeeking(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              onSlidingComplete={handleSeek}
              renderThumb={() => (
                <View
                  style={[
                    styles.customThumb,
                    {
                      backgroundColor: theme.primary,
                      borderColor: theme.primaryDark,
                    },
                  ]}
                />
              )}
              containerStyle={{
                width: "100%",
                height: 8,
                borderRadius: 4,
                overflow: "hidden",
                backgroundColor: theme.trackBg,
              }}
              theme={{
                minimumTrackTintColor: theme.primary,
                maximumTrackTintColor: theme.trackBg,
                cacheTrackTintColor: theme.trackBg,
                disableMinTrackTintColor: theme.trackBg,
                bubbleBackgroundColor: theme.primary,
              }}
            />
          </>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.controlsRow}>
        {isLive ?
          <View style={styles.liveContainer}>
            <View style={styles.liveIndicator}>
              <Text style={[styles.liveText, { color: theme.accentSuccess }]}>
                LIVE
              </Text>
            </View>
          </View>
        : <View style={styles.timeInfo}>
            <Text style={[styles.currentTime, { color: theme.primary }]}>
              {formatTime(currentTime)}
            </Text>
            <Text style={[styles.separator, { color: theme.textMuted }]}>
              /
            </Text>
            <Text style={[styles.duration, { color: theme.textSecondary }]}>
              {formatTime(duration)}
            </Text>
          </View>
        }
        <View
          style={{
            flexDirection: "row",
            gap: 10,
          }}
        >
          <BorderlessButton
            style={styles.controlButton}
            onPress={(e) => {
              handleButtonPress(() => onVolumeChange(volume === 0 ? 1 : 0));
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View
              style={[
                styles.buttonInner,
                {
                  backgroundColor: theme.glassLight,
                  borderColor: theme.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={volume === 0 ? "volume-mute" : "volume-high"}
                size={20}
                color={theme.primary}
              />
            </View>
          </BorderlessButton>

          <BorderlessButton
            style={styles.controlButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onToggleResizeMode();
            }}
          >
            <View
              style={[
                styles.buttonInner,
                {
                  backgroundColor: theme.glassLight,
                  borderColor: theme.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={getResizeIcon(resizeMode)}
                size={20}
                color={theme.primary}
              />
            </View>
          </BorderlessButton>

          <BorderlessButton
            style={styles.controlButton}
            onPress={() => handleButtonPress(onToggleFullScreen)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View
              style={[
                styles.buttonInner,
                {
                  backgroundColor: theme.glassLight,
                  borderColor: theme.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={isFullScreen ? "fullscreen-exit" : "fullscreen"}
                size={20}
                color={theme.primary}
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
    gap: 12,
  },
  sliderSection: {
    gap: 8,
  },
  slider: {
    height: 8,
    marginTop: 4,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    paddingHorizontal: 4,
  },
  currentTime: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 0.3,
  },
  separator: {
    fontSize: 12,
    fontWeight: "600",
  },
  duration: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "monospace",
    letterSpacing: 0.3,
  },
  customThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  liveContainer: {
    gap: 8,
  },
  liveBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 4,
  },
  liveProgress: {
    height: "100%",
    borderRadius: 4,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    paddingHorizontal: 4,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  controlButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 44,
    height: 44,
  },
  buttonInner: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  resizeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Glass effect
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  resizeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resizeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
