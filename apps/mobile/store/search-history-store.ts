import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface RecentSearch {
  query: string;
  timestamp: number;
}

interface SearchHistoryStore {
  searches: RecentSearch[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearSearches: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryStore>()(
  persist(
    (set, get) => ({
      searches: [],

      addSearch: (query) => {
        if (!query.trim()) return;
        const trimmed = query.trim();
        const existing = get().searches.findIndex(
          (s) => s.query.toLowerCase() === trimmed.toLowerCase(),
        );

        if (existing !== -1) {
          set({
            searches: [
              { query: trimmed, timestamp: Date.now() },
              ...get().searches.filter((_, i) => i !== existing),
            ],
          });
        } else {
          set({
            searches: [
              { query: trimmed, timestamp: Date.now() },
              ...get().searches.slice(0, 9),
            ],
          });
        }
      },

      removeSearch: (query) => {
        set({
          searches: get().searches.filter(
            (s) => s.query.toLowerCase() !== query.toLowerCase(),
          ),
        });
      },

      clearSearches: () => set({ searches: [] }),
    }),
    {
      name: "search-history-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
