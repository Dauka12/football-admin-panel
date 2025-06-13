import { create } from 'zustand';
import type { TeamFilterParams } from '../api/teams';
import { teamApi } from '../api/teams';
import type {
    CreateTeamRequest,
    TeamFullResponse,
    UpdateTeamRequest
} from '../types/teams';
import { apiService } from '../utils/apiService';
import { ErrorHandler } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

interface TeamState {
    teams: TeamFullResponse[];
    currentTeam: TeamFullResponse | null;
    isLoading: boolean;
    error: string | null;
    
    // Pagination state
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    
    // Filter state
    filters: TeamFilterParams;
    
    fetchTeams: (forceRefresh?: boolean, page?: number, size?: number, filters?: TeamFilterParams) => Promise<void>;
    setFilters: (filters: TeamFilterParams) => void;
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
    
    // Pagination state
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    
    // Filter state
    filters: {},
    
    // Set filters method
    setFilters: (filters: TeamFilterParams) => {
        set({ filters });
    },

    fetchTeams: async (forceRefresh = false, page = 0, size = 10, filters?: TeamFilterParams) => {
        // Check if we already have teams loaded for the same page and avoid redundant requests
        const { teams, currentPage, pageSize, filters: currentFilters } = get();
        
        // Use provided filters or fall back to current filters in state
        const filtersToApply = filters || currentFilters;
        
        // If not forcing refresh, we only want to avoid a request if:
        // 1. We have teams
        // 2. We're on the same page
        // 3. We're using the same page size
        // 4. We're using the same filters (deep comparison)
        if (
            teams.length > 0 && 
            currentPage === page && 
            pageSize === size && 
            !forceRefresh &&
            JSON.stringify(currentFilters) === JSON.stringify(filtersToApply)
        ) {
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await apiService.execute(
                () => teamApi.getAll(page, size, filtersToApply),
                'fetchTeams',
                { enableCache: false } // Disable cache to ensure fresh data
            );
            
            // Ensure response contains content array
            if (response && response.content && Array.isArray(response.content)) {
                set({ 
                    teams: response.content, 
                    totalElements: response.totalElements,
                    totalPages: response.totalPages,
                    currentPage: response.number,
                    pageSize: response.size,
                    filters: filtersToApply, // Store the filters that were used
                    isLoading: false,
                    error: null
                });
            } else {
                // Fallback if response structure is unexpected
                set({ 
                    teams: [],
                    totalElements: 0,
                    totalPages: 0,
                    currentPage: 0,
                    pageSize: size,
                    isLoading: false,
                    error: 'Unexpected API response format'
                });
            }
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                teams: [], // Ensure we always have an array even on error
                error: errorMessage.message,
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
            const team = await apiService.execute(
                () => teamApi.getById(id),
                `fetchTeam_${id}`,
                { enableCache: true, cacheTTL: 2 * 60 * 1000 } // Cache for 2 minutes
            );
            set({ currentTeam: team, isLoading: false });
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
        }
    },

    fetchTeamsByIds: async (ids: number[]) => {
        if (ids.length === 0) return [];
        
        try {
            // For each id, fetch the team details with caching
            const teamPromises = ids.map(id => 
                apiService.execute(
                    () => teamApi.getById(id),
                    `fetchTeam_${id}`,
                    { enableCache: true, cacheTTL: 2 * 60 * 1000 }
                )
            );
            const teams = await Promise.all(teamPromises);
            return teams;
        } catch (error: any) {
            console.error('Failed to fetch teams by IDs:', error);
            ErrorHandler.handle(error);
            throw error;
        }
    },

    createTeam: async (data: CreateTeamRequest) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => teamApi.create(data),
                'createTeam'
            );
            
            // Clear cache and refresh teams list
            apiService.clearCache(['fetchTeams']);
            await get().fetchTeams(true);
            
            set({ isLoading: false });
            showToast('Team created successfully!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    updateTeam: async (id: number, data: UpdateTeamRequest) => {
        set({ isLoading: true, error: null });
        
        try {
            await apiService.execute(
                () => teamApi.update(id, data),
                `updateTeam_${id}`
            );
            
            // Fetch the latest data to ensure proper typing
            const updatedTeam = await apiService.execute(
                () => teamApi.getById(id),
                `fetchTeam_${id}`,
                { forceRefresh: true }
            );
            
            // Clear relevant cache entries
            apiService.clearCache([`fetchTeam_${id}`, 'fetchTeams']);
            
            // Update state with the correctly typed data from the API
            set(state => ({
                // Update the teams list with the correctly typed team
                teams: state.teams.map(team => team.id === id ? updatedTeam : team),
                // Update currentTeam if it's the one being edited
                currentTeam: state.currentTeam?.id === id ? updatedTeam : state.currentTeam,
                isLoading: false
            }));
            
            showToast('Team updated successfully!', 'success');
            return true;
        } 
        catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({ 
                error: errorMessage.message, 
                isLoading: false 
            });
            return false;
        }
    },

    deleteTeam: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => teamApi.delete(id),
                `deleteTeam_${id}`
            );

            // Clear relevant cache entries
            apiService.clearCache([`fetchTeam_${id}`, 'fetchTeams']);

            // Remove from current list without reloading
            set({
                teams: get().teams.filter(team => team.id !== id),
                currentTeam: get().currentTeam?.id === id ? null : get().currentTeam,
                isLoading: false
            });
            
            showToast('Team deleted successfully!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    }
}));
