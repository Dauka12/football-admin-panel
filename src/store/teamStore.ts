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

    fetchTeams: (forceRefresh?: boolean) => Promise<void>;
    fetchTeam: (id: number) => Promise<void>;
    fetchTeamsByIds: (ids: number[]) => Promise<TeamFullResponse[]>;
    createTeam: (data: CreateTeamRequest) => Promise<boolean>;
    updateTeam: (id: number, data: UpdateTeamRequest) => Promise<boolean>;
    deleteTeam: (id: number) => Promise<boolean>;
}

export const useTeamStore = create<TeamState>()((set, get) => ({
    teams: [],
    currentTeam: null,
    isLoading: false,
    error: null,

    fetchTeams: async (forceRefresh = false) => {
        // Check if we already have teams loaded and avoid redundant requests
        const { teams } = get();
        if (teams.length > 0 && !forceRefresh) return;

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
        // Prevent redundant requests
        const { currentTeam } = get();
        if (currentTeam && currentTeam.id === id) return;

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

    fetchTeamsByIds: async (ids: number[]) => {
        if (ids.length === 0) return [];
        
        try {
            // For each id, fetch the team details
            const teamPromises = ids.map(id => teamApi.getById(id));
            const teams = await Promise.all(teamPromises);
            return teams;
        } catch (error: any) {
            console.error('Failed to fetch teams by IDs:', error);
            throw error;
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
            
            // Instead of directly merging which causes type errors,
            // fetch the latest data to ensure proper typing
            const updatedTeam = await teamApi.getById(id);
            
            // Update state with the correctly typed data from the API
            set(state => ({
                // Update the teams list with the correctly typed team
                teams: state.teams.map(team => team.id === id ? updatedTeam : team),
                // Update currentTeam if it's the one being edited
                currentTeam: state.currentTeam?.id === id ? updatedTeam : state.currentTeam,
                isLoading: false
            }));
            
            return true;
        } 
        catch (error: any) {
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
