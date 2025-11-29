import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerStoreType {
  volume: number;
  isMuted: boolean;
  fullScreen: boolean;
  src: string;
  poster?: string;
  title?: string;
  setVolume: (volume: number) => void;
  setMutated: (isMuted: boolean) => void;
  toggleFullScreen: (fullScreen: boolean) => void;
  setSrc: (src: string) => void;
  setPoster: (poster?: string) => void;
  setTitle: (title?: string) => void;
  clearPlayer: () => void;
}

export const usePlayerStore = create<PlayerStoreType>()(
  persist(
    (set) => ({
      volume: 0.5,
      isMuted: false,
      fullScreen: false,
      src: "",
      poster: undefined,
      title: undefined,
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
      setSrc: (src) =>
        set({
          src,
        }),
      setPoster: (poster) =>
        set({
          poster,
        }),
      setTitle: (title) =>
        set({
          title,
        }),
      clearPlayer: () => set({ src: "", poster: "", title: "" }),
    }),
    {
      name: "player-storage",
    }
  )
);
