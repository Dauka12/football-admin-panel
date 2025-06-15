import { create } from 'zustand';
import type { MatchFilterParams } from '../api/matches';
import { matchApi } from '../api/matches';
import type {
    CreateMatchRequest,
    MatchEvent,
    MatchFullResponse,
    MatchListResponse,
    MatchStatus,
    UpdateMatchRequest
} from '../types/matches';
import { apiService } from '../utils/apiService';
import { ErrorHandler } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

interface MatchStore {
    // State
    matches: MatchListResponse[];
    currentMatch: MatchFullResponse | null;
    currentMatchEvents: MatchEvent[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    isLoading: boolean;
    error: string | null;
    
    // Filter state
    filters: MatchFilterParams;

    // Actions
    fetchMatches: (filters?: MatchFilterParams, forceRefresh?: boolean) => Promise<void>;
    fetchMatchById: (id: number) => Promise<void>;
    createMatch: (data: CreateMatchRequest) => Promise<boolean>;
    updateMatch: (id: number, data: UpdateMatchRequest) => Promise<boolean>;
    deleteMatch: (id: number) => Promise<boolean>;

    // Match Events
    fetchMatchEvents: (matchId: number) => Promise<void>;
    createMatchEvent: (eventData: { matchId: number, playerId: number, type: string, minute: number }) => Promise<boolean>;
    addMatchEvent: (matchId: number, eventData: { playerId: number, type: string, minute: number }) => Promise<boolean>;
    deleteMatchEvent: (matchId: number, eventId: number) => Promise<boolean>;
    getEventById: (id: number) => Promise<MatchEvent | null>;

    // Match Status & Score (if supported by backend)
    updateMatchStatus: (matchId: number, status: MatchStatus) => Promise<boolean>;
    updateParticipantScore: (matchId: number, participantId: number, score: number) => Promise<boolean>;

    // Filter actions
    setFilters: (filters: Partial<MatchFilterParams>) => void;
    clearFilters: () => void;

    // Util
    clearError: () => void;
    clearCurrentMatch: () => void;
}

export const useMatchStore = create<MatchStore>((set, get) => ({
    // Default state
    matches: [],
    currentMatch: null,
    currentMatchEvents: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    isLoading: false,
    error: null,
    filters: {
        page: 0,
        size: 10
    },

    // Fetch all matches with filtering and pagination
    fetchMatches: async (filters?: MatchFilterParams, forceRefresh = false) => {
        set({ isLoading: true, error: null });
        
        try {
            const searchFilters = { ...get().filters, ...filters };
            
            const response = await apiService.execute(
                () => matchApi.getAll(searchFilters),
                'fetchMatches',
                { enableCache: !forceRefresh, cacheTTL: 2 * 60 * 1000 }
            );
            
            set({
                matches: response.content || [],
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0,
                currentPage: response.number || 0,
                pageSize: response.size || 10,
                filters: searchFilters,
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

    // Fetch match by ID
    fetchMatchById: async (id: number) => {
        set({ isLoading: true, error: null });
        
        try {
            const match = await apiService.execute(
                () => matchApi.getById(id),
                `fetchMatch_${id}`,
                { enableCache: true, cacheTTL: 2 * 60 * 1000 }
            );
            
            set({ currentMatch: match, isLoading: false });
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
        }
    },

    // Create match
    createMatch: async (data: CreateMatchRequest) => {
        set({ isLoading: true, error: null });
        
        try {
            await apiService.execute(
                () => matchApi.create(data),
                'createMatch'
            );
            
            // Clear cache and refresh matches
            apiService.clearCache(['fetchMatches']);
            await get().fetchMatches(undefined, true);
            
            set({ isLoading: false });
            showToast('Match created successfully!', 'success');
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

    // Update match
    updateMatch: async (id: number, data: UpdateMatchRequest) => {
        set({ isLoading: true, error: null });
        
        try {
            await apiService.execute(
                () => matchApi.update(id, data),
                'updateMatch'
            );
            
            // Clear cache and refresh
            apiService.clearCache(['fetchMatches', `fetchMatch_${id}`]);
            await get().fetchMatches(undefined, true);
            
            // Update current match if it's the one being edited
            if (get().currentMatch?.id === id) {
                await get().fetchMatchById(id);
            }
            
            set({ isLoading: false });
            showToast('Match updated successfully!', 'success');
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

    // Delete match
    deleteMatch: async (id: number) => {
        set({ isLoading: true, error: null });
        
        try {
            await apiService.execute(
                () => matchApi.delete(id),
                'deleteMatch'
            );
            
            // Clear cache and refresh
            apiService.clearCache(['fetchMatches', `fetchMatch_${id}`]);
            await get().fetchMatches(undefined, true);
            
            // Clear current match if it's the one being deleted
            if (get().currentMatch?.id === id) {
                set({ currentMatch: null });
            }
            
            set({ isLoading: false });
            showToast('Match deleted successfully!', 'success');
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

    // Fetch match events
    fetchMatchEvents: async (matchId: number) => {
        try {
            const response = await apiService.execute(
                () => matchApi.getMatchEvents(matchId),
                `fetchMatchEvents_${matchId}`,
                { enableCache: true, cacheTTL: 1 * 60 * 1000 }
            );
            
            set({ currentMatchEvents: response.events || [] });
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            console.error('Failed to fetch match events:', errorMessage.message);
            set({ currentMatchEvents: [] });
        }
    },

    // Create match event
    createMatchEvent: async (eventData: { matchId: number, playerId: number, type: string, minute: number }) => {
        try {
            await apiService.execute(
                () => matchApi.createEvent({
                    matchId: eventData.matchId,
                    playerId: eventData.playerId,
                    type: eventData.type as any,
                    minute: eventData.minute
                }),
                'createMatchEvent'
            );
            
            // Refresh events for this match
            await get().fetchMatchEvents(eventData.matchId);
            
            showToast('Match event added successfully!', 'success');
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            showToast(errorMessage.message, 'error');
            return false;
        }
    },

    // Get event by ID
    getEventById: async (id: number) => {
        try {
            const event = await apiService.execute(
                () => matchApi.getEventById(id),
                `fetchEvent_${id}`,
                { enableCache: true, cacheTTL: 5 * 60 * 1000 }
            );
            return event;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            console.error('Failed to fetch event:', errorMessage.message);
            return null;
        }
    },

    // Add match event (alias for createMatchEvent with different signature)
    addMatchEvent: async (matchId: number, eventData: { playerId: number, type: string, minute: number }) => {
        return await get().createMatchEvent({
            matchId,
            playerId: eventData.playerId,
            type: eventData.type,
            minute: eventData.minute
        });
    },

    // Delete match event
    deleteMatchEvent: async (matchId: number, eventId: number) => {
        try {
            // Note: This would need a delete endpoint in the API
            // For now, we'll simulate it by refreshing the events
            console.warn(`Delete match event ${eventId} for match ${matchId} not implemented in API yet`);
            showToast('Delete event not yet implemented', 'warning');
            return false;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            showToast(errorMessage.message, 'error');
            return false;
        }
    },

    // Update match status (if supported)
    updateMatchStatus: async (matchId: number, status: MatchStatus) => {
        try {
            await apiService.execute(
                () => matchApi.updateStatus(matchId, status),
                'updateMatchStatus'
            );
            
            // Update current match status if loaded
            if (get().currentMatch?.id === matchId) {
                set(state => ({
                    currentMatch: state.currentMatch ? {
                        ...state.currentMatch,
                        status: status
                    } : null
                }));
            }
            
            showToast('Match status updated successfully!', 'success');
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            showToast(errorMessage.message, 'error');
            return false;
        }
    },

    // Update participant score (if supported)
    updateParticipantScore: async (matchId: number, participantId: number, score: number) => {
        try {
            await apiService.execute(
                () => matchApi.updateScore(matchId, participantId, score),
                'updateScore'
            );
            
            // Update current match participant score if loaded
            if (get().currentMatch?.id === matchId) {
                set(state => ({
                    currentMatch: state.currentMatch ? {
                        ...state.currentMatch,
                        participants: state.currentMatch.participants.map(p =>
                            p.teamId === participantId ? { ...p, score } : p
                        )
                    } : null
                }));
            }
            
            showToast('Score updated successfully!', 'success');
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            showToast(errorMessage.message, 'error');
            return false;
        }
    },

    // Filter actions
    setFilters: (filters: Partial<MatchFilterParams>) => {
        const newFilters = { ...get().filters, ...filters };
        set({ filters: newFilters });
    },

    clearFilters: () => {
        set({ 
            filters: { page: 0, size: 10 }
        });
    },

    // Utility actions
    clearError: () => set({ error: null }),
    
    clearCurrentMatch: () => set({ currentMatch: null, currentMatchEvents: [] })
}));
