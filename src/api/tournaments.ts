import type {
    CreateTournamentRequest,
    TournamentCreateResponse,
    TournamentFilters,
    TournamentFullResponse,
    TournamentPaginatedResponse,
    UpdateTournamentRequest
} from '../types/tournaments';
import axiosInstance from './axios';

export const tournamentApi = {
    getAll: async (filters?: TournamentFilters): Promise<TournamentPaginatedResponse> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, value.toString());
                }
            });
        }
        const response = await axiosInstance.get(`/tournaments/public?${params}`);
        return response.data;
    },

    getById: async (id: number): Promise<TournamentFullResponse> => {
        const response = await axiosInstance.get(`/tournaments/public/${id}`);
        return response.data;
    },

    create: async (data: CreateTournamentRequest): Promise<TournamentCreateResponse> => {
        const response = await axiosInstance.post(`/tournaments`, data);
        return response.data;
    },

    update: async (id: number, data: UpdateTournamentRequest): Promise<TournamentFullResponse> => {
        console.log('API update called with:', { id, data });
        const response = await axiosInstance.patch(`/tournaments/${id}`, data);
        console.log('API update response:', response.data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/tournaments/${id}`);
    }
};
