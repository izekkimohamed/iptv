import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ThemeMode = "dark" | "light" | "system";

interface ThemeStore {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeMode: "dark",

      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: "theme-mode-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
