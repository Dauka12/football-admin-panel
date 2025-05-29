import type {
    PlayerCreateRequest,
    PlayerCreateResponse,
    PlayerPublicResponse,
    PlayerUpdateRequest
} from '../types/players';
import axiosInstance from './axios';

const BASE_URL = '/players';

export const playerApi = {
    getAll: async (): Promise<PlayerPublicResponse[]> => {
        const response = await axiosInstance.get(`${BASE_URL}`);
        return response.data;
    },

    getById: async (id: number): Promise<PlayerPublicResponse> => {
        const response = await axiosInstance.get(`${BASE_URL}/public/${id}`);
        return response.data;
    },

    create: async (data: PlayerCreateRequest): Promise<PlayerCreateResponse> => {
        const response = await axiosInstance.post(`${BASE_URL}`, data);
        return response.data;
    },

    update: async (id: number, data: PlayerUpdateRequest): Promise<PlayerCreateResponse> => {
        const response = await axiosInstance.patch(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`${BASE_URL}/${id}`);
    },

    // Helper method to get players by array of IDs
    getByIds: async (ids: number[]): Promise<PlayerPublicResponse[]> => {
        if (!ids.length) return [];

        // Use Promise.all to fetch all players in parallel
        const playerPromises = ids.map(id => playerApi.getById(id));
        return Promise.all(playerPromises);
    }
};
