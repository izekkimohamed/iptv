// components/SkeletonCard.tsx
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

export const SkeletonCard = ({ width, height, borderRadius = 12 }: any) => {
  const theme = usePlayerTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * 400 - 200 }],
  }));

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.surfaceSecondary,
        },
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <View
          style={{
            width: 200,
            height: "100%",
            backgroundColor: theme.glassHighlight,
          }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: "hidden",
  },
});
