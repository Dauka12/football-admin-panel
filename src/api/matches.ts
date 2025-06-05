import type {
    CreateMatchRequest,
    MatchCreateResponse,
    MatchEvent,
    MatchFullResponse,
    MatchListResponse,
    UpdateMatchRequest
} from '../types/matches';
import axiosInstance from './axios';

export const matchApi = {
    // Get all matches (public)
    getAll: async (): Promise<MatchListResponse[]> => {
        const response = await axiosInstance.get(`/matches/public/all`);
        return response.data;
    },

    // Get match by ID (public)
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
    update: async (id: number, data: UpdateMatchRequest): Promise<MatchFullResponse> => {
        const response = await axiosInstance.patch(`/matches/admin/${id}`, data);
        return response.data;
    },

    // Delete match (admin only)
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/matches/admin/${id}`);
    },

    // Match Events API

    // Add event to match
    addEvent: async (matchId: number, eventData: Omit<MatchEvent, 'id'>): Promise<{ id: number }> => {
        const response = await axiosInstance.post(`/matches/admin/${matchId}/events`, eventData);
        return response.data;
    },

    // Delete event from match
    deleteEvent: async (matchId: number, eventId: number): Promise<void> => {
        await axiosInstance.delete(`/matches/admin/${matchId}/events/${eventId}`);
    },

    // Update match status
    updateStatus: async (matchId: number, status: string): Promise<void> => {
        await axiosInstance.patch(`/matches/admin/${matchId}/status`, { status });
    },

    // Update participant score
    updateScore: async (matchId: number, participantId: number, score: number): Promise<void> => {
        await axiosInstance.patch(`/matches/admin/${matchId}/participants/${participantId}/score`, { score });
    }
};
