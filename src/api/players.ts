import type {
    PlayerCreateRequest,
    PlayerCreateResponse,
    PlayerFilterParams,
    PlayerPublicResponse,
    PlayerUpdateRequest,
    PlayersPageResponse
} from '../types/players';
import axiosInstance from './axios';

export const playerApi = {
    getAll: async (filters?: PlayerFilterParams): Promise<PlayersPageResponse> => {
        try {
            const { page = 0, size = 10, ...otherFilters } = filters || {};
            const response = await axiosInstance.get(`/players/public`, {
                params: { 
                    page, 
                    size,
                    ...otherFilters
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch players:', error);
            throw error;
        }
    },

    getById: async (id: number): Promise<PlayerPublicResponse> => {
        try {
            const response = await axiosInstance.get(`/players/public/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch player:', error);
            throw error;
        }
    },

    create: async (data: PlayerCreateRequest): Promise<PlayerCreateResponse> => {
        try {
            const response = await axiosInstance.post(`/players`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to create player:', error);
            throw error;
        }
    },

    update: async (id: number, data: PlayerUpdateRequest): Promise<PlayerCreateResponse> => {
        try {
            const response = await axiosInstance.patch(`/players/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to update player:', error);
            throw error;
        }
    },

    delete: async (id: number): Promise<void> => {
        try {
            await axiosInstance.delete(`/players/${id}`);
        } catch (error) {
            console.error('Failed to delete player:', error);
            throw error;
        }
    },

    // Helper method to get players by array of IDs
    getByIds: async (ids: number[]): Promise<PlayerPublicResponse[]> => {
        if (!ids.length) return [];

        try {
            // Use Promise.all to fetch all players in parallel
            const playerPromises = ids.map(id => playerApi.getById(id));
            return Promise.all(playerPromises);
        } catch (error) {
            console.error('Failed to fetch players by IDs:', error);
            throw error;
        }
    }
};
