import type {
    CreateTeamRequest,
    TeamCreateResponse,
    TeamFullResponse,
    TeamsPageResponse,
    UpdateTeamRequest
} from '../types/teams';
import axiosInstance from './axios';

export interface TeamFilterParams {
    name?: string;
    tournamentId?: number;
    primaryColor?: string;
    secondaryColor?: string;
    sportTypeId?: number;
}

export const teamApi = {
    getAll: async (
        page = 0, 
        size = 10, 
        filters?: TeamFilterParams
    ): Promise<TeamsPageResponse> => {
        try {
            const response = await axiosInstance.get(`/teams/public`, {
                params: { 
                    page, 
                    size,
                    ...filters
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            throw error;
        }
    },

    getById: async (id: number): Promise<TeamFullResponse> => {
        try {
            const response = await axiosInstance.get(`/teams/public/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch team:', error);
            throw error;
        }
    },

    create: async (data: CreateTeamRequest): Promise<TeamCreateResponse> => {
        try {
            const response = await axiosInstance.post(`/teams`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to create team:', error);
            throw error;
        }
    },

    update: async (id: number, data: UpdateTeamRequest): Promise<void> => {
        try {
            await axiosInstance.put(`/teams/${id}`, data);
        } catch (error) {
            console.error('Failed to update team:', error);
            throw error;
        }
    },

    delete: async (id: number): Promise<void> => {
        try {
            await axiosInstance.delete(`/teams/${id}`);
        } catch (error) {
            console.error('Failed to delete team:', error);
            throw error;
        }
    }
};
