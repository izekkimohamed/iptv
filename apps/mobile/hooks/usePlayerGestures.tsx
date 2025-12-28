import * as Brightness from "expo-brightness";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { VolumeManager } from "react-native-volume-manager";
import { runOnJS } from "react-native-worklets";

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

  // --- Shared Values (Replaces Animated.Value) ---
  const volumeValue = useSharedValue(0);
  const volumeAnim = useSharedValue(0); // Opacity: 0 or 1
  const gestureStartVolume = useSharedValue(0);

  const brightnessValue = useSharedValue(0);
  const brightnessAnim = useSharedValue(0); // Opacity: 0 or 1
  const gestureStartBrightness = useSharedValue(0);

  // Double tap animations
  const leftDoubleTapAnim = useSharedValue(0);
  const rightDoubleTapAnim = useSharedValue(0);

  // Initialize values
  useEffect(() => {
    const initializeValues = async () => {
      try {
        const currentVolume = await VolumeManager.getVolume();
        volumeValue.value = currentVolume.volume;

        const currentBrightness = await Brightness.getBrightnessAsync();
        brightnessValue.value = currentBrightness;
      } catch (error) {
        console.error("Failed to initialize volume/brightness:", error);
      }
    };
    initializeValues();
  }, [brightnessValue, volumeValue]);

  // --- Helpers for Overlay Visibility (UI Thread) ---
  const showVolume = () => {
    "worklet";
    volumeAnim.value = withTiming(1, { duration: 200 });
  };

  const hideVolume = () => {
    "worklet";
    volumeAnim.value = withDelay(1000, withTiming(0, { duration: 500 }));
  };

  const showBrightness = () => {
    "worklet";
    brightnessAnim.value = withTiming(1, { duration: 200 });
  };

  const hideBrightness = () => {
    "worklet";
    brightnessAnim.value = withDelay(1000, withTiming(0, { duration: 500 }));
  };

  // --- Tap Logic ---
  // We use a JS-side ref for double tap timing because complex logic is easier there
  // and double-taps don't require 60fps precision like dragging does.
  const lastTapTimestamp = useRef(0);

  const handleTap = useCallback(() => {
    const now = new Date().getTime();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapTimestamp.current < DOUBLE_TAP_DELAY) {
      // Double Tap detected - return "double" to the gesture
      lastTapTimestamp.current = 0;
      return true;
    } else {
      // Potentially a single tap
      lastTapTimestamp.current = now;
      setTimeout(() => {
        if (lastTapTimestamp.current === now) {
          // No second tap occurred
          setShowControls(!showControls);
        }
      }, DOUBLE_TAP_DELAY);
      return false;
    }
  }, [showControls, setShowControls]);

  const tapGesture = useMemo(() => {
    return Gesture.Tap()
      .maxDuration(250)
      .onStart((e) => {
        "worklet";
        // We calculate side immediately on UI thread for instant visual feedback
        const isRightSide = e.absoluteX > screenWidth.value / 2;

        // Call JS to check timing logic
        runOnJS(handleTapWrapper)(isRightSide);
      });

    // Wrapper to handle the JS logic and callbacks
    function handleTapWrapper(isRightSide: boolean) {
      const isDoubleTap = handleTap();
      if (isDoubleTap) {
        if (isRightSide) {
          // Trigger Reanimated sequence directly
          rightDoubleTapAnim.value = withSequence(
            withTiming(1, { duration: 100 }),
            withDelay(300, withTiming(0, { duration: 300 }))
          );
          if (skipForward) skipForward();
        } else {
          leftDoubleTapAnim.value = withSequence(
            withTiming(1, { duration: 100 }),
            withDelay(300, withTiming(0, { duration: 300 }))
          );
          if (skipBackward) skipBackward();
        }
      }
    }
  }, [
    handleTap,
    screenWidth,
    leftDoubleTapAnim,
    rightDoubleTapAnim,
    skipForward,
    skipBackward,
  ]);

  // --- Pan Gesture (Volume / Brightness) ---
  const BRIGHTNESS_ZONE = 0.5;
  const CONTROL_NONE = 0;
  const CONTROL_BRIGHTNESS = 1;
  const CONTROL_VOLUME = 2;
  const activeControl = useSharedValue(CONTROL_NONE);

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .minDistance(20) // Increased slightly to prevent accidental swipes while tapping
      .onStart((e) => {
        "worklet";
        const relativeX = e.absoluteX / screenWidth.value;

        if (relativeX > BRIGHTNESS_ZONE) {
          activeControl.value = CONTROL_VOLUME;
          gestureStartVolume.value = volumeValue.value;
          showVolume();
        } else {
          activeControl.value = CONTROL_BRIGHTNESS;
          gestureStartBrightness.value = brightnessValue.value;
          showBrightness();
        }
      })
      .onUpdate((e) => {
        "worklet";
        const delta = -e.translationY / 300; // Sensitivity

        if (activeControl.value === CONTROL_VOLUME) {
          const newVal = Math.min(
            Math.max(gestureStartVolume.value + delta, 0),
            1
          );
          if (Math.abs(newVal - volumeValue.value) > 0.005) {
            volumeValue.value = newVal;
            runOnJS(VolumeManager.setVolume)(newVal);
          }
          // Keep overlay visible while dragging
          volumeAnim.value = 1;
        } else if (activeControl.value === CONTROL_BRIGHTNESS) {
          const newVal = Math.min(
            Math.max(gestureStartBrightness.value + delta, 0),
            1
          );
          if (Math.abs(newVal - brightnessValue.value) > 0.005) {
            brightnessValue.value = newVal;
            runOnJS(Brightness.setBrightnessAsync)(newVal);
          }
          brightnessAnim.value = 1;
        }
      })
      .onEnd(() => {
        "worklet";
        if (activeControl.value === CONTROL_VOLUME) {
          hideVolume();
        } else if (activeControl.value === CONTROL_BRIGHTNESS) {
          hideBrightness();
        }
        activeControl.value = CONTROL_NONE;
      });
  }, [
    screenWidth,
    activeControl,
    gestureStartVolume,
    volumeValue,
    gestureStartBrightness,
    brightnessValue,
    volumeAnim,
    brightnessAnim,
  ]);

  const composedGesture = useMemo(() => {
    return Gesture.Simultaneous(tapGesture, panGesture);
  }, [tapGesture, panGesture]);

  return {
    composedGesture,
    tapGesture,
    volumeValue,
    brightnessValue,
    volumeAnim,
    brightnessAnim,
    leftDoubleTapAnim,
    rightDoubleTapAnim,
  };
};
