import { create } from 'zustand';
import { playerApi } from '../api/players';
import type {
    PlayerPublicResponse,
    PlayerCreateRequest,
    PlayerUpdateRequest,
    PlayerFilterParams,
    PlayersPageResponse
} from '../types/players';
import { ErrorHandler } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

interface PlayerStore {
    // Data
    players: PlayerPublicResponse[];
    currentPlayer: PlayerPublicResponse | null;

    // UI State
    isLoading: boolean;
    error: string | null;

    // Pagination
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;

    // Filters
    filters: PlayerFilterParams;

    // Actions
    fetchPlayers: (force?: boolean, page?: number, size?: number, filters?: PlayerFilterParams) => Promise<void>;
    fetchPlayer: (id: number) => Promise<void>;
    fetchPlayersByIds: (ids: number[]) => Promise<PlayerPublicResponse[]>;
    createPlayer: (data: PlayerCreateRequest) => Promise<boolean>;
    updatePlayer: (id: number, data: PlayerUpdateRequest) => Promise<boolean>;
    deletePlayer: (id: number) => Promise<boolean>;
    setFilters: (filters: PlayerFilterParams) => void;
    clearError: () => void;
    setCurrentPlayer: (player: PlayerPublicResponse | null) => void;
    reset: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    // Initial data
    players: [] as PlayerPublicResponse[],
    currentPlayer: null,

    // Initial UI state
    isLoading: false,
    error: null,

    // Initial pagination
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,

    // Initial filters
    filters: {},

    // Fetch players
    fetchPlayers: async (force = false, page = 0, size = 10, filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await playerApi.getAll({ page, size, ...filters });
            set({
                players: response.content || [],
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0,
                currentPage: page,
                pageSize: response.size || size,
                isLoading: false
            });
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
        }
    },

    // Fetch single player
    fetchPlayer: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const player = await playerApi.getById(id);
            set({ currentPlayer: player, isLoading: false });
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
        }
    },

    fetchPlayersByIds: async (ids: number[]): Promise<PlayerPublicResponse[]> => {
        try {
            const players = await Promise.all(
                ids.map(id => playerApi.getById(id))
            );
            return players;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ error: errorMessage.message });
            return [];
        }
    },


    // Create player
    createPlayer: async (data: PlayerCreateRequest) => {
        set({ isLoading: true, error: null });
        try {
            await playerApi.create(data);
            showToast('Player created successfully!', 'success');
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    // Update player
    updatePlayer: async (id: number, data: PlayerUpdateRequest) => {
        set({ isLoading: true, error: null });
        try {
            await playerApi.update(id, data);
            showToast('Player updated successfully!', 'success');
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    // Delete player
    deletePlayer: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await playerApi.delete(id);
            set(state => ({
                players: state.players.filter(player => player.id !== id),
                currentPlayer: state.currentPlayer?.id === id ? null : state.currentPlayer,
                isLoading: false
            }));
            showToast('Player deleted successfully!', 'success');
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    // Set filters
    setFilters: (filters: PlayerFilterParams) => {
        set({ filters });
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Set current player
    setCurrentPlayer: (player: PlayerPublicResponse | null) => set({ currentPlayer: player }),

    // Reset store
    reset: () => {
        set({
            players: [],
            currentPlayer: null,
            isLoading: false,
            error: null,
            totalElements: 0,
            totalPages: 0,
            currentPage: 0,
            pageSize: 10,
            filters: {}
        });
    }
}));
