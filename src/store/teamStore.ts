import { create } from 'zustand';
import { teamApi } from '../api/teams';
import type {
    CreateTeamRequest,
    TeamFullResponse,
    UpdateTeamRequest
} from '../types/teams';

interface TeamState {
    teams: TeamFullResponse[];
    currentTeam: TeamFullResponse | null;
    isLoading: boolean;
    error: string | null;

    fetchTeams: () => Promise<void>;
    fetchTeam: (id: number) => Promise<void>;
    createTeam: (data: CreateTeamRequest) => Promise<boolean>;
    updateTeam: (id: number, data: UpdateTeamRequest) => Promise<boolean>;
    deleteTeam: (id: number) => Promise<boolean>;
}

export const useTeamStore = create<TeamState>()((set, get) => ({
    teams: [],
    currentTeam: null,
    isLoading: false,
    error: null,

    fetchTeams: async () => {
        set({ isLoading: true, error: null });
        try {
            const teams = await teamApi.getAll();
            set({ teams, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch teams',
                isLoading: false
            });
        }
    },

    fetchTeam: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const team = await teamApi.getById(id);
            set({ currentTeam: team, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || `Failed to fetch team #${id}`,
                isLoading: false
            });
        }
    },

    createTeam: async (data: CreateTeamRequest) => {
        set({ isLoading: true, error: null });
        try {
            await teamApi.create(data);
            await get().fetchTeams(); // Refresh the teams list
            set({ isLoading: false });
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create team',
                isLoading: false
            });
            return false;
        }
    },

    updateTeam: async (id: number, data: UpdateTeamRequest) => {
        set({ isLoading: true, error: null });
        try {
            await teamApi.update(id, data);

            // Refresh current team and team list
            if (get().currentTeam?.id === id) {
                await get().fetchTeam(id);
            }
            await get().fetchTeams();

            set({ isLoading: false });
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || `Failed to update team #${id}`,
                isLoading: false
            });
            return false;
        }
    },

    deleteTeam: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await teamApi.delete(id);

            // Remove from current list without reloading
            set({
                teams: get().teams.filter(team => team.id !== id),
                currentTeam: get().currentTeam?.id === id ? null : get().currentTeam,
                isLoading: false
            });
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || `Failed to delete team #${id}`,
                isLoading: false
            });
            return false;
        }
    }
}));
