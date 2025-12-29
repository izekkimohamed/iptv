import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types for the returned data
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
  playlistId: number; // Added to track which playlist this belongs to
}

interface RecentUpdateStore {
  // Map of playlistId -> Update Data
  updatesByPlaylist: Record<number, PlaylistUpdateData>;

  // Actions
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
          // Clear specific playlist history
          set((state) => {
            const newUpdates = { ...state.updatesByPlaylist };
            delete newUpdates[playlistId];
            return { updatesByPlaylist: newUpdates };
          });
        } else {
          // Clear everything
          set({ updatesByPlaylist: {} });
        }
      },
    }),
    {
      name: 'recent-updates-storage',
      version: 1,
    },
  ),
);
