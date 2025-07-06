import { matchApi } from './matches';
import { matchParticipantApi } from './matchParticipants';
import { matchEventsApi } from './matchEvents';
import type { 
    MatchFullResponse, 
    CreateMatchRequest, 
    UpdateMatchRequest, 
    MatchStatus
} from '../types/matches';
import type { 
    MatchParticipant, 
    CreateMatchParticipantRequest,
    MatchParticipantStatus,
    OrganizedMatchParticipant 
} from '../types/matchParticipants';
import type { 
    MatchEvent,
    MatchEventType 
} from '../types/matchEvents';

/**
 * Integrated API for managing matches, participants, and events
 * This combines all three modules with their respective endpoints
 */
export const matchesIntegrationApi = {
    /**
     * MATCHES MODULE
     */
    matches: {
        // Public endpoints
        getAll: matchApi.getAll,
        getById: matchApi.getById,
        getWithReservations: matchApi.getMatchesWithReservations,
        
        // User actions
        join: matchApi.joinMatch,
        leave: matchApi.leaveMatch,
        
        // Admin endpoints
        create: matchApi.create,
        update: matchApi.update,
        delete: matchApi.delete,
        updateStatus: matchApi.updateStatus,
        
        // Utility methods
        getByStatus: matchApi.getMatchesByStatus,
        getByCity: matchApi.getMatchesByCity,
        getByTournament: matchApi.getMatchesByTournament,
        getByOrganizer: matchApi.getMatchesByOrganizer,
        getUpcoming: matchApi.getUpcomingMatches,
        getCompleted: matchApi.getCompletedMatches,
        getInProgress: matchApi.getMatchesInProgress,
        
        // Data processing utilities
        createSummary: matchApi.createMatchSummary,
        generateStatistics: matchApi.generateMatchStatistics,
        canUserJoin: matchApi.canUserJoinMatch,
        getCapacityInfo: matchApi.getMatchCapacityInfo
    },

    /**
     * MATCH PARTICIPANTS MODULE
     */
    participants: {
        // CRUD operations
        getById: matchParticipantApi.getById,
        create: matchParticipantApi.create,
        update: matchParticipantApi.update,
        delete: matchParticipantApi.delete,
        
        // Match-specific operations
        getByMatchId: matchParticipantApi.getByMatchId,
        getByMatchIdAdmin: matchParticipantApi.getByMatchIdAdmin,
        getByMatchIdAndStatus: matchParticipantApi.getByMatchIdAndStatus,
        
        // User operations
        getOrganizedMatches: matchParticipantApi.getOrganizedMatches,
        checkParticipation: matchParticipantApi.checkParticipation,
        
        // Payment and status operations
        processPayment: matchParticipantApi.processPayment,
        updateStatus: matchParticipantApi.updateStatus
    },

    /**
     * MATCH EVENTS MODULE
     */
    events: {
        // CRUD operations
        create: matchEventsApi.createMatchEvent,
        getById: matchEventsApi.getMatchEventById,
        getByMatchId: matchEventsApi.getMatchEventsByMatchId
    },

    /**
     * INTEGRATED OPERATIONS
     * These methods combine multiple modules for complex operations
     */
    
    /**
     * Get complete match data with participants and events
     */
    getCompleteMatch: async (matchId: number): Promise<{
        match: MatchFullResponse;
        participants: MatchParticipant[];
        events: MatchEvent[];
    }> => {
        try {
            const [match, participants, events] = await Promise.all([
                matchApi.getById(matchId),
                matchParticipantApi.getByMatchId(matchId),
                matchEventsApi.getMatchEventsByMatchId(matchId)
            ]);
            
            return { match, participants, events };
        } catch (error) {
            console.error('Failed to fetch complete match data:', error);
            throw error;
        }
    },

    /**
     * Create a match with initial participants
     */
    createMatchWithParticipants: async (
        matchData: CreateMatchRequest,
        participants: CreateMatchParticipantRequest[]
    ): Promise<{ matchId: number; participantIds: number[] }> => {
        try {
            // Create the match first
            const matchResponse = await matchApi.create(matchData);
            const matchId = matchResponse.id;
            
            // Create participants
            const participantPromises = participants.map(participant => 
                matchParticipantApi.create({
                    ...participant,
                    matchId
                })
            );
            
            const participantResponses = await Promise.all(participantPromises);
            const participantIds = participantResponses.map(response => response.id);
            
            return { matchId, participantIds };
        } catch (error) {
            console.error('Failed to create match with participants:', error);
            throw error;
        }
    },

    /**
     * Get match statistics including participant counts and event summaries
     */
    getMatchStatistics: async (matchId: number): Promise<{
        participantCount: number;
        participantsByStatus: Record<MatchParticipantStatus, number>;
        eventCount: number;
        eventsByType: Record<MatchEventType, number>;
        totalPaid: number;
        totalUnpaid: number;
    }> => {
        try {
            const [participants, events] = await Promise.all([
                matchParticipantApi.getByMatchId(matchId),
                matchEventsApi.getMatchEventsByMatchId(matchId)
            ]);
            
            // Calculate participant statistics
            const participantsByStatus = participants.reduce((acc, participant) => {
                acc[participant.status] = (acc[participant.status] || 0) + 1;
                return acc;
            }, {} as Record<MatchParticipantStatus, number>);
            
            // Calculate event statistics
            const eventsByType = events.reduce((acc, event) => {
                acc[event.type] = (acc[event.type] || 0) + 1;
                return acc;
            }, {} as Record<MatchEventType, number>);
            
            // Calculate payment statistics
            const totalPaid = participants
                .filter(p => p.hasPaid)
                .reduce((sum, p) => sum + p.amountPaid, 0);
            
            const totalUnpaid = participants
                .filter(p => !p.hasPaid)
                .reduce((sum, p) => sum + p.amountPaid, 0);
            
            return {
                participantCount: participants.length,
                participantsByStatus,
                eventCount: events.length,
                eventsByType,
                totalPaid,
                totalUnpaid
            };
        } catch (error) {
            console.error('Failed to fetch match statistics:', error);
            throw error;
        }
    },

    /**
     * Update match status and notify participants
     */
    updateMatchStatusWithNotification: async (
        matchId: number, 
        status: MatchStatus,
        notificationMessage?: string
    ): Promise<boolean> => {
        try {
            // Update match status
            await matchApi.updateStatus(matchId, status);
            
            // If notification message is provided, could implement notification logic here
            if (notificationMessage) {
                console.log(`Notification for match ${matchId}: ${notificationMessage}`);
                // TODO: Implement notification system
            }
            
            return true;
        } catch (error) {
            console.error('Failed to update match status:', error);
            throw error;
        }
    },

    /**
     * Get user's match history with participation details
     */
    getUserMatchHistory: async (_userId: number): Promise<{
        organizedMatches: OrganizedMatchParticipant[];
        participatedMatches: MatchParticipant[];
    }> => {
        try {
            const [organizedMatches] = await Promise.all([
                matchParticipantApi.getOrganizedMatches()
            ]);
            
            // For participated matches, we would need a specific endpoint
            // For now, we'll return organized matches only
            return {
                organizedMatches,
                participatedMatches: []
            };
        } catch (error) {
            console.error('Failed to fetch user match history:', error);
            throw error;
        }
    },

    /**
     * Validate match data before creation/update
     */
    validateMatchData: (data: CreateMatchRequest | UpdateMatchRequest): {
        isValid: boolean;
        errors: string[];
    } => {
        const errors: string[] = [];
        
        // Validate required fields for creation
        if ('startTime' in data && !data.startTime) {
            errors.push('Start time is required');
        }
        
        if ('endTime' in data && !data.endTime) {
            errors.push('End time is required');
        }
        
        if (!data.playgroundId) {
            errors.push('Playground is required');
        }
        
        if (!data.cityId) {
            errors.push('City is required');
        }
        
        if (!data.sportTypeId) {
            errors.push('Sport type is required');
        }
        
        if (!data.teams || data.teams.length === 0) {
            errors.push('At least one team is required');
        }
        
        if (data.teams && data.teams.length > 2) {
            errors.push('Maximum 2 teams allowed per match');
        }
        
        // Validate time logic
        if (data.startTime && data.endTime) {
            const startTime = new Date(data.startTime);
            const endTime = new Date(data.endTime);
            
            if (startTime >= endTime) {
                errors.push('End time must be after start time');
            }
        }
        
        // Validate capacity
        if (data.maxCapacity && data.maxCapacity <= 0) {
            errors.push('Max capacity must be greater than 0');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

export default matchesIntegrationApi;
