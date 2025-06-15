import type {
    CreateMatchRequest,
    MatchCreateResponse,
    MatchesPageResponse,
    MatchEvent,
    MatchEventRequest,
    MatchEventsResponse,
    MatchFullResponse,
    MatchStatus,
    UpdateMatchRequest
} from '../types/matches';
import axiosInstance from './axios';

// Match filter parameters
export interface MatchFilterParams {
    date?: string;
    status?: MatchStatus;
    cityId?: number;
    tournamentId?: number;
    page?: number;
    size?: number;
}

export const matchApi = {
    // Get all matches with filtering and pagination (public)
    getAll: async (filters: MatchFilterParams = {}): Promise<MatchesPageResponse> => {
        const params = new URLSearchParams();
        
        if (filters.date) params.append('date', filters.date);
        if (filters.status) params.append('status', filters.status);
        if (filters.cityId) params.append('cityId', filters.cityId.toString());
        if (filters.tournamentId) params.append('tournamentId', filters.tournamentId.toString());
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

    // Match Events API

    // Create match event
    createEvent: async (eventData: MatchEventRequest): Promise<MatchEvent> => {
        const response = await axiosInstance.post(`/match-events`, eventData);
        return response.data;
    },

    // Get event by ID
    getEventById: async (id: number): Promise<MatchEvent> => {
        const response = await axiosInstance.get(`/match-events/public/${id}`);
        return response.data;
    },
    
    // Get all events for a match
    getMatchEvents: async (matchId: number): Promise<MatchEventsResponse> => {
        const response = await axiosInstance.get(`/match-events/public/match/${matchId}`);
        return response.data;
    },

    // Legacy methods for backward compatibility
    addEvent: async (matchId: number, eventData: { playerId: number, type: string, minute: number }): Promise<MatchEvent> => {
        return matchApi.createEvent({
            matchId,
            playerId: eventData.playerId,
            type: eventData.type as any,
            minute: eventData.minute
        });
    },

    // Update match status (custom endpoint - may need to be implemented)
    updateStatus: async (matchId: number, status: MatchStatus): Promise<void> => {
        await axiosInstance.patch(`/matches/admin/${matchId}/status`, { status });
    },

    // Update participant score (custom endpoint - may need to be implemented)
    updateScore: async (matchId: number, participantId: number, score: number): Promise<void> => {
        await axiosInstance.patch(`/matches/admin/${matchId}/participants/${participantId}/score`, { score });
    }
};
