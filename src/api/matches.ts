import type {
    CreateMatchRequest,
    MatchCreateResponse,
    MatchesPageResponse,
    MatchFilterParams,
    MatchFullResponse,
    MatchStatus,
    UpdateMatchRequest
} from '../types/matches';
import axiosInstance from './axios';

export const matchApi = {
    // Get all matches with filtering and pagination (public)
    getAll: async (filters: MatchFilterParams = {}): Promise<MatchesPageResponse> => {
        const params = new URLSearchParams();
        
        if (filters.date) params.append('date', filters.date);
        if (filters.status) params.append('status', filters.status);
        if (filters.cityId) params.append('cityId', filters.cityId.toString());
        if (filters.tournamentId) params.append('tournamentId', filters.tournamentId.toString());
        if (filters.teamId) params.append('teamId', filters.teamId.toString());
        if (filters.page !== undefined) params.append('page', filters.page.toString());
        if (filters.size !== undefined) params.append('size', filters.size.toString());

        const response = await axiosInstance.get(`/matches/public/all?${params.toString()}`);
        return response.data;
    },

    // Get match by ID (public) - NOTE: API uses POST method
    getById: async (id: number): Promise<MatchFullResponse> => {
        const response = await axiosInstance.post(`/matches/public/${id}`);
        return response.data;
    },

    // Create match (admin only)
    create: async (data: CreateMatchRequest): Promise<MatchCreateResponse> => {
        const response = await axiosInstance.post(`/matches/admin`, data);
        return response.data;
    },

    // Update match (admin only)
    update: async (id: number, data: UpdateMatchRequest): Promise<void> => {
        await axiosInstance.patch(`/matches/admin/${id}`, data);
    },

    // Delete match (admin only)
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/matches/admin/${id}`);
    },

    // Update match status (admin only) - uses PATCH with status in body
    updateStatus: async (id: number, status: MatchStatus): Promise<void> => {
        await axiosInstance.patch(`/matches/admin/${id}`, { status });
    }
};
