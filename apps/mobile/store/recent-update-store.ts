import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NewItem {
  channels: Array<{
    name: string;
    streamType: string;
    streamIcon: string;
    isFavorite: boolean;
    categoryId: number;
    playlistId: number;
    streamId: number;
    url: string;
  }>;
  movies: Array<{
    name: string;
    streamType: string;
    streamIcon: string;
    streamId: number;
    rating: string;
    added: string;
    categoryId: number;
    playlistId: number;
    containerExtension: string;
    url: string;
  }>;
  series: Array<{
    seriesId: number;
    name: string;
    cover: string;
    plot: string | null;
    rating: string;
    lastModified: string;
    cast: string | null;
    genere: string | null;
    director: string | null;
    releaseDate: string | null;
    backdropPath: string;
    youtubeTrailer: string | null;
    episodeRunTime: string;
    categoryId: number;
    playlistId: number;
  }>;
}

interface DeletedItem {
  channels: Array<{
    name: string;
    streamType: string;
    streamIcon: string;
    isFavorite: boolean;
    categoryId: number;
    playlistId: number;
    streamId: number;
    url: string;
  }>;
  movies: Array<{ streamId: number }>;
  series: Array<{ seriesId: number }>;
}

interface Category {
  channelsCat: Array<{
    playlistId: number;
    type: string;
    categoryName: string;
    categoryId: number;
  }>;
  moviesCat: Array<{
    playlistId: number;
    type: string;
    categoryName: string;
    categoryId: number;
  }>;
  seriesCat: Array<{
    playlistId: number;
    type: string;
    categoryName: string;
    categoryId: number;
  }>;
}

interface PlaylistUpdateData {
  success: boolean;
  newItems: NewItem;
  deletedItems: DeletedItem;
  categories: Category;
  timestamp: number;
  playlistId: number;
}

interface RecentUpdateStore {
  updatesByPlaylist: Record<number, PlaylistUpdateData>;
  addUpdate: (playlistId: number, data: Omit<PlaylistUpdateData, 'playlistId'>) => void;
  getLatestUpdate: (playlistId: number | undefined) => PlaylistUpdateData | null;
  clearHistory: (playlistId?: number) => void;
}

export const useRecentUpdateStore = create<RecentUpdateStore>()(
  persist(
    (set, get) => ({
      updatesByPlaylist: {},

      addUpdate: (playlistId, data) => {
        set((state) => ({
          updatesByPlaylist: {
            ...state.updatesByPlaylist,
            [playlistId]: { ...data, playlistId, timestamp: Date.now() },
          },
        }));
      },

      getLatestUpdate: (playlistId) => {
        if (!playlistId) return null;
        return get().updatesByPlaylist[playlistId] || null;
      },

      clearHistory: (playlistId) => {
        if (playlistId) {
          set((state) => {
            const newUpdates = { ...state.updatesByPlaylist };
            delete newUpdates[playlistId];
            return { updatesByPlaylist: newUpdates };
          });
        } else {
          set({ updatesByPlaylist: {} });
        }
      },
    }),
    {
      name: 'recent-updates-storage',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
