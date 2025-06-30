import { create } from 'zustand';
import { playerApi } from '../api/players';
import type {
    PlayerCreateRequest,
    PlayerFilterParams,
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
    
    // Pagination state
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    
    // Filter state
    filters: PlayerFilterParams;
    
    fetchPlayers: (forceRefresh?: boolean, page?: number, size?: number, filters?: PlayerFilterParams) => Promise<void>;
    setFilters: (filters: PlayerFilterParams) => void;
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
    
    // Pagination state
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    
    // Filter state
    filters: {},
    
    // Set filters method
    setFilters: (filters: PlayerFilterParams) => {
        set({ filters });
    },

    fetchPlayers: async (forceRefresh = false, page = 0, size = 10, filters?: PlayerFilterParams) => {
        // Check if we already have players loaded for the same page and avoid redundant requests
        const { players, currentPage, pageSize, filters: currentFilters } = get();
        
        // Use provided filters or fall back to current filters in state
        const filtersToApply = filters || currentFilters;
        
        // If not forcing refresh, we only want to avoid a request if:
        // 1. We have players
        // 2. We're on the same page
        // 3. We're using the same page size
        // 4. We're using the same filters (deep comparison)
        if (
            players.length > 0 && 
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
                () => playerApi.getAll({ page, size, ...filtersToApply }),
                'fetchPlayers',
                { enableCache: false } // Disable cache to ensure fresh data
            );
            
            // Ensure response contains content array
            if (response && response.content && Array.isArray(response.content)) {
                set({ 
                    players: response.content, 
                    totalElements: response.totalElements,
                    totalPages: response.totalPages,
                    currentPage: response.number,
                    pageSize: response.size,
                    filters: filtersToApply, // Store the filters that were used
                    isLoading: false,
                    error: null
                });
            } else {
                console.error('Unexpected API response format:', response);
                // Fallback if response structure is unexpected
                set({ 
                    players: [],
                    totalElements: 0,
                    totalPages: 0,
                    currentPage: 0,
                    pageSize: size,
                    isLoading: false,
                    error: 'Unexpected API response format'
                });
            }
        }
        catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                players: [],
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
            const { filters, currentPage, pageSize } = get();
            const paginatedResponse = await apiService.execute(
                () => playerApi.getAll({ page: currentPage, size: pageSize, ...filters }),
                'fetchPlayers',
                { forceRefresh: true }
            );

            // Handle paginated response structure
            if (paginatedResponse && paginatedResponse.content && Array.isArray(paginatedResponse.content)) {
                const freshPlayers = paginatedResponse.content;
                
                // Update the store with the new list of players
                set({
                    players: freshPlayers,
                    totalElements: paginatedResponse.totalElements,
                    totalPages: paginatedResponse.totalPages,
                    currentPage: paginatedResponse.number,
                    pageSize: paginatedResponse.size,
                    isLoading: false,
                    // Also set the newly created player as the current player
                    currentPlayer: freshPlayers.find(p => p.id === response.id) || null
                });
            } else {
                // Fallback if response structure is unexpected
                set({
                    isLoading: false,
                    error: 'Unexpected API response format'
                });
            }

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
            
            // Fetch with current filters and pagination
            const { filters, currentPage, pageSize } = get();
            await get().fetchPlayers(true, currentPage, pageSize, filters);

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
