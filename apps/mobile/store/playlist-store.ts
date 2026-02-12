import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Playlist {
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
  updatePlaylist: (id: number, updates: Partial<Playlist>) => void;
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

      updatePlaylist: (id, updates) =>
        set((state) => {
          const updatedPlaylists = state.playlists.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          );
          const updatedSelected =
            state.selectedPlaylist?.id === id ?
              { ...state.selectedPlaylist, ...updates }
            : state.selectedPlaylist;

          return {
            playlists: updatedPlaylists,
            selectedPlaylist: updatedSelected,
          };
        }),

      selectPlaylist: (playlist) =>
        set({
          selectedPlaylist: playlist,
        }),

      removePlaylist: (id) =>
        set((state) => ({
          playlists: state.playlists.filter((playlist) => Number(playlist.id) !== Number(id)),
          selectedPlaylist:
            state.selectedPlaylist?.id === id ? null : state.selectedPlaylist,
        })),
    }),
    {
      name: "playlist-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
