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
  firstLaunch: boolean;
  isCreatingPlaylist: boolean;
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;

  setFirstLaunch: (value: boolean) => void;
  startPlaylistCreation: () => void;
  finishPlaylistCreation: () => void;
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (id: number) => void;
  selectPlaylist: (playlist: Playlist | null) => void;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set) => ({
      firstLaunch: true,
      isCreatingPlaylist: false,
      playlists: [],
      selectedPlaylist: null,

      setFirstLaunch: (value) => set({ firstLaunch: value }),

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
