import type {
    CreateMatchParticipantRequest,
    MatchParticipant,
    MatchParticipantPaymentRequest,
    MatchParticipantResponse,
    MatchParticipantStatus,
    MatchParticipantStatusRequest,
    OrganizedMatchParticipant,
    ParticipationCheckResponse,
    UpdateMatchParticipantRequest
} from '../types/matchParticipants';
import axiosInstance from './axios';

export const matchParticipantApi = {
    // Get participant by ID
    getById: async (id: number): Promise<MatchParticipantResponse> => {
        try {
            const response = await axiosInstance.get(`/match-participants/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch match participant:', error);
            throw error;
        }
    },

    // Create new participant
    create: async (data: CreateMatchParticipantRequest): Promise<MatchParticipantResponse> => {
        try {
            const response = await axiosInstance.post('/match-participants', data);
            return response.data;
        } catch (error) {
            console.error('Failed to create match participant:', error);
            throw error;
        }
    },

    // Update participant
    update: async (id: number, data: UpdateMatchParticipantRequest): Promise<MatchParticipantResponse> => {
        try {
            const response = await axiosInstance.put(`/match-participants/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to update match participant:', error);
            throw error;
        }
    },

    // Delete participant
    delete: async (id: number): Promise<void> => {
        try {
            await axiosInstance.delete(`/match-participants/${id}`);
        } catch (error) {
            console.error('Failed to delete match participant:', error);
            throw error;
        }
    },

    // Get participants by match ID (public)
    getByMatchId: async (matchId: number): Promise<MatchParticipant[]> => {
        try {
            const response = await axiosInstance.get(`/match-participants/public/match/${matchId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch match participants:', error);
            throw error;
        }
    },

    // Get participants by match ID (admin)
    getByMatchIdAdmin: async (matchId: number): Promise<MatchParticipant[]> => {
        try {
            const response = await axiosInstance.get(`/match-participants/match/${matchId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch match participants (admin):', error);
            throw error;
        }
    },

    // Get participants by match ID and status
    getByMatchIdAndStatus: async (matchId: number, status: MatchParticipantStatus): Promise<MatchParticipant[]> => {
        try {
            const response = await axiosInstance.get(`/match-participants/match/${matchId}/status/${status}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch match participants by status:', error);
            throw error;
        }
    },

    // Get organized matches for current user
    getOrganizedMatches: async (): Promise<OrganizedMatchParticipant[]> => {
        try {
            const response = await axiosInstance.get('/match-participants/organized');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch organized matches:', error);
            throw error;
        }
    },

    // Check participation in match
    checkParticipation: async (matchId: number): Promise<ParticipationCheckResponse> => {
        try {
            const response = await axiosInstance.get(`/match-participants/match/${matchId}/check-participation`);
            return response.data;
        } catch (error) {
            console.error('Failed to check participation:', error);
            throw error;
        }
    },

    // Process payment for participant
    processPayment: async (id: number, paymentData: MatchParticipantPaymentRequest): Promise<MatchParticipantResponse> => {
        try {
            const response = await axiosInstance.post(`/match-participants/${id}/payment`, paymentData);
            return response.data;
        } catch (error) {
            console.error('Failed to process payment:', error);
            throw error;
        }
    },

    // Update participant status
    updateStatus: async (id: number, statusData: MatchParticipantStatusRequest): Promise<MatchParticipantResponse> => {
        try {
            const response = await axiosInstance.patch(`/match-participants/${id}/status`, statusData);
            return response.data;
        } catch (error) {
            console.error('Failed to update participant status:', error);
            throw error;
        }
    }
};
