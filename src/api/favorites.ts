import type { AxiosResponse } from 'axios';
import axiosInstance from './axios';
import type {
  Favorite,
  AddFavoriteRequest,
  FavoritesResponse,
  BatchCheckResponse,
  EntityType,
  FavoritesFilters
} from '../types/favorites';

export const favoritesAPI = {
  // Add an item to favorites
  addFavorite: async (data: AddFavoriteRequest): Promise<Favorite> => {
    try {
      const response: AxiosResponse<Favorite> = await axiosInstance.post('/favorites', data);
      return response.data;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  // Get user's favorites by entity type
  getFavorites: async (entityType: EntityType, filters?: FavoritesFilters): Promise<FavoritesResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters?.page !== undefined) params.append('page', filters.page.toString());
      if (filters?.size !== undefined) params.append('size', filters.size.toString());

      const response: AxiosResponse<FavoritesResponse> = await axiosInstance.get(
        `/favorites/${entityType}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  // Check if an item is in favorites
  checkFavoriteStatus: async (entityType: EntityType, entityId: number): Promise<boolean> => {
    try {
      const response: AxiosResponse<boolean> = await axiosInstance.get(
        `/favorites/${entityType}/${entityId}/status`
      );
      return response.data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      throw error;
    }
  },

  // Check favorite status for multiple items
  batchCheckFavorites: async (entityType: EntityType, entityIds: number[]): Promise<BatchCheckResponse> => {
    try {
      const response: AxiosResponse<BatchCheckResponse> = await axiosInstance.post(
        `/favorites/${entityType}/batch-check`,
        entityIds
      );
      return response.data;
    } catch (error) {
      console.error('Error batch checking favorites:', error);
      throw error;
    }
  },

  // Get count of favorites by type
  getFavoritesCount: async (entityType: EntityType): Promise<number> => {
    try {
      const response: AxiosResponse<number> = await axiosInstance.get(`/favorites/${entityType}/count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites count:', error);
      throw error;
    }
  },

  // Remove an item from favorites
  removeFavorite: async (entityType: EntityType, entityId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/favorites/${entityType}/${entityId}`);
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }
};

export default favoritesAPI;
