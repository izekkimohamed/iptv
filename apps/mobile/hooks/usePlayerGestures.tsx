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
  seekBy?: (seconds: number) => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
  onPinch?: () => void;
}

export const usePlayerGestures = ({
  showControls,
  setShowControls,
  skipForward,
  skipBackward,
  seekBy,
  onLongPressStart,
  onLongPressEnd,
  onPinch,
}: UsePlayerGesturesProps) => {
  const screenWidth = useSharedValue(Dimensions.get("window").width);
  const screenWidthRef = useRef(Dimensions.get("window").width);

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      screenWidth.value = window.width;
      screenWidthRef.current = window.width;
    });
    return () => sub?.remove();
  }, [screenWidth]);

  // --- Volume / Brightness shared values ---
  const volumeValue = useSharedValue(0);
  const volumeAnim = useSharedValue(0);
  const gestureStartVolume = useSharedValue(0);
  const brightnessValue = useSharedValue(0);
  const brightnessAnim = useSharedValue(0);
  const gestureStartBrightness = useSharedValue(0);

  // --- Double-tap ripple animation values ---
  const leftDoubleTapAnim = useSharedValue(0);
  const rightDoubleTapAnim = useSharedValue(0);

  // Seek seconds shown in the ripple label (shared so Reanimated can read on UI thread)
  const leftSeekSeconds = useSharedValue(10);
  const rightSeekSeconds = useSharedValue(10);

  useEffect(() => {
    const init = async () => {
      try {
        const v = await VolumeManager.getVolume();
        volumeValue.value = v.volume;
        const b = await Brightness.getBrightnessAsync();
        brightnessValue.value = b;
      } catch {}
    };
    init();
  }, [brightnessValue, volumeValue]);

  // --- Volume / Brightness overlay helpers ---
  const showVolume = () => { "worklet"; volumeAnim.value = withTiming(1, { duration: 200 }); };
  const hideVolume = () => { "worklet"; volumeAnim.value = withDelay(1000, withTiming(0, { duration: 500 })); };
  const showBrightness = () => { "worklet"; brightnessAnim.value = withTiming(1, { duration: 200 }); };
  const hideBrightness = () => { "worklet"; brightnessAnim.value = withDelay(1000, withTiming(0, { duration: 500 })); };

  // --- Multi-tap accumulation state (JS thread) ---
  // Each side tracks: last tap timestamp, tap count, and a pending reset timer
  const tapState = useRef({
    left:  { count: 0, lastTs: 0, timer: null as ReturnType<typeof setTimeout> | null },
    right: { count: 0, lastTs: 0, timer: null as ReturnType<typeof setTimeout> | null },
  });

  const MULTI_TAP_WINDOW = 500; // ms — window to accumulate taps
  const SECONDS_PER_TAP = 10;

  const triggerRipple = useCallback((side: "left" | "right", seconds: number) => {
    if (side === "left") {
      leftSeekSeconds.value = seconds;
      // Re-trigger: snap to 1 instantly then fade out, so each extra tap refreshes the overlay
      leftDoubleTapAnim.value = withSequence(
        withTiming(1, { duration: 80 }),
        withDelay(600, withTiming(0, { duration: 350 })),
      );
    } else {
      rightSeekSeconds.value = seconds;
      rightDoubleTapAnim.value = withSequence(
        withTiming(1, { duration: 80 }),
        withDelay(600, withTiming(0, { duration: 350 })),
      );
    }
  }, [leftDoubleTapAnim, rightDoubleTapAnim, leftSeekSeconds, rightSeekSeconds]);

  const commitSeek = useCallback((side: "left" | "right", totalSeconds: number) => {
    if (side === "right") {
      if (seekBy) seekBy(totalSeconds);
      else if (skipForward) skipForward();
    } else {
      if (seekBy) seekBy(-totalSeconds);
      else if (skipBackward) skipBackward();
    }
  }, [seekBy, skipForward, skipBackward]);

  const handleTap = useCallback((isRightSide: boolean) => {
    const now = Date.now();
    const side = isRightSide ? "right" : "left";
    const oppSide = isRightSide ? "left" : "right";
    const state = tapState.current[side];
    const oppState = tapState.current[oppSide];

    // If tapping the opposite side, reset that side immediately
    if (oppState.count > 0) {
      if (oppState.timer) clearTimeout(oppState.timer);
      oppState.count = 0;
      oppState.lastTs = 0;
    }

    const isWithinWindow = now - state.lastTs < MULTI_TAP_WINDOW;

    if (isWithinWindow && state.count > 0) {
      // Accumulate
      state.count += 1;
    } else {
      // First tap — check if it's a single tap (show/hide controls) or start of multi-tap
      // We defer the single-tap action to see if a second tap follows
      state.count = 1;
    }

    state.lastTs = now;

    const currentCount = state.count;
    const totalSeconds = currentCount * SECONDS_PER_TAP;

    // Show ripple immediately on every tap ≥ 2, or on first tap after a gap
    if (currentCount >= 2) {
      triggerRipple(side, totalSeconds);
    }

    // Clear any existing commit timer
    if (state.timer) clearTimeout(state.timer);

    // After the window expires, commit the seek
    state.timer = setTimeout(() => {
      const finalCount = tapState.current[side].count;
      if (finalCount === 1) {
        // Single tap — toggle controls, no ripple
        setShowControls(!showControls);
      } else {
        // Multi-tap — seek
        const finalSeconds = finalCount * SECONDS_PER_TAP;
        triggerRipple(side, finalSeconds);
        commitSeek(side, finalSeconds);
      }
      tapState.current[side].count = 0;
      tapState.current[side].lastTs = 0;
      tapState.current[side].timer = null;
    }, MULTI_TAP_WINDOW);

    // Show ripple only when count >= 2
    if (currentCount >= 2) {
      triggerRipple(side, totalSeconds);
    }
  }, [showControls, setShowControls, triggerRipple, commitSeek]);

  const tapGesture = useMemo(() =>
    Gesture.Tap()
      .maxDuration(250)
      .onStart((e) => {
        "worklet";
        const isRightSide = e.absoluteX > screenWidth.value / 2;
        runOnJS(handleTap)(isRightSide);
      }),
  [handleTap, screenWidth]);

  // --- Pan Gesture ---
  const BRIGHTNESS_ZONE = 0.5;
  const CONTROL_NONE = 0, CONTROL_BRIGHTNESS = 1, CONTROL_VOLUME = 2;
  const activeControl = useSharedValue(CONTROL_NONE);

  const panGesture = useMemo(() =>
    Gesture.Pan()
      .minDistance(20)
      .onStart((e) => {
        "worklet";
        const relX = e.absoluteX / screenWidth.value;
        if (relX > BRIGHTNESS_ZONE) {
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
        const delta = -e.translationY / 300;
        if (activeControl.value === CONTROL_VOLUME) {
          const v = Math.min(Math.max(gestureStartVolume.value + delta, 0), 1);
          if (Math.abs(v - volumeValue.value) > 0.005) {
            volumeValue.value = v;
            runOnJS(VolumeManager.setVolume)(v);
          }
          volumeAnim.value = 1;
        } else if (activeControl.value === CONTROL_BRIGHTNESS) {
          const b = Math.min(Math.max(gestureStartBrightness.value + delta, 0), 1);
          if (Math.abs(b - brightnessValue.value) > 0.005) {
            brightnessValue.value = b;
            runOnJS(Brightness.setBrightnessAsync)(b);
          }
          brightnessAnim.value = 1;
        }
      })
      .onEnd(() => {
        "worklet";
        if (activeControl.value === CONTROL_VOLUME) hideVolume();
        else if (activeControl.value === CONTROL_BRIGHTNESS) hideBrightness();
        activeControl.value = CONTROL_NONE;
      }),
  [screenWidth, activeControl, gestureStartVolume, volumeValue, gestureStartBrightness, brightnessValue, volumeAnim, brightnessAnim]);

  const composedGesture = useMemo(() =>
    Gesture.Simultaneous(
      tapGesture,
      panGesture,
      Gesture.LongPress()
        .minDuration(400)
        .onStart(() => { "worklet"; if (onLongPressStart) runOnJS(onLongPressStart)(); })
        .onEnd(() => { "worklet"; if (onLongPressEnd) runOnJS(onLongPressEnd)(); }),
      Gesture.Pinch()
        .onEnd(() => { "worklet"; if (onPinch) runOnJS(onPinch)(); }),
    ),
  [tapGesture, panGesture, onLongPressStart, onLongPressEnd, onPinch]);

  return {
    composedGesture,
    tapGesture,
    volumeValue,
    brightnessValue,
    volumeAnim,
    brightnessAnim,
    leftDoubleTapAnim,
    rightDoubleTapAnim,
    leftSeekSeconds,
    rightSeekSeconds,
  };
};
