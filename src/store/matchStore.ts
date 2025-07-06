import { create } from 'zustand';
import { matchApi } from '../api/matches';
import type {
    CreateMatchRequest,
    MatchFilterParams,
    MatchFullResponse,
    MatchStatus,
    UpdateMatchRequest
} from '../types/matches';
import { ErrorHandler } from '../utils/errorHandler';

interface MatchState {
    // State
    matches: MatchFullResponse[];
    currentMatch: MatchFullResponse | null;
    isLoading: boolean;
    error: string | null;
    
    // Pagination
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    
    // Filters
    filters: MatchFilterParams;
    
    // Actions
    fetchMatches: (filters?: MatchFilterParams, forceRefresh?: boolean) => Promise<void>;
    fetchMatchById: (id: number) => Promise<void>;
    createMatch: (data: CreateMatchRequest) => Promise<boolean>;
    updateMatch: (id: number, data: UpdateMatchRequest) => Promise<boolean>;
    deleteMatch: (id: number) => Promise<boolean>;
    updateMatchStatus: (id: number, status: MatchStatus) => Promise<boolean>;
    setFilters: (filters: MatchFilterParams) => void;
    clearError: () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
    // Initial state
    matches: [],
    currentMatch: null,
    isLoading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    filters: {},

    // Fetch all matches
    fetchMatches: async (filters = {}, forceRefresh = false) => {
        const state = get();
        
        // Prevent duplicate requests
        if (state.isLoading && !forceRefresh) {
            console.log('Matches already loading, skipping request');
            return;
        }

        set({ isLoading: true, error: null });
        
        try {
            console.log('Fetching matches with filters:', filters);
            
            const response = await matchApi.getAll({
                ...state.filters,
                ...filters,
                page: filters.page ?? state.currentPage,
                size: filters.size ?? state.pageSize
            });

            console.log('Matches API response:', response);

            set({
                matches: response.content || [],
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0,
                currentPage: response.number || 0,
                pageSize: response.size || 10,
                isLoading: false,
                error: null
            });
        } catch (error) {
            console.error('Error fetching matches:', error);
            const errorMessage = ErrorHandler.handle(error);
            set({
                isLoading: false,
                error: errorMessage.message,
                matches: []
            });
        }
    },

    // Fetch match by ID
    fetchMatchById: async (id: number) => {
        set({ isLoading: true, error: null });
        
        try {
            console.log('Fetching match by ID:', id);
            
            const match = await matchApi.getById(id);
            
            console.log('Match details fetched:', match);
            
            set({
                currentMatch: match,
                isLoading: false,
                error: null
            });
        } catch (error) {
            console.error('Error fetching match:', error);
            const errorMessage = ErrorHandler.handle(error);
            set({
                isLoading: false,
                error: errorMessage.message,
                currentMatch: null
            });
        }
    },

    // Create new match
    createMatch: async (data: CreateMatchRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
            console.log('Creating match:', data);
            
            await matchApi.create(data);
            
            console.log('Match created successfully');
            
            // Refresh matches list
            await get().fetchMatches({}, true);
            
            set({ isLoading: false });
            return true;
        } catch (error) {
            console.error('Error creating match:', error);
            const errorMessage = ErrorHandler.handle(error);
            set({
                isLoading: false,
                error: errorMessage.message
            });
            return false;
        }
    },

    // Update match
    updateMatch: async (id: number, data: UpdateMatchRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
            console.log('Updating match:', id, data);
            
            // Ensure startTime and endTime are included if not provided
            const currentMatch = get().currentMatch;
            const updateData: UpdateMatchRequest = {
                ...data,
                startTime: data.startTime || (currentMatch?.id === id ? currentMatch.startTime : undefined),
                endTime: data.endTime || (currentMatch?.id === id ? currentMatch.endTime : undefined)
            };
            
            await matchApi.update(id, updateData);
            
            console.log('Match updated successfully');
            
            // Refresh current match if it's the one being updated
            const state = get();
            if (state.currentMatch?.id === id) {
                await get().fetchMatchById(id);
            }
            
            // Refresh matches list
            await get().fetchMatches({}, true);
            
            set({ isLoading: false });
            return true;
        } catch (error) {
            console.error('Error updating match:', error);
            const errorMessage = ErrorHandler.handle(error);
            set({
                isLoading: false,
                error: errorMessage.message
            });
            return false;
        }
    },

    // Delete match
    deleteMatch: async (id: number): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
            console.log('Deleting match:', id);
            
            await matchApi.delete(id);
            
            console.log('Match deleted successfully');
            
            // Refresh matches list
            await get().fetchMatches({}, true);
            
            set({ isLoading: false });
            return true;
        } catch (error) {
            console.error('Error deleting match:', error);
            const errorMessage = ErrorHandler.handle(error);
            set({
                isLoading: false,
                error: errorMessage.message
            });
            return false;
        }
    },

    // Update match status
    updateMatchStatus: async (id: number, status: MatchStatus): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
            console.log('Updating match status:', id, status);
            
            // Try to use the lightweight status update method first
            try {
                await matchApi.updateMatchStatusOnly(id, status);
            } catch (error) {
                // If that fails, use the full update method with current match data
                const currentMatch = get().currentMatch;
                if (currentMatch && currentMatch.id === id) {
                    const updateData: UpdateMatchRequest = {
                        tournamentId: currentMatch.tournament?.id,
                        teams: currentMatch.participants?.map(p => p.teamId) || [],
                        cityId: currentMatch.cityId,
                        status: status,
                        playgroundId: currentMatch.reservation?.playground?.id || 1,
                        startTime: currentMatch.startTime,
                        endTime: currentMatch.endTime,
                        maxCapacity: currentMatch.reservation?.playground?.maxCapacity || 20,
                        description: currentMatch.description || '',
                        sportTypeId: currentMatch.sportTypeId
                    };
                    
                    await matchApi.update(id, updateData);
                } else {
                    // Last resort - minimal update
                    await matchApi.update(id, { status });
                }
            }
            
            console.log('Match status updated successfully');
            
            // Refresh current match if it's the one being updated
            const state = get();
            if (state.currentMatch?.id === id) {
                await get().fetchMatchById(id);
            }
            
            // Refresh matches list
            await get().fetchMatches({}, true);
            
            set({ isLoading: false });
            return true;
        } catch (error) {
            console.error('Error updating match status:', error);
            const errorMessage = ErrorHandler.handle(error);
            set({
                isLoading: false,
                error: errorMessage.message
            });
            return false;
        }
    },

    // Set filters
    setFilters: (filters: MatchFilterParams) => {
        set({ filters });
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    }
}));
