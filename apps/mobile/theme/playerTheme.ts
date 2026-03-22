// @/theme/playerTheme.ts
import { useColorScheme } from "react-native";
import { useMemo } from "react";
import { useThemeStore, type AccentColor } from "@/store/theme-store";

export type PlayerThemeMode = "dark" | "light";

const ACCENTS: Record<AccentColor, { primary: string; primaryForeground: string; primaryLight: string; primaryDark: string; primaryGlow: string; trackFg: string; sidebarPrimary: string; sidebarPrimaryForeground: string; sidebarRing: string }> = {
  orange: {
    primary: "#D97706", primaryForeground: "#1E1E24",
    primaryLight: "#F59E0B", primaryDark: "#B45309",
    primaryGlow: "rgba(217,119,6,0.5)", trackFg: "#D97706",
    sidebarPrimary: "#D97706", sidebarPrimaryForeground: "#1E1E24", sidebarRing: "rgba(217,119,6,0.3)",
  },
  blue: {
    primary: "#3B82F6", primaryForeground: "#FFFFFF",
    primaryLight: "#60A5FA", primaryDark: "#2563EB",
    primaryGlow: "rgba(59,130,246,0.5)", trackFg: "#3B82F6",
    sidebarPrimary: "#3B82F6", sidebarPrimaryForeground: "#FFFFFF", sidebarRing: "rgba(59,130,246,0.3)",
  },
  purple: {
    primary: "#8B5CF6", primaryForeground: "#FFFFFF",
    primaryLight: "#A78BFA", primaryDark: "#7C3AED",
    primaryGlow: "rgba(139,92,246,0.5)", trackFg: "#8B5CF6",
    sidebarPrimary: "#8B5CF6", sidebarPrimaryForeground: "#FFFFFF", sidebarRing: "rgba(139,92,246,0.3)",
  },
  green: {
    primary: "#10B981", primaryForeground: "#FFFFFF",
    primaryLight: "#34D399", primaryDark: "#059669",
    primaryGlow: "rgba(16,185,129,0.5)", trackFg: "#10B981",
    sidebarPrimary: "#10B981", sidebarPrimaryForeground: "#FFFFFF", sidebarRing: "rgba(16,185,129,0.3)",
  },
  red: {
    primary: "#EF4444", primaryForeground: "#FFFFFF",
    primaryLight: "#F87171", primaryDark: "#DC2626",
    primaryGlow: "rgba(239,68,68,0.5)", trackFg: "#EF4444",
    sidebarPrimary: "#EF4444", sidebarPrimaryForeground: "#FFFFFF", sidebarRing: "rgba(239,68,68,0.3)",
  },
  pink: {
    primary: "#EC4899", primaryForeground: "#FFFFFF",
    primaryLight: "#F472B6", primaryDark: "#DB2777",
    primaryGlow: "rgba(236,72,153,0.5)", trackFg: "#EC4899",
    sidebarPrimary: "#EC4899", sidebarPrimaryForeground: "#FFFFFF", sidebarRing: "rgba(236,72,153,0.3)",
  },
};

const BASE_DARK = {
  bg: "#141418",
  surfacePrimary: "#1E1E24",
  surfaceSecondary: "#2A2A35",
  surfaceTertiary: "#353542",
  glassStrong: "#1E1E24",
  glassMedium: "rgba(30, 30, 36, 0.8)",
  glassLight: "rgba(255, 255, 255, 0.05)",
  glassHighlight: "rgba(255, 255, 255, 0.14)",
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
  trackBuffered: "rgba(255, 255, 255, 0.2)",
  shadowLight: "rgba(0, 0, 0, 0.2)",
  shadowMedium: "rgba(0, 0, 0, 0.4)",
  shadowStrong: "rgba(0, 0, 0, 0.7)",
  sidebar: "rgba(15, 15, 20, 0.6)",
  sidebarForeground: "#E5E7EB",
  sidebarAccent: "rgba(255, 255, 255, 0.05)",
  sidebarAccentForeground: "#F3F4F6",
  sidebarBorder: "rgba(255, 255, 255, 0.08)",
};

const BASE_LIGHT = {
  bg: "#FAFAFA",
  surfacePrimary: "#FFFFFF",
  surfaceSecondary: "#F3F4F6",
  surfaceTertiary: "#E5E7EB",
  glassStrong: "#FFFFFF",
  glassMedium: "rgba(243, 244, 246, 0.8)",
  glassLight: "rgba(0, 0, 0, 0.05)",
  glassHighlight: "rgba(0, 0, 0, 0.1)",
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
  trackBuffered: "rgba(0, 0, 0, 0.15)",
  shadowLight: "rgba(0, 0, 0, 0.1)",
  shadowMedium: "rgba(0, 0, 0, 0.15)",
  shadowStrong: "rgba(0, 0, 0, 0.25)",
  sidebar: "rgba(250, 250, 250, 0.6)",
  sidebarForeground: "#1F2937",
  sidebarAccent: "rgba(0, 0, 0, 0.05)",
  sidebarAccentForeground: "#111827",
  sidebarBorder: "rgba(0, 0, 0, 0.1)",
};

type FullTheme = typeof BASE_DARK & typeof ACCENTS.orange;

export const usePlayerTheme = (): FullTheme => {
  const systemColorScheme = useColorScheme();
  const { themeMode, accentColor } = useThemeStore();

  const mode: PlayerThemeMode = useMemo(() => {
    if (themeMode === "system") {
      return systemColorScheme === "light" ? "light" : "dark";
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  return useMemo(() => {
    const base = mode === "dark" ? BASE_DARK : BASE_LIGHT;
    const accent = ACCENTS[accentColor ?? "orange"];
    return { ...base, ...accent } as FullTheme;
  }, [mode, accentColor]);
};

export const theme = { ...BASE_DARK, ...ACCENTS.orange };
