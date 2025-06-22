import type {
    PlayerCreateRequest,
    PlayerCreateResponse,
    PlayerPublicResponse,
    PlayerUpdateRequest,
    PlayersPageResponse,
    PlayerPosition
} from '../types/players';
import type { PreferredFoot } from '../types/teams';
import axiosInstance from './axios';

// Filter parameters matching the API spec exactly
export interface PlayerFilterParams {
    teamId?: number;
    age?: number;
    nationality?: string;
    birthplace?: string;
    preferredFoot?: PreferredFoot;
    fullName?: string;
    sportTypeId?: number;
    position?: PlayerPosition;
    page?: number;
    size?: number;
}

// Remove redundant base URL prefix to prevent double paths
export const playerApi = {
    getAll: async (filters?: PlayerFilterParams): Promise<PlayersPageResponse> => {
        const { page = 0, size = 10, ...otherFilters } = filters || {};
        const response = await axiosInstance.get(`/players/public`, {
            params: { 
                page, 
                size,
                ...otherFilters
            }
        });
        return response.data;
    },

    getById: async (id: number): Promise<PlayerPublicResponse> => {
        // Use the correct public endpoint as shown in API documentation
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
