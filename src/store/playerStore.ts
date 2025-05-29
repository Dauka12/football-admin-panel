import { create } from 'zustand';
import { playerApi } from '../api/players';
import type {
    PlayerCreateRequest,
    PlayerPublicResponse,
    PlayerUpdateRequest
} from '../types/players';

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
            const players = await playerApi.getAll();
            set({ players, isLoading: false });
        }
        catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch players',
                isLoading: false
            });
        }
    },

    fetchPlayer: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
            const player = await playerApi.getById(id);
            set({ currentPlayer: player, isLoading: false });
            return player;
        }
        catch (error: any) {
            set({
                error: error.response?.data?.message || `Failed to fetch player #${id}`,
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
                // We can optimize this to fetch only once
                const fetchedPlayers = await Promise.all(
                    missingIds.map(id => playerApi.getById(id))
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
            return [];
        }
    },

    createPlayer: async (data: PlayerCreateRequest) => {
        set({ isLoading: true, error: null });

        try {
            const response = await playerApi.create(data);

            // Immediately fetch all players to refresh the list
            const freshPlayers = await playerApi.getAll();

            // Update the store with the new list of players
            set({
                players: freshPlayers,
                isLoading: false,
                // Also set the newly created player as the current player
                currentPlayer: freshPlayers.find(p => p.id === response.id) || null
            });

            return true;
        }
        catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create player',
                isLoading: false
            });
            return false;
        }
    },

    updatePlayer: async (id: number, data: PlayerUpdateRequest) => {
        set({ isLoading: true, error: null });

        try {
            await playerApi.update(id, data);

            // Refresh current player and player list
            if (get().currentPlayer?.id === id) {
                await get().fetchPlayer(id);
            }
            await get().fetchPlayers();

            set({ isLoading: false });
            return true;
        }
        catch (error: any) {
            set({
                error: error.response?.data?.message || `Failed to update player #${id}`,
                isLoading: false
            });
            return false;
        }
    },

    deletePlayer: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
            await playerApi.delete(id);

            // Remove from current list without reloading
            set({
                players: get().players.filter(player => player.id !== id),
                currentPlayer: get().currentPlayer?.id === id ? null : get().currentPlayer,
                isLoading: false
            });
            return true;
        }
        catch (error: any) {
            set({
                error: error.response?.data?.message || `Failed to delete player #${id}`,
                isLoading: false
            });
            return false;
        }
    }
}));
