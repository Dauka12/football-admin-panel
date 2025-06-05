import { create } from 'zustand';
import { matchApi } from '../api/matches';
import type {
    CreateMatchRequest,
    MatchEvent,
    MatchFullResponse,
    MatchListResponse,
    UpdateMatchRequest
} from '../types/matches';
import { ErrorHandler } from '../utils/errorHandler';

interface MatchStore {
    // State
    matches: MatchListResponse[];
    currentMatch: MatchFullResponse | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchMatches: (forceRefresh?: boolean) => Promise<boolean>;
    fetchMatchById: (id: number) => Promise<boolean>;
    createMatch: (data: CreateMatchRequest) => Promise<number | null>;
    updateMatch: (id: number, data: UpdateMatchRequest) => Promise<boolean>;
    deleteMatch: (id: number) => Promise<boolean>;

    // Match Events
    addMatchEvent: (matchId: number, eventData: Omit<MatchEvent, 'id'>) => Promise<boolean>;
    deleteMatchEvent: (matchId: number, eventId: number) => Promise<boolean>;

    // Match Status
    updateMatchStatus: (matchId: number, status: string) => Promise<boolean>;

    // Match Score
    updateParticipantScore: (matchId: number, participantId: number, score: number) => Promise<boolean>;

    // Util
    clearError: () => void;
}

export const useMatchStore = create<MatchStore>((set, get) => ({
    // Default state
    matches: [],
    currentMatch: null,
    isLoading: false,
    error: null,

    // Fetch all matches
    fetchMatches: async (forceRefresh = false) => {
        // Return cached data if available and not forcing refresh
        if (get().matches.length > 0 && !forceRefresh) {
            return true;
        }

        set({ isLoading: true, error: null });
        try {
            const matches = await matchApi.getAll();
            // Ensure matches is always an array
            set({ matches: Array.isArray(matches) ? matches : [], isLoading: false });
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            // Maintain the array structure even when there's an error
            set({ matches: [], error: errorMessage.message, isLoading: false });
            return false;
        }
    },

    // Fetch match by ID
    fetchMatchById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const match = await matchApi.getById(id);
            set({ currentMatch: match, isLoading: false });
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ error: errorMessage.message, isLoading: false });
            return false;
        }
    },

    // Create match
    createMatch: async (data: CreateMatchRequest) => {
        set({ isLoading: true, error: null });
        try {
            const result = await matchApi.create(data);
            set({ isLoading: false });

            // Force refresh the match list
            get().fetchMatches(true);

            return result.id;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ error: errorMessage.message, isLoading: false });
            return null;
        }
    },

    // Update match
    updateMatch: async (id: number, data: UpdateMatchRequest) => {
        set({ isLoading: true, error: null });
        try {
            await matchApi.update(id, data);

            // If we have the current match loaded and it's the one being updated, refresh it
            if (get().currentMatch?.id === id) {
                const updatedMatch = await matchApi.getById(id);
                set({ currentMatch: updatedMatch });
            }

            // Force refresh the match list
            await get().fetchMatches(true);

            set({ isLoading: false });
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ error: errorMessage.message, isLoading: false });
            return false;
        }
    },

    // Delete match
    deleteMatch: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await matchApi.delete(id);

            // Update local state after successful delete
            set(state => ({
                matches: state.matches.filter(match => match.id !== id),
                isLoading: false
            }));

            // If the deleted match is the current one, clear it
            if (get().currentMatch?.id === id) {
                set({ currentMatch: null });
            }

            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ error: errorMessage.message, isLoading: false });
            return false;
        }
    },

    // Add match event
    addMatchEvent: async (matchId: number, eventData: Omit<MatchEvent, 'id'>) => {
        set({ isLoading: true, error: null });
        try {
            await matchApi.addEvent(matchId, eventData);

            // Refresh match data to get the updated events
            if (get().currentMatch?.id === matchId) {
                await get().fetchMatchById(matchId);
            }

            set({ isLoading: false });
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ error: errorMessage.message, isLoading: false });
            return false;
        }
    },

    // Delete match event
    deleteMatchEvent: async (matchId: number, eventId: number) => {
        set({ isLoading: true, error: null });
        try {
            await matchApi.deleteEvent(matchId, eventId);

            // Update local state if we have the current match loaded
            if (get().currentMatch?.id === matchId) {
                set(state => ({
                    currentMatch: state.currentMatch
                        ? {
                            ...state.currentMatch,
                            events: state.currentMatch.events.filter(e => e.id !== eventId)
                        }
                        : null
                }));
            }

            set({ isLoading: false });
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ error: errorMessage.message, isLoading: false });
            return false;
        }
    },

    // Update match status
    updateMatchStatus: async (matchId: number, status: string) => {
        set({ isLoading: true, error: null });
        try {
            await matchApi.updateStatus(matchId, status);

            // Update local state if we have the current match loaded
            if (get().currentMatch?.id === matchId) {
                set(state => ({
                    currentMatch: state.currentMatch
                        ? { ...state.currentMatch, status: status as any }
                        : null
                }));
            }

            // Update in match list
            set(state => ({
                matches: state.matches.map(match =>
                    match.id === matchId
                        ? { ...match, status }
                        : match
                )
            }));

            set({ isLoading: false });
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ error: errorMessage.message, isLoading: false });
            return false;
        }
    },

    // Update participant score
    updateParticipantScore: async (matchId: number, participantId: number, score: number) => {
        set({ isLoading: true, error: null });
        try {
            await matchApi.updateScore(matchId, participantId, score);

            // Update local state if we have the current match loaded
            if (get().currentMatch?.id === matchId) {
                set(state => ({
                    currentMatch: state.currentMatch
                        ? {
                            ...state.currentMatch,
                            participants: state.currentMatch.participants.map(p =>
                                p.id === participantId ? { ...p, score } : p
                            )
                        }
                        : null
                }));
            }

            set({ isLoading: false });
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ error: errorMessage.message, isLoading: false });
            return false;
        }
    },

    // Clear error
    clearError: () => set({ error: null })
}));
