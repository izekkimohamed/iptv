import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ThemeMode = "dark" | "light" | "system";
export type AccentColor = "orange" | "blue" | "purple" | "green" | "red" | "pink";

interface ThemeStore {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeMode: "dark",
      accentColor: "orange",

      setThemeMode: (mode) => set({ themeMode: mode }),
      setAccentColor: (color) => set({ accentColor: color }),
    }),
    {
      name: "theme-mode-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
