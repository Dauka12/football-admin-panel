import type {
    CreateTeamRequest,
    TeamCreateResponse,
    TeamFullResponse,
    UpdateTeamRequest
} from '../types/teams';
import axiosInstance from './axios';

// Remove redundant base URL prefix to prevent double paths
export const teamApi = {
    getAll: async (): Promise<TeamFullResponse[]> => {
        const response = await axiosInstance.get(`/teams/public`);
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
