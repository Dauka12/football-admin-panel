import axios from 'axios';
import type { TeamMatchResultsResponse, TournamentMatchResult, TournamentTeamStatistics } from '../types/statistics';

// Create separate axios instance for statistics without v1
const statisticsAxios = axios.create({
    baseURL: 'https://sport-empire.kz/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for auth token
statisticsAxios.interceptors.request.use(
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
statisticsAxios.interceptors.response.use(
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
        statisticsAxios.get(`/statistics/public/tournament/${tournamentId}`).then(res => res.data),

    getTournamentMatches: (tournamentId: number): Promise<TournamentMatchResult[]> =>
        statisticsAxios.get(`/statistics/public/tournament/${tournamentId}/matches`).then(res => res.data),

    // Team statistics
    getTeamMatches: (teamId: number, page: number = 0, size: number = 10): Promise<TeamMatchResultsResponse> =>
        statisticsAxios.get(`/statistics/public/team/${teamId}/matches`, {
            params: { page, size }
        }).then(res => res.data),
};
