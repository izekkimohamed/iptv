// @/theme/playerTheme.ts
import { useMemo } from "react";

export type PlayerThemeMode = "cinema" | "amoled" | "daylight";

const THEMES = {
  // Core Backgrounds
  bg: "#050505", // True Black / Deepest Slate for AMOLED
  surfacePrimary: "rgba(15, 15, 20, 0.98)", // Solider, darker surface
  surfaceSecondary: "rgba(22, 22, 30, 0.95)",

  // Glass Effects
  glassStrong: "rgba(10, 10, 15, 0.98)",
  glassMedium: "rgba(25, 25, 35, 0.8)",
  glassLight: "rgba(255, 255, 255, 0.08)",
  glassHighlight: "rgba(255, 255, 255, 0.14)",

  // Primary Colors - Vibrant Electric Violet / Indigo
  primary: "#8B5CF6", // Vibrant Violet
  primaryLight: "#A78BFA", // Soft Violet
  primaryDark: "#7C3AED", // Deep Violet
  primaryGlow: "rgba(139, 92, 246, 0.5)",

  // Accent Colors - More saturated and punchy
  accentSuccess: "#10B981", // Emerald
  accentWarning: "#FBBF24", // Amber (brighter)
  accentError: "#FF4D4D", // Red (punchier)
  accentInfo: "#0EA5E9", // Sky Blue

  // Text Hierarchy - Higher contrast
  textPrimary: "#FFFFFF", // Pure White
  textSecondary: "#E5E7EB", // Platinum
  textMuted: "#9CA3AF", // Cool Gray
  textDisabled: "#4B5563", // Muted Gray

  // Borders & Dividers - Subtle but defined
  border: "rgba(139, 92, 246, 0.25)",
  borderStrong: "rgba(139, 92, 246, 0.45)",
  borderMuted: "rgba(255, 255, 255, 0.1)",
  divider: "rgba(255, 255, 255, 0.08)",

  // Track & Progress
  trackBg: "rgba(255, 255, 255, 0.12)",
  trackFg: "#8B5CF6",
  trackBuffered: "rgba(255, 255, 255, 0.2)",

  // Shadows & Glows
  shadowLight: "rgba(0, 0, 0, 0.2)",
  shadowMedium: "rgba(0, 0, 0, 0.4)",
  shadowStrong: "rgba(0, 0, 0, 0.7)",
  glow: "rgba(139, 92, 246, 0.7)",
};

export const usePlayerTheme = () => {
  return useMemo(() => {
    return THEMES;
  }, []);
};
