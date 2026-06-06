import { usePlayerTheme } from "@/theme/playerTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import type { AudioTrack, SubtitleTrack, VideoContentFit, VideoPlayer } from "expo-video";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BorderlessButton, type TapGesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { VideoProgress } from "./VideoProgress";

interface VideoControlsProps {
  player: VideoPlayer;
  isPlaying: boolean;
  isFullScreen: boolean;
  isLive: boolean;
  isLocked: boolean;
  resizeMode: VideoContentFit;
  currentTime?: number;
  duration?: number;
  bufferedPosition?: number;
  resumePosition?: number;
  volume: number;
  playbackRate: number;
  isLoading?: boolean;
  title: string;
  seriesTitle?: string;
  episodeNumber?: string;
  seasonId?: string;
  gesture: TapGesture;
  availableAudioTracks: AudioTrack[];
  availableSubtitleTracks: SubtitleTrack[];
  audioTrack: AudioTrack | null;
  subtitleTrack: SubtitleTrack | null;
  speedSteps: number[];
  isLongPressing?: boolean;
  onPlayPause: () => void;
  onSeek: (position: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleFullScreen: () => void;
  onToggleResizeMode: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onToggleLock: () => void;
  onSetAudioTrack: (track: AudioTrack) => void;
  onSetSubtitleTrack: (track: SubtitleTrack | null) => void;
  onSetPlaybackRate: (rate: number) => void;
  onCycleSpeed: () => void;
  onResetHideTimer: () => void;
  changeSource: (source: string) => void;
  showControls: boolean;
  setShowControls: (show: boolean) => void;
}

// ── Track Picker Sheet ──────────────────────────────────────────────────────
const TrackSheet = ({
  visible,
  onClose,
  availableAudioTracks,
  availableSubtitleTracks,
  audioTrack,
  subtitleTrack,
  playbackRate,
  speedSteps,
  onSetAudioTrack,
  onSetSubtitleTrack,
  onSetPlaybackRate,
}: {
  visible: boolean;
  onClose: () => void;
  availableAudioTracks: AudioTrack[];
  availableSubtitleTracks: SubtitleTrack[];
  audioTrack: AudioTrack | null;
  subtitleTrack: SubtitleTrack | null;
  playbackRate: number;
  speedSteps: number[];
  onSetAudioTrack: (t: AudioTrack) => void;
  onSetSubtitleTrack: (t: SubtitleTrack | null) => void;
  onSetPlaybackRate: (r: number) => void;
}) => {
  const theme = usePlayerTheme();
  const hasAudio = availableAudioTracks.length > 0;
  const hasSubs = availableSubtitleTracks.length > 0;

  if (!hasAudio && !hasSubs) return null;

  const trackLabel = (t: AudioTrack | SubtitleTrack) => {
    const n = (t as { name?: string }).name;
    return n || t.label || t.language || "Unknown";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.surfacePrimary }]}>
        {/* Handle */}
        <View style={[styles.sheetHandle, { backgroundColor: theme.borderStrong }]} />
        <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Playback Settings</Text>

        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Playback speed */}
          <View style={styles.sheetSection}>
            <Text style={[styles.sectionLabel, { color: theme.primary }]}>PLAYBACK SPEED</Text>
            <View style={styles.chipRow}>
              {speedSteps.map((s) => {
                const active = s === playbackRate;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                      active && { backgroundColor: `${theme.primary}22`, borderColor: theme.primary },
                    ]}
                    onPress={() => onSetPlaybackRate(s)}
                    activeOpacity={0.7}
                  >
                    {active && <View style={[styles.chipDot, { backgroundColor: theme.primary }]} />}
                    <Text style={[styles.chipText, { color: active ? theme.primary : theme.textSecondary }]}>
                      {s === 1 ? "Normal" : `${s}×`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {/* Audio tracks */}
          {hasAudio && (
            <View style={styles.sheetSection}>
              <Text style={[styles.sectionLabel, { color: theme.primary }]}>AUDIO TRACK</Text>
              <View style={styles.chipRow}>
                {availableAudioTracks.map((t, i) => {
                  const active = audioTrack
                    ? (t.id ? t.id === audioTrack.id : t.language === audioTrack.language && t.label === audioTrack.label)
                    : false;
                  return (
                    <TouchableOpacity
                      key={t.id ?? `audio-${i}`}
                      style={[
                        styles.chip,
                        { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                        active && { backgroundColor: `${theme.primary}22`, borderColor: theme.primary },
                      ]}
                      onPress={() => onSetAudioTrack(t)}
                      activeOpacity={0.7}
                    >
                      {active && <View style={[styles.chipDot, { backgroundColor: theme.primary }]} />}
                      <Text style={[styles.chipText, { color: active ? theme.primary : theme.textSecondary }]}>
                        {trackLabel(t)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Subtitle tracks */}
          {hasSubs && (
            <View style={styles.sheetSection}>
              <Text style={[styles.sectionLabel, { color: theme.primary }]}>SUBTITLES</Text>
              <View style={styles.chipRow}>
                {/* Off option */}
                <TouchableOpacity
                  style={[
                    styles.chip,
                    { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                    subtitleTrack === null && { backgroundColor: `${theme.primary}22`, borderColor: theme.primary },
                  ]}
                  onPress={() => onSetSubtitleTrack(null)}
                  activeOpacity={0.7}
                >
                  {subtitleTrack === null && <View style={[styles.chipDot, { backgroundColor: theme.primary }]} />}
                  <Text style={[styles.chipText, { color: subtitleTrack === null ? theme.primary : theme.textSecondary }]}>
                    Off
                  </Text>
                </TouchableOpacity>

                {availableSubtitleTracks.map((t, i) => {
                  const active = subtitleTrack
                    ? (t.id ? t.id === subtitleTrack.id : t.language === subtitleTrack.language && t.label === subtitleTrack.label)
                    : false;
                  return (
                    <TouchableOpacity
                      key={t.id ?? `sub-${i}`}
                      style={[
                        styles.chip,
                        { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                        active && { backgroundColor: `${theme.primary}22`, borderColor: theme.primary },
                      ]}
                      onPress={() => onSetSubtitleTrack(t)}
                      activeOpacity={0.7}
                    >
                      {active && <View style={[styles.chipDot, { backgroundColor: theme.primary }]} />}
                      <Text style={[styles.chipText, { color: active ? theme.primary : theme.textSecondary }]}>
                        {trackLabel(t)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

// ── Main Controls ───────────────────────────────────────────────────────────
export const VideoControls = ({
  isPlaying,
  isFullScreen,
  isLive,
  isLocked,
  resizeMode,
  currentTime = 0,
  duration = 0,
  bufferedPosition = 0,
  resumePosition,
  volume,
  title,
  seriesTitle,
  episodeNumber,
  seasonId,
  availableAudioTracks,
  availableSubtitleTracks,
  audioTrack,
  subtitleTrack,
  playbackRate,
  speedSteps,
  isLoading,
  isLongPressing,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleFullScreen,
  onToggleResizeMode,
  onSkipForward,
  onSkipBackward,
  onToggleLock,
  onSetAudioTrack,
  onSetSubtitleTrack,
  onSetPlaybackRate,
  onCycleSpeed,
  onResetHideTimer,
  showControls,
}: VideoControlsProps) => {
  const theme = usePlayerTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  const safeDuration = duration > 0 ? duration : 1;
  const progress = currentTime / safeDuration;

  const hasTracksAvailable = availableAudioTracks.length > 0 || availableSubtitleTracks.length > 0;

  // Top bar slide
  const topY = useSharedValue(0);
  const topOpacity = useSharedValue(1);
  useEffect(() => {
    topY.value = withTiming(showControls ? 0 : -72, { duration: 300 });
    topOpacity.value = withTiming(showControls ? 1 : 0, { duration: 300 });
  }, [showControls]);
  const topBarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: topY.value }],
    opacity: topOpacity.value,
  }));

  // Bottom bar slide
  const botY = useSharedValue(0);
  const botOpacity = useSharedValue(1);
  useEffect(() => {
    botY.value = withTiming(showControls ? 0 : 80, { duration: 300 });
    botOpacity.value = withTiming(showControls ? 1 : 0, { duration: 300 });
  }, [showControls]);
  const bottomBarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: botY.value }],
    opacity: botOpacity.value,
  }));

  // Center fade
  const centerOpacity = useSharedValue(1);
  useEffect(() => {
    centerOpacity.value = withTiming(showControls ? 1 : 0, { duration: 240 });
  }, [showControls]);
  const centerStyle = useAnimatedStyle(() => ({ opacity: centerOpacity.value }));

  const episodeLabel =
    seriesTitle && seasonId && episodeNumber
      ? `Episode ${episodeNumber} · S${seasonId}`
      : seriesTitle ?? null;

  // Animate gradients in sync with controls
  const scrimOpacity = useSharedValue(1);
  useEffect(() => {
    scrimOpacity.value = withTiming(showControls ? 1 : 0, { duration: 300 });
  }, [showControls]);
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrimOpacity.value }));

  // Locked state — only show lock button
  if (isLocked) {
    return (
      <View style={styles.fullOverlay} pointerEvents="box-none">
        <View style={styles.lockedTopBar}>
          <BorderlessButton onPress={onToggleLock} hitSlop={16}>
            <View style={[styles.topActionBtn, styles.lockActiveBtn]}>
              <MaterialCommunityIcons name="lock" size={18} color="#FF6B9D" />
            </View>
          </BorderlessButton>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fullOverlay} pointerEvents="box-none">
      {/* Gradients fade with controls */}
      <Animated.View style={[StyleSheet.absoluteFillObject, scrimStyle]} pointerEvents="none">
        <LinearGradient colors={["rgba(0,0,0,0.85)", "transparent"]} style={styles.topScrim} />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.95)"]} style={styles.bottomScrim} />
      </Animated.View>

      {/* ── Long-press speed indicator ── */}
      {isLongPressing && (
        <View style={styles.speedIndicator} pointerEvents="none">
          <MaterialCommunityIcons name="fast-forward" size={18} color="#fff" />
          <Text style={styles.speedIndicatorText}>2× Speed</Text>
        </View>
      )}

      {/* ── Top Bar ── */}
      <Animated.View style={[styles.topBar, topBarStyle]}>
        <BorderlessButton onPress={() => router.dismiss()} hitSlop={12}>
          <View style={styles.topActionBtn}>
            <MaterialCommunityIcons name="chevron-left" size={22} color="#fff" />
          </View>
        </BorderlessButton>

        <View style={styles.titleBlock}>
          <Text style={styles.mainTitle} numberOfLines={1}>{title}</Text>
          {episodeLabel && (
            <Text style={styles.episodeLabel} numberOfLines={1}>{episodeLabel}</Text>
          )}
        </View>

        <View style={styles.topActions}>
          {/* Gear — only shown when tracks are available */}
          {hasTracksAvailable && (
            <BorderlessButton onPress={() => { setSheetOpen(true); onResetHideTimer(); }} hitSlop={12}>
              <View style={[styles.topActionBtn, sheetOpen && { backgroundColor: `${theme.primary}33` }]}>
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={20}
                  color={sheetOpen ? theme.primary : "#fff"}
                />
              </View>
            </BorderlessButton>
          )}

          {/* Lock */}
          <BorderlessButton onPress={() => { onToggleLock(); onResetHideTimer(); }} hitSlop={12}>
            <View style={[styles.topActionBtn, styles.lockBtn]}>
              <MaterialCommunityIcons name="lock-open-outline" size={18} color="#FF6B9D" />
            </View>
          </BorderlessButton>
        </View>
      </Animated.View>

      {/* ── Center Controls ── */}
      <Animated.View style={[styles.centerControls, centerStyle]} pointerEvents="box-none">
        {!isLive && (
          <BorderlessButton onPress={() => { onSkipBackward(); onResetHideTimer(); }} hitSlop={10}>
            <View style={styles.skipBtn}>
              <MaterialCommunityIcons name="rewind-10" size={28} color="#fff" />
              <Text style={styles.skipLabel}>-10s</Text>
            </View>
          </BorderlessButton>
        )}

        <BorderlessButton onPress={() => { onPlayPause(); onResetHideTimer(); }} hitSlop={8}>
          <View style={styles.playBtn}>
            <MaterialCommunityIcons
              name={isPlaying ? "pause" : "play"}
              size={38}
              color="#fff"
              style={!isPlaying ? { marginLeft: 3 } : undefined}
            />
          </View>
        </BorderlessButton>

        {!isLive && (
          <BorderlessButton onPress={() => { onSkipForward(); onResetHideTimer(); }} hitSlop={10}>
            <View style={styles.skipBtn}>
              <MaterialCommunityIcons name="fast-forward-10" size={28} color="#fff" />
              <Text style={styles.skipLabel}>+10s</Text>
            </View>
          </BorderlessButton>
        )}
      </Animated.View>

      {/* ── Bottom Bar ── */}
      <Animated.View style={[styles.bottomBar, bottomBarStyle]}>
        <VideoProgress
          progress={progress}
          duration={duration}
          currentTime={currentTime}
          bufferedPosition={bufferedPosition}
          resumePosition={resumePosition}
          isLive={isLive}
          volume={volume}
          isFullScreen={isFullScreen}
          resizeMode={resizeMode}
          playbackRate={playbackRate}
          isLoading={isLoading}
          onSeek={onSeek}
          onToggleFullScreen={onToggleFullScreen}
          onTogglePlay={onPlayPause}
          onVolumeChange={onVolumeChange}
          onToggleResizeMode={onToggleResizeMode}
          onCycleSpeed={onCycleSpeed}
        />
      </Animated.View>

      {/* ── Track Picker Sheet ── */}
      <TrackSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        availableAudioTracks={availableAudioTracks}
        availableSubtitleTracks={availableSubtitleTracks}
        audioTrack={audioTrack}
        subtitleTrack={subtitleTrack}
        playbackRate={playbackRate}
        speedSteps={speedSteps}
        onSetAudioTrack={(t) => { onSetAudioTrack(t); }}
        onSetSubtitleTrack={(t) => { onSetSubtitleTrack(t); }}
        onSetPlaybackRate={onSetPlaybackRate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    zIndex: 100,
  },
  topScrim: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 130,
    zIndex: 0,
  },
  bottomScrim: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 180,
    zIndex: 0,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
    zIndex: 10,
  },
  topActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockBtn: {
    backgroundColor: "rgba(255,107,157,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,107,157,0.35)",
  },
  lockActiveBtn: {
    backgroundColor: "rgba(255,107,157,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,107,157,0.5)",
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  mainTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.1,
  },
  episodeLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  topActions: {
    flexDirection: "row",
    gap: 8,
  },

  // Locked
  lockedTopBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 14,
    zIndex: 10,
  },

  // Center
  centerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    zIndex: 10,
  },
  skipBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  skipLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.2,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Bottom
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    zIndex: 10,
  },

  // Speed indicator
  speedIndicator: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 20,
  },
  speedIndicatorText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  // Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: "60%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 20,
  },
  sheetSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
