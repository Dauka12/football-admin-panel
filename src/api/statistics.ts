import axiosInstance from './axios';
import type {
    TournamentStatisticsResponse,
    MatchResultsResponse,
    TeamMatchesResponse,
    PlayerStatisticsResponse
} from '../types/statistics';

// Add request interceptor for auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        if (response.data === null || response.data === undefined) {
            response.data = [];
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
        }
        console.error('Statistics API Error:', error);
        return Promise.reject(error);
    }
);

export const statisticsApi = {
    // Get tournament statistics
    getTournamentStatistics: async (tournamentId: number): Promise<TournamentStatisticsResponse[]> => {
        try {
            const response = await axiosInstance.get(`/statistics/public/tournament/${tournamentId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch tournament statistics:', error);
            throw error;
        }
    },

    // Get match results matrix for a tournament
    getTournamentMatchResults: async (tournamentId: number): Promise<MatchResultsResponse[]> => {
        try {
            const response = await axiosInstance.get(`/statistics/public/tournament/${tournamentId}/matches`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch tournament match results:', error);
            throw error;
        }
    },

    // Get all matches for a specific team
    getTeamMatches: async (teamId: number, page = 0, size = 10): Promise<TeamMatchesResponse> => {
        try {
            const response = await axiosInstance.get(`/statistics/public/team/${teamId}/matches`, {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch team matches:', error);
            throw error;
        }
    },

    // Get player statistics
    getPlayerStatistics: async (playerId: number): Promise<PlayerStatisticsResponse> => {
        try {
            const response = await axiosInstance.get(`/statistics/public/player/${playerId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch player statistics:', error);
            throw error;
        }
    }
};
