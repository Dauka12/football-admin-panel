import type {
    PlayerCreateRequest,
    PlayerCreateResponse,
    PlayerPublicResponse,
    PlayerUpdateRequest,
    PlayersPageResponse
} from '../types/players';
import axiosInstance from './axios';

// Remove redundant base URL prefix to prevent double paths
export const playerApi = {
    getAll: async (page = 0, size = 10): Promise<PlayersPageResponse> => {
        const response = await axiosInstance.get(`/players/public`, {
            params: { page, size }
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
