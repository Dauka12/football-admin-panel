import type {
    CreateTournamentRequest,
    TournamentCreateResponse,
    TournamentFullResponse,
    UpdateTournamentRequest
} from '../types/tournaments';
import axiosInstance from './axios';

// Tournament filter parameters based on API spec
export interface TournamentFilterParams {
    name?: string;
    location?: string;
    date?: string;
    cityId?: number;
    sportTypeId?: number;
    page?: number;
    size?: number;
}

export const tournamentApi = {
    getAll: async (filters?: TournamentFilterParams): Promise<TournamentFullResponse[]> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, value.toString());
                }
            });
        }
        const response = await axiosInstance.get(`/tournaments/public?${params}`);
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

    update: async (id: number, data: UpdateTournamentRequest): Promise<TournamentFullResponse> => {
        const response = await axiosInstance.patch(`/tournaments/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/tournaments/${id}`);
    }
};
