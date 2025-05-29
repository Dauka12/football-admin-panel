import { create } from 'zustand';
import { tournamentApi } from '../api/tournaments';
import type {
    CreateTournamentRequest,
    TournamentFullResponse,
    UpdateTournamentRequest
} from '../types/tournaments';

interface TournamentState {
    tournaments: TournamentFullResponse[];
    currentTournament: TournamentFullResponse | null;
    isLoading: boolean;
    error: string | null;

    fetchTournaments: (forceRefresh?: boolean) => Promise<void>;
    fetchTournament: (id: number) => Promise<void>;
    createTournament: (data: CreateTournamentRequest) => Promise<boolean>;
    updateTournament: (id: number, data: UpdateTournamentRequest) => Promise<boolean>;
    deleteTournament: (id: number) => Promise<boolean>;
}

export const useTournamentStore = create<TournamentState>()((set, get) => ({
    tournaments: [],
    currentTournament: null,
    isLoading: false,
    error: null,

    fetchTournaments: async (forceRefresh = false) => {
        // Check if we already have tournaments loaded and avoid redundant requests
        const { tournaments } = get();
        if (tournaments && tournaments.length > 0 && !forceRefresh) return;

        set({ isLoading: true, error: null });

        try {
            const tournaments = await tournamentApi.getAll();
            console.log('Fetched tournaments:', tournaments); // Debug log
            
            set({ tournaments, isLoading: false });
        } catch (error: any) {
            console.error('Error fetching tournaments:', error); // Debug log
            set({
                tournaments: [], // Set empty array on error
                error: error.response?.data?.message || 'Failed to fetch tournaments',
                isLoading: false
            });
        }
    },

    fetchTournament: async (id: number) => {
        // Prevent redundant requests
        const { currentTournament } = get();
        if (currentTournament && currentTournament.id === id) return;

        set({ isLoading: true, error: null });
        try {
            const tournament = await tournamentApi.getById(id);
            set({ currentTournament: tournament, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || `Failed to fetch tournament #${id}`,
                isLoading: false
            });
        }
    },

    createTournament: async (data: CreateTournamentRequest) => {
        set({ isLoading: true, error: null });
        try {
            await tournamentApi.create(data);
            await get().fetchTournaments(true); // Refresh the tournaments list
            set({ isLoading: false });
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create tournament',
                isLoading: false
            });
            return false;
        }
    },

    updateTournament: async (id: number, data: UpdateTournamentRequest) => {
        set({ isLoading: true, error: null });
        
        try {
            await tournamentApi.update(id, data);
            
            // Fetch the latest data to ensure proper typing
            const updatedTournament = await tournamentApi.getById(id);
            
            // Update state with the correctly typed data from the API
            set(state => ({
                // Update the tournaments list with the correctly typed tournament
                tournaments: state.tournaments.map(tournament => tournament.id === id ? updatedTournament : tournament),
                // Update currentTournament if it's the one being edited
                currentTournament: state.currentTournament?.id === id ? updatedTournament : state.currentTournament,
                isLoading: false
            }));
            
            return true;
        } 
        catch (error: any) {
            set({ 
                error: error.response?.data?.message || `Failed to update tournament #${id}`, 
                isLoading: false 
            });
            return false;
        }
    },

    deleteTournament: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await tournamentApi.delete(id);

            // Remove from current list without reloading
            set(state => ({
                tournaments: state.tournaments.filter(tournament => tournament.id !== id),
                currentTournament: state.currentTournament?.id === id ? null : state.currentTournament,
                isLoading: false
            }));
            
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || `Failed to delete tournament #${id}`,
                isLoading: false
            });
            return false;
        }
    }
}));
