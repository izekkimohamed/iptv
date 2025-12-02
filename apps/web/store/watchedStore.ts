import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WatchedMoviesItem {
  id: number;
  categoryId: number;
  position: number; // last currentTime
  duration: number; // video duration
  poster?: string;
  title?: string;
  src?: string;
  updatedAt: number; // timestamp, useful for sorting
}

interface WatchedMoviesStore {
  movies: WatchedMoviesItem[];

  saveProgress: (item: Omit<WatchedMoviesItem, "updatedAt">) => void;
  getProgress: (id: number) => WatchedMoviesItem | undefined;
  clearHistory: () => void;
  removeItem: (id: number) => void;
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
              i.id === item.id ? { ...i, ...item, updatedAt: Date.now() } : i
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

      getProgress: (id) => get().movies.find((i) => i.id === id),

      clearHistory: () => set({ movies: [] }),
      removeItem: (id) => {
        set({
          movies: get().movies.filter((item) => item.id !== id),
        });
      },
    }),

    {
      name: "watchedMovies-store",
    }
  )
);

export interface WatchedSeriesItem {
  id: number;
  categoryId: number;
  position: number; // last currentTime
  duration: number; // video duration
  poster?: string;
  title?: string;
  src?: string;
  episodeNumber: number;
  seasonId: number;
  updatedAt: number; // timestamp, useful for sorting
}

interface WatchedSeriesStore {
  series: WatchedSeriesItem[];

  saveProgress: (item: Omit<WatchedSeriesItem, "updatedAt">) => void;
  getProgress: (id: number) => WatchedSeriesItem | undefined;
  clearHistory: () => void;
  removeItem: (id: number) => void;
}

export const useWatchedSeriesStore = create<WatchedSeriesStore>()(
  persist(
    (set, get) => ({
      series: [],
      saveProgress: (item) => {
        const existing = get().series.find((i) => i.id === item.id);
        if (existing) {
          // Update existing item
          set({
            series: get().series.map((i) =>
              i.id === item.id ? { ...i, ...item, updatedAt: Date.now() } : i
            ),
          });
        } else {
          // Add new item
          set({
            series: [
              ...get().series,
              {
                ...item,
                updatedAt: Date.now(),
              },
            ],
          });
        }
      },

      getProgress: (id) => get().series.find((i) => i.id === id),
      clearHistory: () => set({ series: [] }),
      removeItem: (id) => {
        set({
          series: get().series.filter((item) => item.id !== id),
        });
      },
    }),
    {
      name: "watchedSeries-store",
    }
  )
);
