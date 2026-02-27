// @/theme/playerTheme.ts
import { useColorScheme } from "react-native";
import { useMemo } from "react";
import { useThemeStore } from "@/store/theme-store";

export type PlayerThemeMode = "dark" | "light";

const DARK_THEME = {
  bg: "#141418",
  surfacePrimary: "#1E1E24",
  surfaceSecondary: "#2A2A35",
  surfaceTertiary: "#353542",

  glassStrong: "#1E1E24",
  glassMedium: "rgba(30, 30, 36, 0.8)",
  glassLight: "rgba(255, 255, 255, 0.05)",
  glassHighlight: "rgba(255, 255, 255, 0.14)",

  primary: "#D97706",
  primaryForeground: "#1E1E24",
  primaryLight: "#F59E0B",
  primaryDark: "#B45309",
  primaryGlow: "rgba(217, 119, 6, 0.5)",

  accentSuccess: "#10B981",
  accentWarning: "#FBBF24",
  accentError: "#EF4444",
  accentInfo: "#0EA5E9",

  textPrimary: "#F3F4F6",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  textDisabled: "#4B5563",

  border: "rgba(255, 255, 255, 0.1)",
  borderStrong: "rgba(255, 255, 255, 0.15)",
  borderMuted: "rgba(255, 255, 255, 0.05)",
  divider: "rgba(255, 255, 255, 0.08)",

  trackBg: "rgba(255, 255, 255, 0.12)",
  trackFg: "#D97706",
  trackBuffered: "rgba(255, 255, 255, 0.2)",

  shadowLight: "rgba(0, 0, 0, 0.2)",
  shadowMedium: "rgba(0, 0, 0, 0.4)",
  shadowStrong: "rgba(0, 0, 0, 0.7)",

  sidebar: "rgba(15, 15, 20, 0.6)",
  sidebarForeground: "#E5E7EB",
  sidebarPrimary: "#D97706",
  sidebarPrimaryForeground: "#1E1E24",
  sidebarAccent: "rgba(255, 255, 255, 0.05)",
  sidebarAccentForeground: "#F3F4F6",
  sidebarBorder: "rgba(255, 255, 255, 0.08)",
  sidebarRing: "rgba(217, 119, 6, 0.3)",
};

const LIGHT_THEME = {
  bg: "#FAFAFA",
  surfacePrimary: "#FFFFFF",
  surfaceSecondary: "#F3F4F6",
  surfaceTertiary: "#E5E7EB",

  glassStrong: "#FFFFFF",
  glassMedium: "rgba(243, 244, 246, 0.8)",
  glassLight: "rgba(0, 0, 0, 0.05)",
  glassHighlight: "rgba(0, 0, 0, 0.1)",

  primary: "#D97706",
  primaryForeground: "#FFFFFF",
  primaryLight: "#F59E0B",
  primaryDark: "#B45309",
  primaryGlow: "rgba(217, 119, 6, 0.4)",

  accentSuccess: "#059669",
  accentWarning: "#D97706",
  accentError: "#DC2626",
  accentInfo: "#0284C7",

  textPrimary: "#111827",
  textSecondary: "#4B5563",
  textMuted: "#6B7280",
  textDisabled: "#9CA3AF",

  border: "rgba(0, 0, 0, 0.12)",
  borderStrong: "rgba(0, 0, 0, 0.2)",
  borderMuted: "rgba(0, 0, 0, 0.06)",
  divider: "rgba(0, 0, 0, 0.08)",

  trackBg: "rgba(0, 0, 0, 0.1)",
  trackFg: "#D97706",
  trackBuffered: "rgba(0, 0, 0, 0.15)",

  shadowLight: "rgba(0, 0, 0, 0.1)",
  shadowMedium: "rgba(0, 0, 0, 0.15)",
  shadowStrong: "rgba(0, 0, 0, 0.25)",

  sidebar: "rgba(250, 250, 250, 0.6)",
  sidebarForeground: "#1F2937",
  sidebarPrimary: "#D97706",
  sidebarPrimaryForeground: "#FFFFFF",
  sidebarAccent: "rgba(0, 0, 0, 0.05)",
  sidebarAccentForeground: "#111827",
  sidebarBorder: "rgba(0, 0, 0, 0.1)",
  sidebarRing: "rgba(217, 119, 6, 0.3)",
};

export const usePlayerTheme = (): typeof DARK_THEME => {
  const systemColorScheme = useColorScheme();
  const { themeMode } = useThemeStore();

  const mode: PlayerThemeMode = useMemo(() => {
    if (themeMode === "system") {
      return systemColorScheme === "light" ? "light" : "dark";
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  return useMemo(() => {
    return mode === "dark" ? DARK_THEME : LIGHT_THEME;
  }, [mode]);
};

export const theme = DARK_THEME;
