import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FavoritesState {
  teamIds: number[];
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

export const useFavoritesTeamsStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      teamIds: [],
      addFavorite: (id) =>
        set((state) => ({
          teamIds: state.teamIds.includes(id) ? state.teamIds : [...state.teamIds, id],
        })),
      removeFavorite: (id) =>
        set((state) => ({
          teamIds: state.teamIds.filter((favId) => favId !== id),
        })),
      isFavorite: (id) => get().teamIds.includes(id),
    }),
    {
      name: 'favorite-teams-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
