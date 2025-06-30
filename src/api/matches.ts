import type {
    CreateMatchRequest,
    MatchCreateResponse,
    MatchesPageResponse,
    MatchFilterParams,
    MatchFullResponse,
    MatchStatus,
    MatchWithReservationFilter,
    UpdateMatchRequest
} from '../types/matches';
import axiosInstance from './axios';

export const matchApi = {
    // Get all matches with filtering and pagination (public)
    getAll: async (filters: MatchFilterParams = {}): Promise<MatchesPageResponse> => {
        try {
            const params = new URLSearchParams();
            
            if (filters.date) params.append('date', filters.date);
            if (filters.status) params.append('status', filters.status);
            if (filters.cityId) params.append('cityId', filters.cityId.toString());
            if (filters.tournamentId) params.append('tournamentId', filters.tournamentId.toString());
            if (filters.teamId) params.append('teamId', filters.teamId.toString());
            if (filters.organizerUserId) params.append('organizerUserId', filters.organizerUserId.toString());
            if (filters.page !== undefined) params.append('page', filters.page.toString());
            if (filters.size !== undefined) params.append('size', filters.size.toString());

            const response = await axiosInstance.get(`/matches/public/all?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch matches:', error);
            throw error;
        }
    },

    // Get matches with reservations (public)
    getMatchesWithReservations: async (filters: MatchWithReservationFilter = {}): Promise<MatchesPageResponse> => {
        try {
            const params = new URLSearchParams();
            
            if (filters.page !== undefined) params.append('page', filters.page.toString());
            if (filters.size !== undefined) params.append('size', filters.size.toString());
            
            // Add filter object as a parameter if there are filters
            const filterObject = {
                ...(filters.cityId && { cityId: filters.cityId }),
                ...(filters.organizerUserId && { organizerUserId: filters.organizerUserId }),
                ...(filters.status && { status: filters.status }),
                ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
                ...(filters.dateTo && { dateTo: filters.dateTo }),
                ...(filters.page !== undefined && { page: filters.page }),
                ...(filters.size !== undefined && { size: filters.size })
            };

            if (Object.keys(filterObject).length > 0) {
                params.append('matchWithReservationFilter', JSON.stringify(filterObject));
            }

            const response = await axiosInstance.get(`/matches/public/reservations?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch matches with reservations:', error);
            throw error;
        }
    },

    // Get match by ID (public) - NOTE: API uses POST method according to Swagger
    getById: async (id: number): Promise<MatchFullResponse> => {
        try {
            const response = await axiosInstance.post(`/matches/public/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch match:', error);
            throw error;
        }
    },

    // Join match (authenticated user)
    joinMatch: async (id: number): Promise<void> => {
        try {
            await axiosInstance.post(`/matches/join/${id}`);
        } catch (error) {
            console.error('Failed to join match:', error);
            throw error;
        }
    },

    // Leave match (authenticated user)
    leaveMatch: async (id: number): Promise<void> => {
        try {
            await axiosInstance.post(`/matches/leave/${id}`);
        } catch (error) {
            console.error('Failed to leave match:', error);
            throw error;
        }
    },

    // Create match (admin only)
    create: async (data: CreateMatchRequest): Promise<MatchCreateResponse> => {
        try {
            const response = await axiosInstance.post(`/matches/admin`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to create match:', error);
            throw error;
        }
    },

    // Update match (admin only)
    update: async (id: number, data: UpdateMatchRequest): Promise<void> => {
        try {
            await axiosInstance.patch(`/matches/admin/${id}`, data);
        } catch (error) {
            console.error('Failed to update match:', error);
            throw error;
        }
    },

    // Delete match (admin only)
    delete: async (id: number): Promise<void> => {
        try {
            await axiosInstance.delete(`/matches/admin/${id}`);
        } catch (error) {
            console.error('Failed to delete match:', error);
            throw error;
        }
    },

    // Update match status (admin only) - uses PATCH with status in body
    updateStatus: async (id: number, status: MatchStatus): Promise<void> => {
        try {
            await axiosInstance.patch(`/matches/admin/${id}`, { status });
        } catch (error) {
            console.error('Failed to update match status:', error);
            throw error;
        }
    }
};
