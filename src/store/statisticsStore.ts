import { create } from 'zustand';
import { statisticsApi } from '../api/statistics';
import type { PlayerStatisticsResponse, TeamMatchResultsResponse, TournamentMatchResult, TournamentTeamStatistics } from '../types/statistics';

interface StatisticsState {
    // Tournament statistics
    tournamentStats: TournamentTeamStatistics[];
    tournamentMatches: TournamentMatchResult[];
    isTournamentStatsLoading: boolean;
    isTournamentMatchesLoading: boolean;
    tournamentStatsError: string | null;
    tournamentMatchesError: string | null;

    // Team statistics
    teamMatches: TeamMatchResultsResponse | null;
    isTeamMatchesLoading: boolean;
    teamMatchesError: string | null;

    // Player statistics
    playerStats: PlayerStatisticsResponse | null;
    isPlayerStatsLoading: boolean;
    playerStatsError: string | null;

    // Actions
    fetchTournamentStatistics: (tournamentId: number) => Promise<void>;
    fetchTournamentMatches: (tournamentId: number) => Promise<void>;
    fetchTeamMatches: (teamId: number, page?: number, size?: number) => Promise<void>;
    fetchPlayerStatistics: (playerId: number) => Promise<void>;
    clearStatistics: () => void;
}

export const useStatisticsStore = create<StatisticsState>((set) => ({
    // Initial state
    tournamentStats: [],
    tournamentMatches: [],
    isTournamentStatsLoading: false,
    isTournamentMatchesLoading: false,
    tournamentStatsError: null,
    tournamentMatchesError: null,
    teamMatches: null,
    isTeamMatchesLoading: false,
    teamMatchesError: null,
    playerStats: null,
    isPlayerStatsLoading: false,
    playerStatsError: null,

    // Actions
    fetchTournamentStatistics: async (tournamentId: number) => {
        set({ isTournamentStatsLoading: true, tournamentStatsError: null });
        
        try {
            const stats = await statisticsApi.getTournamentStatistics(tournamentId);
            set({ 
                tournamentStats: stats,
                isTournamentStatsLoading: false,
                tournamentStatsError: null
            });
        } catch (error) {
            console.error('Failed to fetch tournament statistics:', error);
            set({ 
                isTournamentStatsLoading: false,
                tournamentStatsError: 'Failed to load tournament statistics'
            });
        }
    },

    fetchTournamentMatches: async (tournamentId: number) => {
        set({ isTournamentMatchesLoading: true, tournamentMatchesError: null });
        
        try {
            const matches = await statisticsApi.getTournamentMatches(tournamentId);
            set({ 
                tournamentMatches: matches,
                isTournamentMatchesLoading: false,
                tournamentMatchesError: null
            });
        } catch (error) {
            console.error('Failed to fetch tournament matches:', error);
            set({ 
                isTournamentMatchesLoading: false,
                tournamentMatchesError: 'Failed to load tournament matches'
            });
        }
    },

    fetchTeamMatches: async (teamId: number, page = 0, size = 10) => {
        set({ isTeamMatchesLoading: true, teamMatchesError: null });
        
        try {
            const matches = await statisticsApi.getTeamMatches(teamId, page, size);
            set({ 
                teamMatches: matches,
                isTeamMatchesLoading: false,
                teamMatchesError: null
            });
        } catch (error) {
            console.error('Failed to fetch team matches:', error);
            set({ 
                isTeamMatchesLoading: false,
                teamMatchesError: 'Failed to load team matches'
            });
        }
    },

    fetchPlayerStatistics: async (playerId: number) => {
        set({ isPlayerStatsLoading: true, playerStatsError: null });
        
        try {
            const stats = await statisticsApi.getPlayerStatistics(playerId);
            set({ 
                playerStats: stats,
                isPlayerStatsLoading: false,
                playerStatsError: null
            });
        } catch (error) {
            console.error('Failed to fetch player statistics:', error);
            set({ 
                isPlayerStatsLoading: false,
                playerStatsError: 'Failed to load player statistics'
            });
        }
    },

    clearStatistics: () => {
        set({
            tournamentStats: [],
            tournamentMatches: [],
            teamMatches: null,
            playerStats: null,
            isTournamentStatsLoading: false,
            isTournamentMatchesLoading: false,
            isTeamMatchesLoading: false,
            isPlayerStatsLoading: false,
            tournamentStatsError: null,
            tournamentMatchesError: null,
            teamMatchesError: null,
            playerStatsError: null
        });
    }
}));
