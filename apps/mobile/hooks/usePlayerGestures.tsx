import * as Brightness from "expo-brightness";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { VolumeManager } from "react-native-volume-manager";

interface UsePlayerGesturesProps {
  showControls: boolean;
  setShowControls: (show: boolean) => void;
  skipForward?: () => void;
  skipBackward?: () => void;
}

export const usePlayerGestures = ({
  showControls,
  setShowControls,
  skipForward,
  skipBackward,
}: UsePlayerGesturesProps) => {
  // Screen width tracking
  const screenWidth = useSharedValue(Dimensions.get("window").width);
  const screenWidthRef = useRef(Dimensions.get("window").width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      screenWidth.value = window.width;
      screenWidthRef.current = window.width;
    });

    return () => subscription?.remove();
  }, [screenWidth]);

  // Volume state and animations
  const volumeValue = useSharedValue(0);
  const gestureStartVolume = useSharedValue(0);
  const volumeAnim = useRef(new Animated.Value(0)).current;
  const [volumeLevel, setVolumeLevel] = useState(0);
  const volumeTimeoutRef = useRef<number | null>(null);

  // Brightness state and animations
  const brightness = useSharedValue(0);
  const gestureStartBrightness = useSharedValue(0);
  const [brightnessLevel, setBrightnessLevel] = useState(0);
  const brightnessAnim = useRef(new Animated.Value(0)).current;
  const brightnessTimeoutRef = useRef<number | null>(null);

  // Gesture tracking
  const startXPosition = useSharedValue(0);
  const lastTapTimestamp = useSharedValue(0);

  // Double tap animations
  const leftDoubleTapAnim = useRef(new Animated.Value(0)).current;
  const rightDoubleTapAnim = useRef(new Animated.Value(0)).current;

  // Initialize volume and brightness on mount
  useEffect(() => {
    const initializeValues = async () => {
      try {
        // Get current system volume
        const currentVolume = await VolumeManager.getVolume();
        volumeValue.value = currentVolume.volume;
        setVolumeLevel(currentVolume.volume);

        // Get current brightness
        const currentBrightness = await Brightness.getBrightnessAsync();
        brightness.value = currentBrightness;
        setBrightnessLevel(currentBrightness);
      } catch (error) {
        console.error("Failed to initialize volume/brightness:", error);
      }
    };

    initializeValues();
  }, [brightness, volumeValue]);

  // Volume overlay animations
  const showVolumeOverlay = useCallback(() => {
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }

    Animated.timing(volumeAnim, {
      toValue: 1,
      duration: 15,
      useNativeDriver: true,
    }).start();

    volumeTimeoutRef.current = setTimeout(() => {
      Animated.timing(volumeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1000);
  }, [volumeAnim]);

  // Brightness overlay animations
  const showBrightnessOverlay = useCallback(() => {
    if (brightnessTimeoutRef.current) {
      clearTimeout(brightnessTimeoutRef.current);
    }

    Animated.timing(brightnessAnim, {
      toValue: 1,
      duration: 15,
      useNativeDriver: true,
    }).start();

    brightnessTimeoutRef.current = setTimeout(() => {
      Animated.timing(brightnessAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1000);
  }, [brightnessAnim]);

  // Double tap feedback animation
  const showDoubleTapFeedback = useCallback(
    (side: "left" | "right") => {
      const anim = side === "left" ? leftDoubleTapAnim : rightDoubleTapAnim;

      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [leftDoubleTapAnim, rightDoubleTapAnim]
  );

  // Handle tap logic (single/double tap detection)
  const handleTap = useCallback(
    (event: { absoluteX: number; absoluteY: number }) => {
      const now = new Date().getTime();
      const DOUBLE_TAP_DELAY = 300; // ms

      if (now - lastTapTimestamp.value < DOUBLE_TAP_DELAY) {
        // This is a double tap
        const tapX = event.absoluteX;

        if (tapX > screenWidthRef.current / 2) {
          showDoubleTapFeedback("right");
          if (skipForward) {
            skipForward();
          }
        } else {
          showDoubleTapFeedback("left");
          if (skipBackward) {
            skipBackward();
          }
        }

        // Reset timestamp to prevent triple tap being detected as another double tap
        lastTapTimestamp.value = 0;
      } else {
        // This is a single tap (for now)
        lastTapTimestamp.value = now;

        // Use a timeout to determine if this was actually a single tap
        setTimeout(() => {
          if (lastTapTimestamp.value === now) {
            // No second tap came in, so this was a single tap
            setShowControls(!showControls);
            lastTapTimestamp.value = 0;
          }
        }, DOUBLE_TAP_DELAY);
      }
    },
    [
      lastTapTimestamp,
      setShowControls,
      showControls,
      showDoubleTapFeedback,
      skipBackward,
      skipForward,
    ]
  );

  // Tap gesture
  const tapGesture = useMemo(() => {
    return Gesture.Tap().onEnd((event) => {
      scheduleOnRN(handleTap, event);
    });
  }, [handleTap]);

  // Pan gesture for volume/brightness control
  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .minDistance(10)
      .onStart((e) => {
        "worklet";
        gestureStartVolume.value = volumeValue.value;
        gestureStartBrightness.value = brightness.value;
        startXPosition.value = e.absoluteX;
      })
      .onUpdate((e) => {
        "worklet";

        const deltaY = e.translationY;
        const delta = -deltaY / 300;
        const relativeX = e.absoluteX / screenWidth.value;

        if (relativeX > 0.5) {
          // RIGHT → VOLUME
          const newVolume = gestureStartVolume.value + delta;
          const clamped = Math.min(Math.max(newVolume, 0), 1);

          if (Math.abs(clamped - volumeValue.value) >= 0.01) {
            volumeValue.value = clamped;

            scheduleOnRN(setVolumeLevel, clamped);
            scheduleOnRN(showVolumeOverlay);
            scheduleOnRN(VolumeManager.setVolume, clamped);
          }
        } else {
          // LEFT → BRIGHTNESS
          const newBrightness = gestureStartBrightness.value + delta;
          const clampedBrightness = Math.min(Math.max(newBrightness, 0), 1);

          if (Math.abs(clampedBrightness - brightness.value) >= 0.01) {
            brightness.value = clampedBrightness;

            scheduleOnRN(setBrightnessLevel, clampedBrightness);
            scheduleOnRN(showBrightnessOverlay);
            scheduleOnRN(Brightness.setBrightnessAsync, clampedBrightness);
          }
        }
      })
      .onEnd(() => {});
  }, [
    brightness,
    gestureStartBrightness,
    gestureStartVolume,
    showBrightnessOverlay,
    showVolumeOverlay,
    startXPosition,
    volumeValue,
  ]);

  // Composed gesture
  const composedGesture = useMemo(() => {
    return Gesture.Simultaneous(tapGesture, panGesture);
  }, [tapGesture, panGesture]);

  return {
    // Gestures
    composedGesture,
    tapGesture,

    // Volume state
    volumeLevel,
    volumeAnim,

    // Brightness state
    brightnessLevel,
    brightnessAnim,

    // Double tap animations
    leftDoubleTapAnim,
    rightDoubleTapAnim,
  };
};
