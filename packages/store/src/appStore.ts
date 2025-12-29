import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
          playlists: state.playlists.filter((playlist) => playlist.id !== id),
        })),
    }),

    {
      name: 'playlist-storage', // unique key in storage
    },
  ),
);
