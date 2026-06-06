import { usePlayerTheme } from "@/theme/playerTheme";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

"use no memo";

const ShimmerOverlay = () => {
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  }, [shimmer]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * 400 - 200 }],
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      <View style={styles.shimmerStreak} />
    </Animated.View>
  );
};

export const SkeletonCard = ({ width, height, borderRadius = 12 }: { width: number | string; height: number; borderRadius?: number }) => {
  const theme = usePlayerTheme();
  return (
    <View style={[styles.skeleton, { width: width as any, height, borderRadius, backgroundColor: theme.surfaceSecondary }]}>
      <ShimmerOverlay />
    </View>
  );
};

export const SkeletonRow = () => {
  const theme = usePlayerTheme();
  return (
    <View style={[styles.row, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
      <View style={[styles.rowThumb, { backgroundColor: theme.surfaceTertiary }]}>
        <ShimmerOverlay />
      </View>
      <View style={styles.rowLines}>
        <View style={[styles.line, styles.lineWide, { backgroundColor: theme.surfaceTertiary }]}>
          <ShimmerOverlay />
        </View>
        <View style={[styles.line, styles.lineNarrow, { backgroundColor: theme.surfaceTertiary }]}>
          <ShimmerOverlay />
        </View>
        <View style={[styles.line, styles.lineProgress, { backgroundColor: theme.surfaceTertiary }]}>
          <ShimmerOverlay />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: { overflow: "hidden" },
  shimmerStreak: {
    width: 200,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 4,
    borderWidth: 1,
    overflow: "hidden",
  },
  rowThumb: {
    width: 64,
    height: 46,
    borderRadius: 10,
    overflow: "hidden",
  },
  rowLines: {
    flex: 1,
    marginLeft: 14,
    gap: 8,
  },
  line: {
    borderRadius: 4,
    overflow: "hidden",
  },
  lineWide: { height: 14, width: "65%" },
  lineNarrow: { height: 11, width: "45%" },
  lineProgress: { height: 3, width: "80%", borderRadius: 2 },
});
