import type { PlayerStatisticsResponse, TeamMatchResultsResponse, TournamentMatchResult, TournamentTeamStatistics } from '../types/statistics';
import axiosInstance from './axios';

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
    // Tournament statistics
    getTournamentStatistics: (tournamentId: number): Promise<TournamentTeamStatistics[]> =>
        axiosInstance.get(`/statistics/public/tournament/${tournamentId}`).then(res => res.data),

    getTournamentMatches: (tournamentId: number): Promise<TournamentMatchResult[]> =>
        axiosInstance.get(`/statistics/public/tournament/${tournamentId}/matches`).then(res => res.data),

    // Team statistics
    getTeamMatches: (teamId: number, page: number = 0, size: number = 10): Promise<TeamMatchResultsResponse> =>
        axiosInstance.get(`/statistics/public/team/${teamId}/matches`, {
            params: { page, size }
        }).then(res => res.data),

    // Player statistics
    getPlayerStatistics: (playerId: number): Promise<PlayerStatisticsResponse> =>
        axiosInstance.get(`/statistics/public/player/${playerId}`).then(res => res.data),
};
