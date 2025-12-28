import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Playlist {
  id: number;
  baseUrl: string;
  username: string;
  password: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  expDate: string;
  status: string;
  isTrial: string;
}

interface PlaylistState {
  isCreatingPlaylist: boolean;
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;

  startPlaylistCreation: () => void;
  finishPlaylistCreation: () => void;
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (id: number) => void;
  selectPlaylist: (playlist: Playlist | null) => void;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set) => ({
      isCreatingPlaylist: false,
      playlists: [],
      selectedPlaylist: null,

      startPlaylistCreation: () => set({ isCreatingPlaylist: true }),

      finishPlaylistCreation: () => set({ isCreatingPlaylist: false }),

      addPlaylist: (playlist) =>
        set((state) => ({
          playlists: [...state.playlists, playlist],
        })),
      selectPlaylist: (playlist) =>
        set({
          selectedPlaylist: playlist,
        }),
      removePlaylist: (id) =>
        set((state) => ({
          // Ensure both are compared as numbers (or strings)
          playlists: state.playlists.filter(
            (playlist) => Number(playlist.id) !== Number(id)
          ),
        })),
    }),

    {
      name: "playlist-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
