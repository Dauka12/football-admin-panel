import { create } from 'zustand';
import { playerApi } from '../api/players';
import type {
    PlayerCreateRequest,
    PlayerPublicResponse,
    PlayerUpdateRequest
} from '../types/players';
import { apiService } from '../utils/apiService';
import { ErrorHandler } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

interface PlayerState {
    players: PlayerPublicResponse[];
    currentPlayer: PlayerPublicResponse | null;
    isLoading: boolean;
    error: string | null;

    fetchPlayers: (forceRefresh?: boolean) => Promise<void>;
    fetchPlayer: (id: number) => Promise<PlayerPublicResponse | null>;
    fetchPlayersByIds: (ids: number[]) => Promise<PlayerPublicResponse[]>;
    createPlayer: (data: PlayerCreateRequest) => Promise<boolean>;
    updatePlayer: (id: number, data: PlayerUpdateRequest) => Promise<boolean>;
    deletePlayer: (id: number) => Promise<boolean>;
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
    players: [],
    currentPlayer: null,
    isLoading: false,
    error: null,

    fetchPlayers: async (forceRefresh = false) => {
        // Check if we already have players loaded and avoid redundant requests
        const { players } = get();
        if (players.length > 0 && !forceRefresh) return;

        set({ isLoading: true, error: null });

        try {
            const players = await apiService.execute(
                () => playerApi.getAll(),
                'fetchPlayers',
                { enableCache: true, cacheTTL: 5 * 60 * 1000 } // Cache for 5 minutes
            );
            set({ players, isLoading: false });
        }
        catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
        }
    },

    fetchPlayer: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
            const player = await apiService.execute(
                () => playerApi.getById(id),
                `fetchPlayer_${id}`,
                { enableCache: true, cacheTTL: 2 * 60 * 1000 } // Cache for 2 minutes
            );
            set({ currentPlayer: player, isLoading: false });
            return player;
        }
        catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return null;
        }
    },

    fetchPlayersByIds: async (ids: number[]) => {
        if (!ids || ids.length === 0) return [];

        try {
            // First check if we already have these players in our store
            const { players } = get();
            const cachedPlayers = players.filter(p => ids.includes(p.id));

            // If we have all the players we need, return them
            if (cachedPlayers.length === ids.length) {
                return cachedPlayers;
            }

            // Otherwise, fetch the missing players
            const missingIds = ids.filter(id => !players.some(p => p.id === id));

            if (missingIds.length > 0) {
                // Fetch missing players with caching
                const fetchedPlayers = await Promise.all(
                    missingIds.map(id => 
                        apiService.execute(
                            () => playerApi.getById(id),
                            `fetchPlayer_${id}`,
                            { enableCache: true, cacheTTL: 2 * 60 * 1000 }
                        )
                    )
                );

                // Only update store once with all new players
                if (fetchedPlayers.length > 0) {
                    set(state => ({
                        players: [...state.players.filter(p => !missingIds.includes(p.id)), ...fetchedPlayers]
                    }));
                }

                // Return all requested players (both cached and newly fetched)
                return [...cachedPlayers, ...fetchedPlayers];
            }

            return cachedPlayers;
        } catch (error) {
            console.error("Error fetching players by IDs:", error);
            ErrorHandler.handle(error);
            return [];
        }
    },

    createPlayer: async (data: PlayerCreateRequest) => {
        set({ isLoading: true, error: null });

        try {
            const response = await apiService.execute(
                () => playerApi.create(data),
                'createPlayer'
            );

            // Clear cache and immediately fetch all players to refresh the list
            apiService.clearCache(['fetchPlayers']);
            const freshPlayers = await apiService.execute(
                () => playerApi.getAll(),
                'fetchPlayers',
                { forceRefresh: true }
            );

            // Update the store with the new list of players
            set({
                players: freshPlayers,
                isLoading: false,
                // Also set the newly created player as the current player
                currentPlayer: freshPlayers.find(p => p.id === response.id) || null
            });

            showToast('Player created successfully!', 'success');
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

    updatePlayer: async (id: number, data: PlayerUpdateRequest) => {
        set({ isLoading: true, error: null });

        try {
            await apiService.execute(
                () => playerApi.update(id, data),
                `updatePlayer_${id}`
            );

            // Clear relevant cache entries
            apiService.clearCache([`fetchPlayer_${id}`, 'fetchPlayers']);

            // Refresh current player and player list
            if (get().currentPlayer?.id === id) {
                await get().fetchPlayer(id);
            }
            await get().fetchPlayers(true);

            set({ isLoading: false });
            showToast('Player updated successfully!', 'success');
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

    deletePlayer: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
            await apiService.execute(
                () => playerApi.delete(id),
                `deletePlayer_${id}`
            );

            // Clear relevant cache entries
            apiService.clearCache([`fetchPlayer_${id}`, 'fetchPlayers']);

            // Remove from current list without reloading
            set({
                players: get().players.filter(player => player.id !== id),
                currentPlayer: get().currentPlayer?.id === id ? null : get().currentPlayer,
                isLoading: false
            });
            
            showToast('Player deleted successfully!', 'success');
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
    }
}));
