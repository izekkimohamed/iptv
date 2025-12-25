// @/theme/playerTheme.ts
import { useMemo } from "react";
import { useColorScheme } from "react-native";

export type PlayerThemeMode = "cinema" | "amoled" | "daylight";

const THEMES = {
  cinema: {
    bg: "#0D0D0C", // Warm obsidian
    glassStrong: "rgba(13, 13, 12, 0.95)",
    glassMedium: "rgba(20, 20, 19, 0.2)",
    glassLight: "rgba(255, 255, 255, 0.05)",
    primary: "#fdc700", // Your Gold
    primaryDark: "#C69C00",
    accentSuccess: "#4ADE80", // Soft Emerald for Live indicators
    textPrimary: "#F9F9F9",
    textSecondary: "rgba(249, 249, 249, 0.75)",
    textMuted: "rgba(249, 249, 249, 0.45)",
    border: "rgba(253, 199, 0, 0.15)", // Subtle gold glow
    borderStrong: "rgba(253, 199, 0, 0.4)",
    trackBg: "rgba(255, 255, 255, 0.1)",
  },

  amoled: {
    bg: "#1A1C22", // Slate Graphite
    glassStrong: "rgba(26, 28, 34, 0.96)",
    glassMedium: "rgba(35, 38, 46, 0.85)",
    glassLight: "rgba(255, 255, 255, 0.08)",
    primary: "#fdc700",
    primaryDark: "#EAB308",
    accentSuccess: "#2DD4BF", // Teal accent
    textPrimary: "#ECEFF4",
    textSecondary: "#ABB2BF",
    textMuted: "#636D83",
    border: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(253, 199, 0, 0.5)",
    trackBg: "rgba(255, 255, 255, 0.15)",
  },

  daylight: {
    bg: "#12100E", // Coffee black
    glassStrong: "rgba(18, 16, 14, 0.94)",
    glassMedium: "rgba(28, 25, 23, 0.8)",
    glassLight: "rgba(253, 199, 0, 0.03)",
    primary: "#fdc700",
    primaryDark: "#B48E00",
    accentSuccess: "#A3E635",
    textPrimary: "#FFFCF2", // Off-white/Cream text
    textSecondary: "rgba(255, 252, 242, 0.7)",
    textMuted: "rgba(255, 252, 242, 0.4)",
    border: "rgba(253, 199, 0, 0.2)",
    borderStrong: "rgba(253, 199, 0, 0.6)",
    trackBg: "rgba(255, 255, 255, 0.08)",
  },
};

export const usePlayerTheme = (mode?: PlayerThemeMode) => {
  const systemScheme = useColorScheme();

  return useMemo(() => {
    if (mode) return THEMES[mode];
    return systemScheme === "light" ? THEMES.daylight : THEMES.cinema;
  }, [mode, systemScheme]);
};
