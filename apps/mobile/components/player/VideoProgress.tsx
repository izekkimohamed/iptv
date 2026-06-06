import { usePlayerTheme } from "@/theme/playerTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { VideoContentFit } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Slider } from "react-native-awesome-slider";
import { BorderlessButton } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

"use no memo";

interface VideoProgressProps {
  progress: number;
  duration: number;
  currentTime: number;
  bufferedPosition?: number;
  resumePosition?: number;
  isLive?: boolean;
  isFullScreen: boolean;
  volume: number;
  playbackRate: number;
  resizeMode: VideoContentFit;
  isLoading?: boolean;
  onSeek?: (time: number) => void;
  onToggleFullScreen: () => void;
  onVolumeChange: (volume: number) => void;
  onTogglePlay: () => void;
  onToggleResizeMode: () => void;
  onCycleSpeed: () => void;
}

const formatTime = (s: number) => {
  if (!s || isNaN(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const RESIZE_LABELS: Record<VideoContentFit, { icon: keyof typeof import("@expo/vector-icons").MaterialCommunityIcons.glyphMap; label: string }> = {
  contain: { icon: "rectangle-outline", label: "Fit"  },
  cover:   { icon: "crop",              label: "Crop" },
  fill:    { icon: "rectangle",         label: "Fill" },
};

// ── Shimmer skeleton bar ──────────────────────────────────────────────────
const ShimmerBar = () => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  }, [anim]);
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] });
  return <Animated.View style={[styles.shimmerBar, { opacity }]} />;
};

export const VideoProgress = ({
  progress,
  duration,
  currentTime,
  bufferedPosition = 0,
  resumePosition,
  isLive,
  volume,
  isFullScreen,
  resizeMode,
  playbackRate,
  isLoading,
  onToggleResizeMode,
  onSeek,
  onToggleFullScreen,
  onVolumeChange,
  onCycleSpeed,
}: VideoProgressProps) => {
  const theme = usePlayerTheme();
  const [isSeeking, setIsSeeking] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);

  const progressData = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(1);
  const volumeProgress = useSharedValue(volume);
  const volMin = useSharedValue(0);
  const volMax = useSharedValue(1);

  useEffect(() => {
    if (!isSeeking) progressData.value = progress;
    min.value = 0;
    max.value = 1;
  }, [progress, duration, progressData, min, max, isSeeking]);

  useEffect(() => {
    volumeProgress.value = volume;
  }, [volume, volumeProgress]);

  const handleSeek = (value: number) => {
    setIsSeeking(false);
    setPreviewTime(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSeek?.(value * duration);
  };

  const handlePress = useCallback((action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  }, []);

  const bufferedFraction = duration > 0 ? Math.min(bufferedPosition / duration, 1) : 0;
  const resumeFraction = duration > 0 && resumePosition ? Math.min(resumePosition / duration, 1) : null;
  const speedLabel = playbackRate === 1 ? "1×" : `${playbackRate}×`;

  return (
    <View style={styles.container}>
      {!isLive ? (
        <>
          {/* Time row */}
          <View style={styles.timeRow}>
            <Text style={styles.timeCurrent}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeDuration}>{formatTime(duration)}</Text>
          </View>

          {/* Seekbar with buffer + resume marker */}
          <View style={styles.seekbarWrap}>
            {isLoading ? (
              <ShimmerBar />
            ) : (
              <View style={styles.seekbarStack}>
                {/* Buffer track underneath */}
                <View style={styles.bufferTrack}>
                  <View
                    style={[
                      styles.bufferFill,
                      { width: `${bufferedFraction * 100}%` },
                    ]}
                  />
                </View>

                {/* Resume position dot */}
                {resumeFraction !== null && (
                  <View
                    style={[
                      styles.resumeDot,
                      { left: `${resumeFraction * 100}%` as any },
                    ]}
                  />
                )}

                {/* Main slider on top */}
                <Slider
                  style={styles.slider}
                  minimumValue={min}
                  maximumValue={max}
                  progress={progressData}
                  onValueChange={(v) => setPreviewTime(v * duration)}
                  onSlidingStart={() => {
                    setIsSeeking(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                  onSlidingComplete={handleSeek}
                  renderBubble={() =>
                    previewTime !== null ? (
                      <View style={styles.bubble}>
                        <Text style={styles.bubbleText}>{formatTime(previewTime)}</Text>
                      </View>
                    ) : null
                  }
                  containerStyle={styles.trackContainer}
                  theme={{
                    minimumTrackTintColor: theme.primary,
                    maximumTrackTintColor: "transparent",
                    bubbleBackgroundColor: "rgba(0,0,0,0.8)",
                  }}
                />
              </View>
            )}
          </View>
        </>
      ) : null}

      {/* Bottom controls row */}
      <View style={styles.controlsRow}>
        {/* Left: volume */}
        <View style={styles.leftGroup}>
          <BorderlessButton
            onPress={() => handlePress(() => onVolumeChange(volume === 0 ? 1 : 0))}
            hitSlop={10}
          >
            <MaterialCommunityIcons
              name={volume === 0 ? "volume-mute" : volume < 0.5 ? "volume-medium" : "volume-high"}
              size={20}
              color="rgba(255,255,255,0.7)"
            />
          </BorderlessButton>
          <View style={styles.volSliderWrap}>
            <Slider
              style={styles.volSlider}
              minimumValue={volMin}
              maximumValue={volMax}
              progress={volumeProgress}
              onSlidingStart={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              onValueChange={(v) => { volumeProgress.value = v; onVolumeChange(v); }}
              onSlidingComplete={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onVolumeChange(v);
              }}
              renderBubble={() => null}
              containerStyle={styles.volTrackContainer}
              theme={{
                minimumTrackTintColor: theme.primary,
                maximumTrackTintColor: "rgba(255,255,255,0.2)",
                bubbleBackgroundColor: "transparent",
              }}
            />
          </View>
        </View>

        {/* Right: live badge / speed + resize + fullscreen */}
        <View style={styles.rightGroup}>
          {isLive ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          ) : (
            <BorderlessButton onPress={() => handlePress(onCycleSpeed)} hitSlop={10}>
              <View style={[styles.pill, playbackRate !== 1 && { borderColor: theme.primary }]}>
                <Text style={[styles.pillText, playbackRate !== 1 && { color: theme.primary }]}>
                  {speedLabel}
                </Text>
              </View>
            </BorderlessButton>
          )}

          <BorderlessButton onPress={() => handlePress(onToggleResizeMode)} hitSlop={10}>
            <View style={styles.resizePill}>
              <MaterialCommunityIcons
                name={RESIZE_LABELS[resizeMode]?.icon ?? "rectangle-outline"}
                size={14}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={styles.resizeLabel}>
                {RESIZE_LABELS[resizeMode]?.label ?? "Fit"}
              </Text>
            </View>
          </BorderlessButton>

          <BorderlessButton onPress={() => handlePress(onToggleFullScreen)} hitSlop={10}>
            <MaterialCommunityIcons
              name={isFullScreen ? "fullscreen-exit" : "fullscreen"}
              size={22}
              color="#fff"
            />
          </BorderlessButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 8 },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  timeCurrent: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
    fontVariant: ["tabular-nums"],
  },
  timeDuration: {
    fontSize: 12,
    fontWeight: "400",
    color: "rgba(255,255,255,0.45)",
    fontVariant: ["tabular-nums"],
  },

  seekbarWrap: {
    height: 20,
    justifyContent: "center",
  },
  seekbarStack: {
    height: 20,
    justifyContent: "center",
    position: "relative",
  },
  // Buffer track sits behind the slider
  bufferTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  bufferFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 2,
  },
  // Resume position marker
  resumeDot: {
    position: "absolute",
    top: "50%",
    marginTop: -4,
    width: 3,
    height: 8,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.6)",
    zIndex: 2,
    transform: [{ translateX: -1.5 }],
  },
  slider: { height: 4, width: "100%" },
  trackContainer: { height: 4, borderRadius: 2 },

  // Shimmer
  shimmerBar: {
    height: 4,
    width: "100%",
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginTop: 2,
  },
  leftGroup: { flexDirection: "row", alignItems: "center" },
  rightGroup: { flexDirection: "row", alignItems: "center", gap: 12 },

  volSliderWrap: {
    width: 72,
    height: 28,
    justifyContent: "center",
    marginLeft: 8,
  },
  volSlider: { height: 3, width: "100%" },
  volTrackContainer: { height: 3, borderRadius: 2 },

  // Speed pill
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.3,
  },

  // Resize pill
  resizePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  resizeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.3,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { fontSize: 11, fontWeight: "800", color: "#fff", letterSpacing: 1 },

  bubble: {
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  bubbleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    fontVariant: ["tabular-nums"],
  },
});
