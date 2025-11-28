import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerStoreType {
  volume: number;
  isMuted: boolean;
  fullScreen: boolean;
  setVolume: (volume: number) => void;
  setMutated: (isMuted: boolean) => void;
  toggleFullScreen: (fullScreen: boolean) => void;
}

export const usePlayerStore = create<PlayerStoreType>()(
  persist(
    (set) => ({
      volume: 0.5,
      isMuted: false,
      fullScreen: false,
      setVolume: (volume) =>
        set({
          volume: Math.max(0, Math.min(1, volume)),
        }),
      setMutated: (isMuted) =>
        set({
          isMuted,
        }),
      toggleFullScreen: (fullScreen) =>
        set({
          fullScreen,
        }),
    }),
    {
      name: "player-storage",
    }
  )
);
