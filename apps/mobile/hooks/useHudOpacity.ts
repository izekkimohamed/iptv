// src/components/player/useHudOpacity.ts
import { useEffect } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";

export const useHudOpacity = (visible: boolean) => {
  const opacity = useSharedValue(visible ? 1 : 0.85);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0.82, { duration: 300 });
  }, [visible]);

  return opacity;
};
