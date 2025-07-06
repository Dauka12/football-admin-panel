// Central API configuration for matches integration
import { matchApi } from './matches';
import { matchParticipantApi } from './matchParticipants';
import { matchEventsApi } from './matchEvents';
import matchesIntegrationApi from './matchesIntegration';

export { matchApi, matchParticipantApi, matchEventsApi, matchesIntegrationApi };

// Re-export all types for convenience
export type {
    // Match types
    MatchFullResponse,
    CreateMatchRequest,
    UpdateMatchRequest,
    MatchFilterParams,
    MatchWithReservationFilter,
    MatchesPageResponse,
    MatchSummary,
    MatchStatistics,
    MatchTournament,
    MatchParticipant as MatchParticipantInMatch,
    MatchReservation,
    MatchPlayground,
    MatchCreateResponse
} from '../types/matches';

export type {
    // Match Participant types
    MatchParticipant,
    OrganizedMatchParticipant,
    CreateMatchParticipantRequest,
    UpdateMatchParticipantRequest,
    MatchParticipantPaymentRequest,
    MatchParticipantStatusRequest,
    MatchParticipantResponse,
    ParticipationCheckResponse,
    MatchParticipantFilters
} from '../types/matchParticipants';

export type {
    // Match Event types
    MatchEvent,
    CreateMatchEventRequest
} from '../types/matchEvents';

// Re-export enums and types with aliases to avoid conflicts
export type { 
    MatchStatus as MatchStatusType
} from '../types/matches';

export type {
    MatchParticipantStatus as ParticipantStatusType
} from '../types/matchParticipants';

export type {
    MatchEventType as EventType
} from '../types/matchEvents';

// Constants
export { MatchStatus } from '../types/matches';
export { MatchParticipantStatus } from '../types/matchParticipants';
export { MATCH_EVENT_TYPES } from '../types/matchEvents';

// Helper functions with proper imports
import type { MatchStatus } from '../types/matches';
import type { MatchParticipantStatus } from '../types/matchParticipants';
import type { MatchEventType } from '../types/matchEvents';

export const isValidMatchStatus = (status: string): status is MatchStatus => {
    return ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status);
};

export const isValidParticipantStatus = (status: string): status is MatchParticipantStatus => {
    return ['CONFIRMED', 'WAITING_PAYMENT', 'CANCELLED'].includes(status);
};

export const isValidEventType = (type: string): type is MatchEventType => {
    return ['GOAL', 'YELLOW_CARD', 'RED_CARD', 'SECOND_YELLOW', 'PENALTY_GOAL', 'MISSED_PENALTY', 'OWN_GOAL'].includes(type);
};

// Default export for convenience
export default {
    matches: matchApi,
    participants: matchParticipantApi,
    events: matchEventsApi,
    integration: matchesIntegrationApi
};
