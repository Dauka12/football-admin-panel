import { create } from 'zustand';
import { playgroundApi } from '../api/playgrounds';
import type {
    CreatePlaygroundRequest,
    CreateReservationRequest,
    Playground,
    PlaygroundFilters,
    PlaygroundsResponse,
    ReservationFilters,
    ReservationsResponse,
    UpdatePlaygroundRequest
} from '../types/playgrounds';

interface PlaygroundState {
    // Playgrounds
    playgrounds: PlaygroundsResponse | null;
    currentPlayground: Playground | null;
    isLoading: boolean;
    error: string | null;

    // Reservations
    reservations: ReservationsResponse | null;
    isReservationsLoading: boolean;
    reservationsError: string | null;

    // Actions
    fetchPlaygrounds: (filters?: PlaygroundFilters) => Promise<void>;
    fetchPlayground: (id: number) => Promise<void>;
    createPlayground: (data: CreatePlaygroundRequest) => Promise<boolean>;
    updatePlayground: (id: number, data: UpdatePlaygroundRequest) => Promise<boolean>;
    deletePlayground: (id: number) => Promise<boolean>;

    // Reservation actions
    fetchReservations: (filters?: ReservationFilters) => Promise<void>;
    createReservation: (data: CreateReservationRequest) => Promise<boolean>;
    deleteReservation: (reservationId: number) => Promise<boolean>;

    // Utility actions
    clearCurrentPlayground: () => void;
    clearError: () => void;
}

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
    // Initial state
    playgrounds: null,
    currentPlayground: null,
    isLoading: false,
    error: null,
    reservations: null,
    isReservationsLoading: false,
    reservationsError: null,

    // Playground actions
    fetchPlaygrounds: async (filters) => {
        set({ isLoading: true, error: null });
        
        try {
            const response = await playgroundApi.getPlaygrounds(filters);
            set({ 
                playgrounds: response,
                isLoading: false,
                error: null
            });
        } catch (error) {
            console.error('Failed to fetch playgrounds:', error);
            set({ 
                isLoading: false,
                error: 'Failed to load playgrounds'
            });
        }
    },

    fetchPlayground: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
            const playground = await playgroundApi.getPlayground(id);
            set({ 
                currentPlayground: playground,
                isLoading: false,
                error: null
            });
        } catch (error) {
            console.error('Failed to fetch playground:', error);
            set({ 
                isLoading: false,
                error: 'Failed to load playground'
            });
        }
    },

    createPlayground: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
            await playgroundApi.createPlayground(data);
            set({ isLoading: false, error: null });
            
            // Refresh playgrounds list
            const { fetchPlaygrounds } = get();
            await fetchPlaygrounds();
            
            return true;
        } catch (error) {
            console.error('Failed to create playground:', error);
            set({ 
                isLoading: false,
                error: 'Failed to create playground'
            });
            return false;
        }
    },

    updatePlayground: async (id, data) => {
        set({ isLoading: true, error: null });
        
        try {
            await playgroundApi.updatePlayground(id, data);
            set({ isLoading: false, error: null });
            
            // Refresh current playground if it's the one being updated
            const { currentPlayground, fetchPlayground } = get();
            if (currentPlayground && currentPlayground.id === id) {
                await fetchPlayground(id);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to update playground:', error);
            set({ 
                isLoading: false,
                error: 'Failed to update playground'
            });
            return false;
        }
    },

    deletePlayground: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
            await playgroundApi.deletePlayground(id);
            set({ isLoading: false, error: null });
            
            // Refresh playgrounds list
            const { fetchPlaygrounds } = get();
            await fetchPlaygrounds();
            
            return true;
        } catch (error) {
            console.error('Failed to delete playground:', error);
            set({ 
                isLoading: false,
                error: 'Failed to delete playground'
            });
            return false;
        }
    },

    // Reservation actions
    fetchReservations: async (filters) => {
        set({ isReservationsLoading: true, reservationsError: null });
        
        try {
            const response = await playgroundApi.getReservations(filters);
            set({ 
                reservations: response,
                isReservationsLoading: false,
                reservationsError: null
            });
        } catch (error) {
            console.error('Failed to fetch reservations:', error);
            set({ 
                isReservationsLoading: false,
                reservationsError: 'Failed to load reservations'
            });
        }
    },

    createReservation: async (data) => {
        set({ isReservationsLoading: true, reservationsError: null });
        
        try {
            await playgroundApi.createReservation(data);
            set({ isReservationsLoading: false, reservationsError: null });
            
            // Refresh reservations list
            const { fetchReservations } = get();
            await fetchReservations();
            
            return true;
        } catch (error) {
            console.error('Failed to create reservation:', error);
            set({ 
                isReservationsLoading: false,
                reservationsError: 'Failed to create reservation'
            });
            return false;
        }
    },

    deleteReservation: async (reservationId) => {
        set({ isReservationsLoading: true, reservationsError: null });
        
        try {
            await playgroundApi.deleteReservation(reservationId);
            set({ isReservationsLoading: false, reservationsError: null });
            
            // Refresh reservations list
            const { fetchReservations } = get();
            await fetchReservations();
            
            return true;
        } catch (error) {
            console.error('Failed to delete reservation:', error);
            set({ 
                isReservationsLoading: false,
                reservationsError: 'Failed to delete reservation'
            });
            return false;
        }
    },

    // Utility actions
    clearCurrentPlayground: () => {
        set({ currentPlayground: null });
    },

    clearError: () => {
        set({ error: null, reservationsError: null });
    }
}));
