// @/theme/playerTheme.ts
import { useMemo } from "react";

export type PlayerThemeMode = "cinema" | "amoled" | "daylight";

const THEMES = {
  // Core Backgrounds
  bg: "#0A0A0F", // Deep Space Blue-Black
  surfacePrimary: "rgba(18, 18, 28, 0.95)", // Elevated surface
  surfaceSecondary: "rgba(25, 25, 38, 0.90)",

  // Glass Effects
  glassStrong: "rgba(15, 15, 25, 0.98)",
  glassMedium: "rgba(30, 30, 45, 0.85)",
  glassLight: "rgba(255, 255, 255, 0.06)",
  glassHighlight: "rgba(255, 255, 255, 0.12)",

  // Primary Colors - Vibrant Blue-Purple Gradient
  primary: "#6366F1", // Indigo
  primaryLight: "#818CF8", // Light Indigo
  primaryDark: "#4F46E5", // Deep Indigo
  primaryGlow: "rgba(99, 102, 241, 0.4)",

  // Accent Colors
  accentSuccess: "#10B981", // Emerald
  accentWarning: "#F59E0B", // Amber
  accentError: "#EF4444", // Red
  accentInfo: "#3B82F6", // Blue

  // Text Hierarchy
  textPrimary: "#F9FAFB", // Near White
  textSecondary: "#D1D5DB", // Light Gray
  textMuted: "#9CA3AF", // Medium Gray
  textDisabled: "#6B7280", // Dark Gray

  // Borders & Dividers
  border: "rgba(99, 102, 241, 0.15)",
  borderStrong: "rgba(99, 102, 241, 0.35)",
  borderMuted: "rgba(255, 255, 255, 0.08)",
  divider: "rgba(255, 255, 255, 0.1)",

  // Track & Progress
  trackBg: "rgba(255, 255, 255, 0.15)",
  trackFg: "#6366F1",
  trackBuffered: "rgba(255, 255, 255, 0.25)",

  // Shadows & Glows
  shadowLight: "rgba(0, 0, 0, 0.1)",
  shadowMedium: "rgba(0, 0, 0, 0.25)",
  shadowStrong: "rgba(0, 0, 0, 0.5)",
  glow: "rgba(99, 102, 241, 0.6)",
};

export const usePlayerTheme = () => {
  return useMemo(() => {
    return THEMES;
  }, []);
};
