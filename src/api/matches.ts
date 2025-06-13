import type {
    CreateMatchRequest,
    MatchCreateResponse,
    MatchFullResponse,
    UpdateMatchRequest
} from '../types/matches';
import axiosInstance from './axios';

export const matchApi = {
    // Get all matches (public)
    getAll: async (): Promise<any> => {
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

    // Add event to match - Updated to use new event API
    addEvent: async (matchId: number, eventData: { playerId: number, type: string, minute: number }): Promise<any> => {
        const response = await axiosInstance.post(`/match-events/public`, {
            matchId,
            playerId: eventData.playerId,
            type: eventData.type,
            minute: eventData.minute
        });
        return response.data;
    },

    // Delete event from match
    deleteEvent: async (matchId: number, eventId: number): Promise<void> => {
        await axiosInstance.delete(`/match-events/admin/${eventId}`);
    },
    
    // Get events for a match
    getMatchEvents: async (matchId: number): Promise<any> => {
        const response = await axiosInstance.get(`/match-events/public/match/${matchId}`);
        return response.data?.events || [];
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
