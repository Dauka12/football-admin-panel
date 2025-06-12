import type {
    PlayerCreateRequest,
    PlayerCreateResponse,
    PlayerPublicResponse,
    PlayerUpdateRequest,
    PlayersPageResponse
} from '../types/players';
import axiosInstance from './axios';

// Define a type for filter parameters
export interface PlayerFilterParams {
    position?: string;
    club?: string;
    nationality?: string;
    minAge?: number;
    maxAge?: number;
    preferredFoot?: string;
}

// Remove redundant base URL prefix to prevent double paths
export const playerApi = {
    getAll: async (
        page = 0, 
        size = 10, 
        filters?: PlayerFilterParams
    ): Promise<PlayersPageResponse> => {
        const response = await axiosInstance.get(`/players/public`, {
            params: { 
                page, 
                size,
                ...filters // Spread the filter parameters
            }
        });
        return response.data;
    },

    getById: async (id: number): Promise<PlayerPublicResponse> => {
        const response = await axiosInstance.get(`/players/public/${id}`);
        return response.data;
    },

    create: async (data: PlayerCreateRequest): Promise<PlayerCreateResponse> => {
        const response = await axiosInstance.post(`/players`, data);
        return response.data;
    },

    update: async (id: number, data: PlayerUpdateRequest): Promise<PlayerCreateResponse> => {
        const response = await axiosInstance.patch(`/players/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/players/${id}`);
    },

    // Helper method to get players by array of IDs
    getByIds: async (ids: number[]): Promise<PlayerPublicResponse[]> => {
        if (!ids.length) return [];

        // Use Promise.all to fetch all players in parallel
        const playerPromises = ids.map(id => playerApi.getById(id));
        return Promise.all(playerPromises);
    }
};
