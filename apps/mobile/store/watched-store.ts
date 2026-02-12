import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface WatchedMoviesItem {
  id: number;
  categoryId: number;
  position: number;
  duration: number;
  poster?: string;
  title?: string;
  src?: string;
  updatedAt: number;
  playlistId: number;
}

interface WatchedMoviesStore {
  movies: WatchedMoviesItem[];
  saveProgress: (item: Omit<WatchedMoviesItem, 'updatedAt'>) => void;
  getProgress: (id: number, playlistId: number) => WatchedMoviesItem | undefined;
  clearHistory: () => void;
  removeItem: (id: number, playlistId: number) => void;
}

export const useWatchedMoviesStore = create<WatchedMoviesStore>()(
  persist(
    (set, get) => ({
      movies: [],

      saveProgress: (item) => {
        const existing = get().movies.find((i) => i.id === item.id);

        if (existing) {
          set({
            movies: get().movies.map((i) =>
              i.id === item.id ? { ...i, ...item, updatedAt: Date.now() } : i,
            ),
          });
        } else {
          set({
            movies: [
              ...get().movies,
              {
                ...item,
                updatedAt: Date.now(),
              },
            ],
          });
        }
      },

      getProgress: (id, playlistId) =>
        get().movies.find((i) => i.id === id && i.playlistId === playlistId),
      removeItem: (id, playlistId) => {
        set({
          movies: get().movies.filter((item) => item.id !== id || item.playlistId !== playlistId),
        });
      },

      clearHistory: () => set({ movies: [] }),
    }),
    {
      name: 'watchedMovies-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export interface EpisodeProgress {
  episodeNumber: number;
  seasonId: number;
  position: number;
  duration: number;
  src: string;
}

export interface WatchedSeriesItem {
  id: number;
  categoryId: number;
  playlistId: number;
  poster?: string;
  title?: string;
  totalEpisodes: number;
  episodes: EpisodeProgress[];
}

interface WatchedSeriesStore {
  series: WatchedSeriesItem[];
  saveProgress: (
    seriesInfo: Omit<WatchedSeriesItem, 'episodes'>,
    episodeDetails: EpisodeProgress,
  ) => void;
  getProgress: (seriesId: number, playlistId: number) => number;
  getEpisodeProgress: (
    seriesId: number,
    episodeNumber: number,
    seasonId: number,
  ) => EpisodeProgress | undefined;
  getWatchedSeriesItem: (seriesId: number) => WatchedSeriesItem | undefined;
  clearHistory: () => void;
  removeItem: (seriesId: number) => void;
}

export const useWatchedSeriesStore = create<WatchedSeriesStore>()(
  persist(
    (set, get) => ({
      series: [],

      saveProgress: (seriesInfo, episodeDetails) => {
        const { id: seriesId } = seriesInfo;

        set((state) => {
          const seriesIndex = state.series.findIndex((s) => s.id === seriesId);

          if (seriesIndex !== -1) {
            const existingSeries = state.series[seriesIndex];
            const episodeIndex = existingSeries.episodes.findIndex(
              (e) =>
                e.episodeNumber === episodeDetails.episodeNumber &&
                e.seasonId === episodeDetails.seasonId,
            );

            let updatedEpisodes: EpisodeProgress[];

            if (episodeIndex !== -1) {
              updatedEpisodes = existingSeries.episodes.map((e, idx) =>
                idx === episodeIndex ? episodeDetails : e,
              );
            } else {
              updatedEpisodes = [...existingSeries.episodes, episodeDetails];
            }

            const updatedSeries: WatchedSeriesItem = {
              ...existingSeries,
              ...seriesInfo,
              episodes: updatedEpisodes,
            };

            return {
              series: state.series.map((s, idx) => (idx === seriesIndex ? updatedSeries : s)),
            };
          } else {
            const newSeries: WatchedSeriesItem = {
              ...seriesInfo,
              episodes: [episodeDetails],
            };

            return {
              series: [...state.series, newSeries],
            };
          }
        });
      },

      getProgress: (seriesId, playlistId) => {
        const seriesItem = get().series.find(
          (s) => s.id === seriesId && s.playlistId === playlistId,
        );

        if (!seriesItem || seriesItem.totalEpisodes === 0) return 0;

        return Math.min(seriesItem.episodes.length / seriesItem.totalEpisodes, 1);
      },

      getEpisodeProgress: (seriesId, episodeNumber, seasonId) => {
        const seriesItem = get().series.find((s) => s.id === seriesId);

        return seriesItem?.episodes.find(
          (e) => e.episodeNumber === episodeNumber && e.seasonId === seasonId,
        );
      },

      getWatchedSeriesItem: (seriesId) => {
        return get().series.find((s) => s.id === seriesId);
      },

      clearHistory: () => {
        set({ series: [] });
      },

      removeItem: (seriesId) => {
        set((state) => ({
          series: state.series.filter((item) => item.id !== seriesId),
        }));
      },
    }),
    {
      name: 'watchedSeries-storage', // renamed for safety
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
