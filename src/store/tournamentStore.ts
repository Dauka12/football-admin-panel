import { create } from 'zustand';
import { tournamentApi } from '../api/tournaments';
import type {
    CreateTournamentRequest,
    TournamentFilters,
    TournamentFullResponse,
    TournamentPaginatedResponse,
    UpdateTournamentRequest
} from '../types/tournaments';
import { apiService } from '../utils/apiService';
import { ErrorHandler } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

interface TournamentState {
    tournaments: TournamentFullResponse[];
    paginatedTournaments: TournamentPaginatedResponse | null;
    currentTournament: TournamentFullResponse | null;
    isLoading: boolean;
    error: string | null;

    fetchTournaments: (forceRefresh?: boolean) => Promise<void>;
    fetchTournamentsWithFilters: (filters?: TournamentFilters) => Promise<void>;
    fetchTournament: (id: number) => Promise<void>;
    createTournament: (data: CreateTournamentRequest) => Promise<boolean>;
    updateTournament: (id: number, data: UpdateTournamentRequest) => Promise<boolean>;
    deleteTournament: (id: number) => Promise<boolean>;
    clearError: () => void;
}

export const useTournamentStore = create<TournamentState>()((set, get) => ({
    tournaments: [],
    paginatedTournaments: null,
    currentTournament: null,
    isLoading: false,
    error: null,

    fetchTournaments: async (forceRefresh = false) => {
        // Check if we already have tournaments loaded and avoid redundant requests
        const { tournaments } = get();
        if (tournaments && tournaments.length > 0 && !forceRefresh) return;

        set({ isLoading: true, error: null });

        try {
            // Use execute instead of executeWithRetry
            const tournamentsResponse = await apiService.execute(
                () => tournamentApi.getAll(),
                'fetchTournaments',
                { 
                    enableCache: true,
                    cacheTTL: 5 * 60 * 1000, // 5 minutes
                    maxRetries: 3
                }
            );
            
            // Extract tournaments from paginated response
            const tournamentsArray = tournamentsResponse?.content || [];
            
            set({ 
                tournaments: tournamentsArray, 
                paginatedTournaments: tournamentsResponse,
                isLoading: false 
            });
        } catch (error: any) {
            console.error('Error fetching tournaments:', error);
            const errorMessage = ErrorHandler.handle(error);
            set({
                tournaments: [], // Set empty array on error
                paginatedTournaments: null,
                error: errorMessage.message,
                isLoading: false
            });
        }
    },

    fetchTournamentsWithFilters: async (filters?: TournamentFilters) => {
        set({ isLoading: true, error: null });

        try {
            const tournamentsResponse = await apiService.execute(
                () => tournamentApi.getAll(filters),
                `fetchTournamentsWithFilters_${JSON.stringify(filters)}`,
                { 
                    enableCache: true,
                    cacheTTL: 2 * 60 * 1000, // 2 minutes for filtered results
                    maxRetries: 3
                }
            );
            
            const tournamentsArray = tournamentsResponse?.content || [];
            
            set({ 
                tournaments: tournamentsArray, 
                paginatedTournaments: tournamentsResponse,
                isLoading: false 
            });
        } catch (error: any) {
            console.error('Error fetching tournaments with filters:', error);
            const errorMessage = ErrorHandler.handle(error);
            set({
                tournaments: [],
                paginatedTournaments: null,
                error: errorMessage.message,
                isLoading: false
            });
        }
    },

    clearError: () => {
        set({ error: null });
    },

    fetchTournament: async (id: number) => {
        // Prevent redundant requests
        const { currentTournament } = get();
        if (currentTournament && currentTournament.id === id) return;

        set({ isLoading: true, error: null });
        try {
            const tournament = await apiService.execute(
                () => tournamentApi.getById(id),
                `fetchTournament_${id}`,
                { enableCache: true, cacheTTL: 2 * 60 * 1000 } // Cache for 2 minutes
            );
            set({ currentTournament: tournament, isLoading: false });
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
        }
    },

    createTournament: async (data: CreateTournamentRequest) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => tournamentApi.create(data),
                'createTournament'
            );
            
            // Clear cache and refresh tournaments list
            apiService.clearCache(['fetchTournaments']);
            await get().fetchTournaments(true);
            
            set({ isLoading: false });
            showToast('Tournament created successfully!', 'success');
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

    updateTournament: async (id: number, data: UpdateTournamentRequest) => {
        console.log('Store updateTournament called with:', { id, data });
        set({ isLoading: true, error: null });
        
        try {
            console.log('Calling tournamentApi.update...');
            const result = await apiService.execute(
                () => tournamentApi.update(id, data),
                `updateTournament_${id}`
            );
            console.log('API update result:', result);
            
            // Fetch the latest data to ensure proper typing
            console.log('Fetching updated tournament data...');
            const updatedTournament = await apiService.execute(
                () => tournamentApi.getById(id),
                `fetchTournament_${id}`,
                { forceRefresh: true }
            );
            console.log('Updated tournament data:', updatedTournament);
            
            // Clear relevant cache entries
            apiService.clearCache([`fetchTournament_${id}`, 'fetchTournaments']);
            
            // Update state with the correctly typed data from the API
            set(state => ({
                // Update the tournaments list with the correctly typed tournament
                tournaments: state.tournaments.map(tournament => tournament.id === id ? updatedTournament : tournament),
                // Update currentTournament if it's the one being edited
                currentTournament: state.currentTournament?.id === id ? updatedTournament : state.currentTournament,
                isLoading: false
            }));
            
            showToast('Tournament updated successfully!', 'success');
            console.log('Tournament update completed successfully');
            return true;
        } 
        catch (error: any) {
            console.error('Error in updateTournament:', error);
            const errorMessage = ErrorHandler.handle(error);
            set({ 
                error: errorMessage.message, 
                isLoading: false 
            });
            return false;
        }
    },

    deleteTournament: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => tournamentApi.delete(id),
                `deleteTournament_${id}`
            );

            // Clear relevant cache entries
            apiService.clearCache([`fetchTournament_${id}`, 'fetchTournaments']);

            // Remove from current list without reloading
            set(state => ({
                tournaments: state.tournaments.filter(tournament => tournament.id !== id),
                currentTournament: state.currentTournament?.id === id ? null : state.currentTournament,
                isLoading: false
            }));
            
            showToast('Tournament deleted successfully!', 'success');
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
