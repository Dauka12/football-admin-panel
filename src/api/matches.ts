import type {
    CreateMatchRequest,
    MatchCreateResponse,
    MatchesPageResponse,
    MatchFilterParams,
    MatchFullResponse,
    MatchWithReservationFilter,
    UpdateMatchRequest,
    MatchStatistics,
    MatchSummary
} from '../types/matches';
import { MatchStatus } from '../types/matches';
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
    },

    // Utility methods for better match management
    
    // Get matches by status
    getMatchesByStatus: async (status: MatchStatus, page = 0, size = 10): Promise<MatchesPageResponse> => {
        return matchApi.getAll({ status, page, size });
    },

    // Get matches by city
    getMatchesByCity: async (cityId: number, page = 0, size = 10): Promise<MatchesPageResponse> => {
        return matchApi.getAll({ cityId, page, size });
    },

    // Get matches by tournament
    getMatchesByTournament: async (tournamentId: number, page = 0, size = 10): Promise<MatchesPageResponse> => {
        return matchApi.getAll({ tournamentId, page, size });
    },

    // Get matches by organizer
    getMatchesByOrganizer: async (organizerUserId: number, page = 0, size = 10): Promise<MatchesPageResponse> => {
        return matchApi.getAll({ organizerUserId, page, size });
    },

    // Get matches by date range
    getMatchesByDateRange: async (dateFrom: string, dateTo: string, page = 0, size = 10): Promise<MatchesPageResponse> => {
        return matchApi.getMatchesWithReservations({ dateFrom, dateTo, page, size });
    },

    // Get upcoming matches
    getUpcomingMatches: async (page = 0, size = 10): Promise<MatchesPageResponse> => {
        const today = new Date().toISOString().split('T')[0];
        return matchApi.getAll({ 
            date: today, 
            status: MatchStatus.PENDING,
            page, 
            size 
        });
    },

    // Get completed matches
    getCompletedMatches: async (page = 0, size = 10): Promise<MatchesPageResponse> => {
        return matchApi.getMatchesByStatus(MatchStatus.COMPLETED, page, size);
    },

    // Get matches in progress
    getMatchesInProgress: async (page = 0, size = 10): Promise<MatchesPageResponse> => {
        return matchApi.getMatchesByStatus(MatchStatus.IN_PROGRESS, page, size);
    },

    // Utility functions for match data processing
    
    // Generate match summary from full match data
    createMatchSummary: (match: MatchFullResponse): MatchSummary => {
        return {
            id: match.id,
            title: match.tournament ? match.tournament.name : `Match ${match.id}`,
            startTime: match.startTime,
            endTime: match.endTime,
            status: match.status as MatchStatus,
            participantsCount: match.participants?.length || 0,
            playgroundName: match.reservation?.playground?.name,
            cityName: match.reservation?.playground?.cityId ? `City ${match.reservation.playground.cityId}` : undefined,
            tournamentName: match.tournament?.name
        };
    },

    // Generate match statistics from matches array
    generateMatchStatistics: (matches: MatchFullResponse[]): MatchStatistics => {
        const stats: MatchStatistics = {
            totalMatches: matches.length,
            pendingMatches: 0,
            inProgressMatches: 0,
            completedMatches: 0,
            cancelledMatches: 0
        };

        matches.forEach(match => {
            switch (match.status) {
                case MatchStatus.PENDING:
                    stats.pendingMatches++;
                    break;
                case MatchStatus.IN_PROGRESS:
                    stats.inProgressMatches++;
                    break;
                case MatchStatus.COMPLETED:
                    stats.completedMatches++;
                    break;
                case MatchStatus.CANCELLED:
                    stats.cancelledMatches++;
                    break;
            }
        });

        return stats;
    },

    // Check if user can join match
    canUserJoinMatch: (match: MatchFullResponse, userId: number): boolean => {
        if (match.status !== MatchStatus.PENDING) return false;
        
        const reservation = match.reservation;
        if (reservation?.playground?.maxCapacity && 
            match.participants.length >= reservation.playground.maxCapacity) {
            return false;
        }
        
        // Check if user is already a participant
        const isAlreadyParticipant = match.participants.some(p => p.userId === userId);
        return !isAlreadyParticipant;
    },

    // Get match capacity info
    getMatchCapacityInfo: (match: MatchFullResponse) => {
        const maxCapacity = match.reservation?.playground?.maxCapacity || 0;
        const currentParticipants = match.participants.length;
        const availableSlots = maxCapacity - currentParticipants;
        
        return {
            maxCapacity,
            currentParticipants,
            availableSlots,
            isFull: availableSlots <= 0,
            capacityPercentage: maxCapacity > 0 ? (currentParticipants / maxCapacity) * 100 : 0
        };
    }
};
