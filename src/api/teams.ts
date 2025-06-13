import type {
    CreateTeamRequest,
    TeamCreateResponse,
    TeamFullResponse,
    TeamsPageResponse,
    UpdateTeamRequest
} from '../types/teams';
import axiosInstance from './axios';

// Define a type for filter parameters
export interface TeamFilterParams {
    name?: string;
    tournamentId?: number;
    primaryColor?: string;
    secondaryColor?: string;
}

// Remove redundant base URL prefix to prevent double paths
export const teamApi = {
    getAll: async (
        page = 0, 
        size = 10, 
        filters?: TeamFilterParams
    ): Promise<TeamsPageResponse> => {
        const response = await axiosInstance.get(`/teams/public`, {
            params: { 
                page, 
                size,
                ...filters // Spread the filter parameters
            }
        });
        return response.data;
    },

    getById: async (id: number): Promise<TeamFullResponse> => {
        const response = await axiosInstance.get(`/teams/public/${id}`);
        return response.data;
    },

    create: async (data: CreateTeamRequest): Promise<TeamCreateResponse> => {
        const response = await axiosInstance.post(`/teams`, data);
        return response.data;
    },

    update: async (id: number, data: UpdateTeamRequest): Promise<void> => {
        await axiosInstance.put(`/teams/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/teams/${id}`);
    }
};
