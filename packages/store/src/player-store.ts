import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerStoreType {
  volume: number;
  isMuted: boolean;
  fullScreen: boolean;
  src: string;
  poster?: string;
  title?: string;
  preferredRate: number;
  preferredAspectRatio: '16:9' | '4:3' | '1:1';
  setVolume: (volume: number) => void;
  setMutated: (isMuted: boolean) => void;
  toggleFullScreen: (fullScreen: boolean) => void;
  setSrc: (src: string) => void;
  setPoster: (poster?: string) => void;
  setTitle: (title?: string) => void;
  setPreferredRate: (rate: number) => void;
  setPreferredAspectRatio: (ratio: '16:9' | '4:3' | '1:1') => void;
  clearPlayer: () => void;
}

export const usePlayerStore = create<PlayerStoreType>()(
  persist(
    (set) => ({
      volume: 0.5,
      isMuted: false,
      fullScreen: false,
      src: '',
      poster: undefined,
      title: undefined,
      preferredRate: 1,
      preferredAspectRatio: '16:9',
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
      setPreferredRate: (rate) =>
        set({
          preferredRate: Math.max(0.25, Math.min(3, rate)),
        }),
      setPreferredAspectRatio: (ratio) =>
        set({
          preferredAspectRatio: ratio,
        }),
      clearPlayer: () => set({ src: '', poster: '', title: '' }),
    }),
    {
      name: 'player-storage',
    },
  ),
);
