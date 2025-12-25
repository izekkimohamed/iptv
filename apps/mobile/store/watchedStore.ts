import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WatchedMoviesItem {
  id: number;
  categoryId: number;
  position: number; // last currentTime
  duration: number; // video duration
  poster?: string;
  title?: string;
  src?: string;
  updatedAt: number; // timestamp, useful for sorting
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
          // Update existing item
          set({
            movies: get().movies.map((i) =>
              i.id === item.id ? { ...i, ...item, updatedAt: Date.now() } : i,
            ),
          });
        } else {
          // Add new item
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

  // Save or update episode progress for a series
  saveProgress: (
    seriesInfo: Omit<WatchedSeriesItem, 'episodes'>,
    episodeDetails: EpisodeProgress,
  ) => void;

  // Get overall series progress (0-1)
  getProgress: (seriesId: number, playlistId: number) => number;

  // Get specific episode progress
  getEpisodeProgress: (
    seriesId: number,
    episodeNumber: number,
    seasonId: number,
  ) => EpisodeProgress | undefined;

  // Get full series item
  getWatchedSeriesItem: (seriesId: number) => WatchedSeriesItem | undefined;

  // Clear all history
  clearHistory: () => void;

  // Remove a series
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
            // Series exists - update it
            const existingSeries = state.series[seriesIndex];
            const episodeIndex = existingSeries.episodes.findIndex(
              (e) =>
                e.episodeNumber === episodeDetails.episodeNumber &&
                e.seasonId === episodeDetails.seasonId,
            );

            let updatedEpisodes: EpisodeProgress[];

            if (episodeIndex !== -1) {
              // Episode exists - update progress
              updatedEpisodes = existingSeries.episodes.map((e, idx) =>
                idx === episodeIndex ? episodeDetails : e,
              );
            } else {
              // Episode is new - add it
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
            // Series doesn't exist - create new one
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
      name: 'watchedSeries-store',
    },
  ),
);
