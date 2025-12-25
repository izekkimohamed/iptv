// src/components/player/usePlayGlow.ts
import { useEffect } from "react";
import {
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const usePlayGlow = (isPlaying: boolean) => {
  const glow = useSharedValue(0.4);

  useEffect(() => {
    if (isPlaying) {
      glow.value = withRepeat(withTiming(1, { duration: 1800 }), -1, true);
    } else {
      glow.value = withTiming(0.4, { duration: 300 });
    }
  }, [isPlaying]);

  return glow;
};
