import { create } from 'zustand';
import { favoritesAPI } from '../api/favorites';
import type {
  Favorite,
  AddFavoriteRequest,
  FavoritesResponse,
  BatchCheckResponse,
  EntityType,
  FavoritesFilters
} from '../types/favorites';

interface FavoriteStore {
  // State
  favorites: Favorite[];
  favoritesCount: Record<EntityType | string, number>;
  favoriteStatus: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;

  // Actions
  addFavorite: (data: AddFavoriteRequest) => Promise<void>;
  removeFavorite: (entityType: EntityType, entityId: number) => Promise<void>;
  getFavorites: (entityType: EntityType, filters?: FavoritesFilters) => Promise<void>;
  checkFavoriteStatus: (entityType: EntityType, entityId: number) => Promise<boolean>;
  batchCheckFavorites: (entityType: EntityType, entityIds: number[]) => Promise<BatchCheckResponse>;
  getFavoritesCount: (entityType: EntityType) => Promise<void>;
  toggleFavorite: (entityType: EntityType, entityId: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  favorites: [],
  favoritesCount: {},
  favoriteStatus: {},
  isLoading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
};

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  ...initialState,

  addFavorite: async (data: AddFavoriteRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newFavorite = await favoritesAPI.addFavorite(data);
      set(state => ({
        favorites: [newFavorite, ...state.favorites],
        favoriteStatus: {
          ...state.favoriteStatus,
          [`${data.entityType}_${data.entityId}`]: true
        },
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add favorite',
        isLoading: false
      });
      throw error;
    }
  },

  removeFavorite: async (entityType: EntityType, entityId: number) => {
    set({ isLoading: true, error: null });
    try {
      await favoritesAPI.removeFavorite(entityType, entityId);
      set(state => ({
        favorites: state.favorites.filter(
          fav => !(fav.entityType === entityType && fav.entityId === entityId)
        ),
        favoriteStatus: {
          ...state.favoriteStatus,
          [`${entityType}_${entityId}`]: false
        },
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove favorite',
        isLoading: false
      });
      throw error;
    }
  },

  getFavorites: async (entityType: EntityType, filters?: FavoritesFilters) => {
    set({ isLoading: true, error: null });
    try {
      const response: FavoritesResponse = await favoritesAPI.getFavorites(entityType, filters);
      set({
        favorites: response.content,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
        pageSize: response.size,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch favorites',
        isLoading: false
      });
    }
  },

  checkFavoriteStatus: async (entityType: EntityType, entityId: number): Promise<boolean> => {
    try {
      const status = await favoritesAPI.checkFavoriteStatus(entityType, entityId);
      set(state => ({
        favoriteStatus: {
          ...state.favoriteStatus,
          [`${entityType}_${entityId}`]: status
        }
      }));
      return status;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  batchCheckFavorites: async (entityType: EntityType, entityIds: number[]): Promise<BatchCheckResponse> => {
    try {
      const response = await favoritesAPI.batchCheckFavorites(entityType, entityIds);
      const newFavoriteStatus = { ...get().favoriteStatus };
      
      Object.entries(response).forEach(([entityId, isFavorite]) => {
        newFavoriteStatus[`${entityType}_${entityId}`] = isFavorite;
      });
      
      set({ favoriteStatus: newFavoriteStatus });
      return response;
    } catch (error) {
      console.error('Error batch checking favorites:', error);
      return {};
    }
  },

  getFavoritesCount: async (entityType: EntityType) => {
    try {
      const count = await favoritesAPI.getFavoritesCount(entityType);
      set(state => ({
        favoritesCount: {
          ...state.favoritesCount,
          [entityType]: count
        }
      }));
    } catch (error) {
      console.error('Error fetching favorites count:', error);
    }
  },

  toggleFavorite: async (entityType: EntityType, entityId: number) => {
    const currentStatus = get().favoriteStatus[`${entityType}_${entityId}`];
    
    if (currentStatus) {
      await get().removeFavorite(entityType, entityId);
    } else {
      await get().addFavorite({ entityType, entityId });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
