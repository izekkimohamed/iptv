import { usePlayerTheme } from "@/theme/playerTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { VideoContentFit, VideoPlayer } from "expo-video";
import { StyleSheet, Text, View } from "react-native";
import {
  BorderlessButton,
  type TapGesture,
} from "react-native-gesture-handler";
import { VideoProgress } from "./VideoProgress";

interface VideoControlsProps {
  player: VideoPlayer;
  isPlaying: boolean;
  isFullScreen: boolean;
  isLive: boolean;
  resizeMode: VideoContentFit;
  currentTime?: number;
  duration?: number;
  volume: number;
  title: string;
  gesture: TapGesture;

  onPlayPause: () => void;
  onSeek: (position: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleFullScreen: () => void;
  onToggleResizeMode: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  changeSource: (source: string) => void;
  showControls: boolean;
  setShowControls: (show: boolean) => void;
}

export const VideoControls = ({
  isPlaying,
  isFullScreen,
  isLive,
  resizeMode,
  currentTime = 0,
  duration = 0,
  volume,
  title,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleFullScreen,
  onToggleResizeMode,
  onSkipForward,
  onSkipBackward,
}: VideoControlsProps) => {
  const theme = usePlayerTheme();

  // Protect against NaN
  const safeDuration = duration > 0 ? duration : 1;
  const progress = currentTime / safeDuration;

  return (
    <LinearGradient
      colors={[
        "rgba(10, 10, 15, 0.85)",
        "rgba(10, 10, 15, 0.4)",
        "transparent",
        "rgba(10, 10, 15, 0.4)",
        "rgba(10, 10, 15, 0.9)",
      ]}
      locations={[0, 0.12, 0.5, 0.88, 1]}
      style={styles.fullOverlay}
    >
      {/* --- Top Bar --- */}
      <View style={styles.header}>
        <View
          style={[styles.headerContent, { backgroundColor: theme.glassLight }]}
        >
          <View style={styles.titleRow}>
            <View
              style={[
                styles.titleIndicator,
                { backgroundColor: theme.primary },
              ]}
            />
            <Text
              style={[styles.title, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        </View>

        {isFullScreen && (
          <BorderlessButton
            onPress={onToggleFullScreen}
            style={styles.closeBtn}
          >
            <View
              style={[
                styles.closeBtnWrapper,
                { backgroundColor: theme.glassLight },
              ]}
            >
              <MaterialCommunityIcons
                name='close'
                size={24}
                color={theme.textPrimary}
              />
            </View>
          </BorderlessButton>
        )}
      </View>

      {/* --- Center Controls --- */}
      <View style={styles.centerControls}>
        {!isLive && (
          <BorderlessButton onPress={onSkipBackward} style={styles.skipButton}>
            <View
              style={[
                styles.skipButtonWrapper,
                { backgroundColor: theme.glassLight },
              ]}
            >
              <MaterialCommunityIcons
                name='rewind-10'
                size={28}
                color={theme.textPrimary}
              />
            </View>
          </BorderlessButton>
        )}

        <BorderlessButton onPress={onPlayPause} style={styles.playButton}>
          <View
            style={[
              styles.playBackdrop,
              {
                backgroundColor: theme.glassHighlight,
                borderColor: theme.borderMuted,
              },
            ]}
          >
            <View
              style={[styles.playGlow, { backgroundColor: theme.glassLight }]}
            />
            <MaterialCommunityIcons
              name={isPlaying ? "pause" : "play"}
              size={42}
              color={theme.primary}
            />
          </View>
        </BorderlessButton>

        {!isLive && (
          <BorderlessButton onPress={onSkipForward} style={styles.skipButton}>
            <View
              style={[
                styles.skipButtonWrapper,
                { backgroundColor: theme.glassLight },
              ]}
            >
              <MaterialCommunityIcons
                name='fast-forward-10'
                size={28}
                color={theme.textPrimary}
              />
            </View>
          </BorderlessButton>
        )}
      </View>

      {/* --- Bottom Section --- */}
      <View style={styles.footer}>
        <VideoProgress
          progress={progress}
          duration={duration}
          currentTime={currentTime}
          isLive={isLive}
          volume={volume}
          isFullScreen={isFullScreen}
          resizeMode={resizeMode}
          onSeek={onSeek}
          onToggleFullScreen={onToggleFullScreen}
          onTogglePlay={onPlayPause}
          onVolumeChange={onVolumeChange}
          onToggleResizeMode={onToggleResizeMode}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 100,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 4,
    gap: 12,
  },
  headerContent: {
    flex: 1,
    borderRadius: 160,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backdropFilter: "blur(10px)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleIndicator: {
    width: 3,
    height: 16,
    borderRadius: 1.5,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  closeBtn: {
    padding: 0,
  },
  closeBtnWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },

  // Center Controls
  centerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    width: "100%",
  },
  skipButton: {
    padding: 0,
  },
  skipButtonWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  playButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  playBackdrop: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    backdropFilter: "blur(10px)",
    overflow: "hidden",
  },
  playGlow: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.3,
  },

  // Footer
  footer: {
    width: "100%",
  },
});
