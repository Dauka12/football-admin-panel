import type {
    CreateTournamentRequest,
    TournamentCreateResponse,
    TournamentFullResponse,
    UpdateTournamentRequest
} from '../types/tournaments';
import axiosInstance from './axios';

export const tournamentApi = {
    getAll: async (): Promise<TournamentFullResponse[]> => {
        const response = await axiosInstance.get(`/tournaments/public`);
        return response.data.tournaments;
    },

    getById: async (id: number): Promise<TournamentFullResponse> => {
        const response = await axiosInstance.get(`/tournaments/public/${id}`);
        return response.data;
    },

    create: async (data: CreateTournamentRequest): Promise<TournamentCreateResponse> => {
        const response = await axiosInstance.post(`/tournaments`, data);
        return response.data;
    },

    update: async (id: number, data: UpdateTournamentRequest): Promise<void> => {
        await axiosInstance.put(`/tournaments/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/tournaments/${id}`);
    }
};
