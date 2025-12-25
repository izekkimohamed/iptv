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

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <LinearGradient
      colors={[
        "rgba(0,0,0,0.6)",
        "transparent",
        "transparent",
        "rgba(0,0,0,0.6)",
      ]}
      style={styles.fullOverlay}
    >
      {/* Top Bar */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {isFullScreen && (
          <BorderlessButton
            style={styles.closeBtn}
            onPress={onToggleFullScreen}
          >
            <MaterialCommunityIcons
              name='close'
              size={24}
              color={theme.primary}
            />
          </BorderlessButton>
        )}
      </View>

      {/* Center Group */}
      <View style={styles.centerRow}>
        {!isLive && (
          <BorderlessButton
            onPress={onSkipBackward}
            style={styles.secondaryCircle}
          >
            <View
              style={[
                styles.buttonInner,
                {
                  backgroundColor: theme.glassLight,
                  borderColor: theme.trackBg,
                },
              ]}
            >
              <MaterialCommunityIcons
                name='rewind-10'
                size={30}
                color={theme.primary}
              />
            </View>
          </BorderlessButton>
        )}

        <BorderlessButton onPress={onPlayPause} style={styles.mainPlayBtn}>
          <View
            style={[
              styles.buttonInner,
              {
                backgroundColor: theme.glassMedium,
                borderColor: theme.primaryDark,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={isPlaying ? "pause" : "play"}
              size={45}
              color={theme.textSecondary}
            />
          </View>
        </BorderlessButton>
        {!isLive && (
          <BorderlessButton
            onPress={onSkipForward}
            style={styles.secondaryCircle}
          >
            <View
              style={[
                styles.buttonInner,
                {
                  backgroundColor: theme.glassLight,
                  borderColor: theme.trackBg,
                },
              ]}
            >
              <MaterialCommunityIcons
                name='fast-forward-10'
                size={30}
                color={theme.primary}
              />
            </View>
          </BorderlessButton>
        )}
      </View>

      {/* Bottom Progress Area */}
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
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  title: { color: "white", fontSize: 16, fontWeight: "bold", flex: 1 },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  mainPlayBtn: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonInner: {
    width: 70,
    height: 70,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: { width: "100%" },
  closeBtn: { padding: 8 },
});
