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
    addMatchEvent: (matchId: number, eventData: { playerId: number, type: string, minute: number }) => Promise<boolean>;
    deleteMatchEvent: (matchId: number, eventId: number) => Promise<boolean>;
    fetchMatchEvents: (matchId: number) => Promise<MatchEvent[]>;

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
            const response = await matchApi.getAll();
            console.log("API Response for matches:", response);
            console.log("Response type:", typeof response);
            console.log("Is array:", Array.isArray(response));
            
            // Handle different response formats
            let matches: any[] = [];
            
            if (Array.isArray(response)) {
                // Response is already an array
                matches = response;
            } else if (response && typeof response === 'object') {
                // Check if response has a content property (paginated response)
                if ('content' in response && Array.isArray(response.content)) {
                    matches = response.content;
                } else if ('matches' in response) {
                    // Check if response has a matches property
                    matches = Array.isArray(response.matches) ? response.matches : [];
                } else {
                    // If it's just a single match object, wrap it in an array
                    matches = [response];
                }
            }
            
            // Ensure matches is always an array and handle different data structures
            const processedMatches = Array.isArray(matches) ? matches.map(match => {
                // Process matchDate to ensure it's valid
                let normalizedMatchDate = match.matchDate;
                
                // If matchDate is a number (Unix timestamp), ensure it's handled correctly
                if (typeof normalizedMatchDate === 'number') {
                    // No need to convert here as we'll format properly when displaying
                    // Just ensure it's passed through properly
                } else if (typeof normalizedMatchDate === 'string') {
                    // Check if it's a pure numeric string (timestamp)
                    const maybeTimestamp = parseInt(normalizedMatchDate, 10);
                    if (!isNaN(maybeTimestamp) && normalizedMatchDate === maybeTimestamp.toString() && maybeTimestamp > 1000000000) {
                        // It's likely a Unix timestamp as a string (only if the string is purely numeric)
                        normalizedMatchDate = maybeTimestamp;
                    }
                    // Otherwise keep it as string - it's likely an ISO date string like "2025-06-08"
                }
                
                // Process participants with defensive coding
                // Define a type for the participant structure
                interface RawParticipant {
                    score?: number;
                    [key: string]: any;
                }

                interface ProcessedParticipant extends RawParticipant {
                    score: number;
                }

                const processedParticipants: ProcessedParticipant[] = Array.isArray(match.participants) ? 
                    match.participants.map((p: RawParticipant, index: number) => {
                        // Clone the participant and ensure score exists
                        const processedParticipant = { 
                            ...p, 
                            id: p.id || p.teamId || index, // Use existing id, teamId, or index as fallback
                            score: p.score !== undefined ? p.score : 0 
                        } as ProcessedParticipant;
                        
                        return processedParticipant;
                    }) : [];
                
                return {
                    ...match,
                    matchDate: normalizedMatchDate || new Date().getTime(),
                    participants: processedParticipants
                };
            }) : [];
            
            console.log("Processed matches:", processedMatches);
            console.log("Number of processed matches:", processedMatches.length);
            
            set({ matches: processedMatches, isLoading: false });
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            console.error("Error fetching matches:", error);
            // Maintain the array structure even when there's an error
            set({ matches: [], error: errorMessage.message, isLoading: false });
            return false;
        }
    },

    // Fetch match by ID
    fetchMatchById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const matchData = await matchApi.getById(id);
            console.log("Match data received:", matchData);
            
            // Fetch match events separately using the new API
            const matchEvents = await matchApi.getMatchEvents(id);
            console.log("Match events received:", matchEvents);
            
            // Normalize matchDate for different formats
            let normalizedMatchDate = matchData.matchDate;
            if (typeof normalizedMatchDate === 'string') {
                // Check if it's a pure numeric string (timestamp)
                const parsedDate = parseInt(normalizedMatchDate, 10);
                if (!isNaN(parsedDate) && normalizedMatchDate === parsedDate.toString() && parsedDate > 1000000000) {
                    // It's a pure numeric string - likely a timestamp (only if it's a reasonable timestamp value)
                    if (String(parsedDate).length === 10) {
                        normalizedMatchDate = parsedDate * 1000; // Convert seconds to milliseconds
                    } else {
                        normalizedMatchDate = parsedDate;
                    }
                }
                // Otherwise keep it as string - it's likely an ISO date string like "2025-06-08"
            }
            
            // Ensure response is properly formatted as a MatchFullResponse
            const processedMatch: MatchFullResponse = {
                id: matchData.id,
                matchDate: normalizedMatchDate,
                deleted: matchData.deleted || false,
                status: matchData.status || 'PENDING',
                participants: [],
                events: Array.isArray(matchEvents) ? matchEvents : [], // Use the events from the dedicated endpoint
                tournament: matchData.tournament ? {
                    id: matchData.tournament.id || 0,
                    name: matchData.tournament.name || 'Unknown',
                    startDate: matchData.tournament.startDate || '',
                    endDate: matchData.tournament.endDate || '',
                    description: matchData.tournament.description || '',
                    active: matchData.tournament.active || false,
                    teams: matchData.tournament.teams || [],
                    matches: matchData.tournament.matches || []
                } : null
            };
            
            // Process participants if they exist
            if (Array.isArray(matchData.participants)) {
                // Convert simplified participants to full MatchParticipant objects
                processedMatch.participants = matchData.participants.map((p, index) => {
                    // Create default participant structure
                    const participant: any = {
                        id: p.id || p.teamId || index, // Use existing id, teamId, or index as fallback
                        match: typeof p.match === 'string' ? p.match : String(matchData.id),
                        team: {
                            id: p.teamId || (p.team?.id) || 0,
                            name: p.teamName || (p.team?.name) || 'Unknown Team',
                            primaryColor: p.team?.primaryColor || '#000000',
                            secondaryColor: p.team?.secondaryColor || '#ffffff',
                            description: p.team?.description || '',
                            players: p.team?.players || []
                        },
                        score: typeof p.score !== 'undefined' ? p.score : 0,
                        // Add API response fields for compatibility
                        teamId: p.teamId,
                        teamName: p.teamName
                    };
                    
                    // Add player if available
                    if (p.playerId) {
                        participant.player = {
                            id: p.playerId,
                            position: p.player?.position || '',
                            club: p.player?.club || '',
                            user: p.player?.user || {
                                firstname: p.playerFullName?.split(' ')[0] || '',
                                lastname: p.playerFullName?.split(' ')[1] || '',
                                id: p.playerId
                            }
                        };
                    }
                    
                    return participant;
                });
            }
            
            console.log("Processed match:", processedMatch);
            set({ currentMatch: processedMatch, isLoading: false });
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            console.error("Error fetching match by ID:", error);
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
    addMatchEvent: async (matchId: number, eventData: { playerId: number, type: string, minute: number }) => {
        set({ isLoading: true, error: null });
        try {
            // Use the new API endpoint structure
            await matchApi.addEvent(matchId, eventData);

            // After adding event, fetch all events for the match using the new endpoint
            if (get().currentMatch?.id === matchId) {
                const events = await get().fetchMatchEvents(matchId);
                console.log("Fetched events after adding:", events);
                
                // Update current match with the new events
                set(state => ({
                    currentMatch: state.currentMatch
                        ? { ...state.currentMatch, events }
                        : null
                }));
            }

            set({ isLoading: false });
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            console.error("Error adding match event:", errorMessage.message);
            set({ error: errorMessage.message, isLoading: false });
            return false;
        }
    },

    // Delete match event
    deleteMatchEvent: async (matchId: number, eventId: number) => {
        set({ isLoading: true, error: null });
        try {
            // Delete event using the new API endpoint structure
            await matchApi.deleteEvent(matchId, eventId);

            console.log("Successfully deleted event ID:", eventId);

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
            console.error("Error deleting match event:", errorMessage.message);
            set({ error: errorMessage.message, isLoading: false });
            return false;
        }
    },
    
    // Fetch match events
    fetchMatchEvents: async (matchId: number) => {
        try {
            const events = await matchApi.getMatchEvents(matchId);
            return events;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            console.error("Error fetching match events:", errorMessage.message);
            return [];
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
