import { create } from 'zustand';
import { statisticsApi } from '../api/statistics';
import type {
    TournamentStatisticsResponse,
    MatchResultsResponse,
    TeamMatchesResponse,
    PlayerStatisticsResponse
} from '../types/statistics';
import { ErrorHandler } from '../utils/errorHandler';

interface StatisticsStore {
    // Tournament statistics
    tournamentStats: TournamentStatisticsResponse[];
    isTournamentStatsLoading: boolean;
    tournamentStatsError: string | null;

    // Match results
    matchResults: MatchResultsResponse[];
    isMatchResultsLoading: boolean;
    matchResultsError: string | null;

    // Team matches
    teamMatches: TeamMatchesResponse | null;
    isTeamMatchesLoading: boolean;
    teamMatchesError: string | null;

    // Player statistics
    playerStats: PlayerStatisticsResponse | null;
    isPlayerStatsLoading: boolean;
    playerStatsError: string | null;

    // Actions
    fetchTournamentStatistics: (tournamentId: number) => Promise<void>;
    fetchTournamentMatchResults: (tournamentId: number) => Promise<void>;
    fetchTeamMatches: (teamId: number, page?: number, size?: number) => Promise<void>;
    fetchPlayerStatistics: (playerId: number) => Promise<void>;
    clearErrors: () => void;
    reset: () => void;
}

export const useStatisticsStore = create<StatisticsStore>((set) => ({
    // Initial state
    tournamentStats: [],
    isTournamentStatsLoading: false,
    tournamentStatsError: null,

    matchResults: [],
    isMatchResultsLoading: false,
    matchResultsError: null,

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
                isTournamentStatsLoading: false 
            });
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ 
                tournamentStatsError: errorMessage.message,
                isTournamentStatsLoading: false 
            });
        }
    },

    fetchTournamentMatchResults: async (tournamentId: number) => {
        set({ isMatchResultsLoading: true, matchResultsError: null });
        try {
            const results = await statisticsApi.getTournamentMatchResults(tournamentId);
            set({ 
                matchResults: results,
                isMatchResultsLoading: false 
            });
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ 
                matchResultsError: errorMessage.message,
                isMatchResultsLoading: false 
            });
        }
    },

    fetchTeamMatches: async (teamId: number, page = 0, size = 10) => {
        set({ isTeamMatchesLoading: true, teamMatchesError: null });
        try {
            const matches = await statisticsApi.getTeamMatches(teamId, page, size);
            set({ 
                teamMatches: matches,
                isTeamMatchesLoading: false 
            });
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ 
                teamMatchesError: errorMessage.message,
                isTeamMatchesLoading: false 
            });
        }
    },

    fetchPlayerStatistics: async (playerId: number) => {
        set({ isPlayerStatsLoading: true, playerStatsError: null });
        try {
            const stats = await statisticsApi.getPlayerStatistics(playerId);
            set({ 
                playerStats: stats,
                isPlayerStatsLoading: false 
            });
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ 
                playerStatsError: errorMessage.message,
                isPlayerStatsLoading: false 
            });
        }
    },

    clearErrors: () => {
        set({
            tournamentStatsError: null,
            matchResultsError: null,
            teamMatchesError: null,
            playerStatsError: null
        });
    },

    reset: () => {
        set({
            tournamentStats: [],
            isTournamentStatsLoading: false,
            tournamentStatsError: null,
            matchResults: [],
            isMatchResultsLoading: false,
            matchResultsError: null,
            teamMatches: null,
            isTeamMatchesLoading: false,
            teamMatchesError: null,
            playerStats: null,
            isPlayerStatsLoading: false,
            playerStatsError: null
        });
    }
}));
