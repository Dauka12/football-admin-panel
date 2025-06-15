// Match status enum - matches API specification
export type MatchStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// Event type enum - updated to match API values
export type EventType = 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SECOND_YELLOW' | 
                        'PENALTY_GOAL' | 'MISSED_PENALTY' | 'OWN_GOAL';

// Tournament info for match responses
export interface MatchTournament {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    numberOfMatches: number;
    sportTypeId: number;
    categoryId: number;
    cityId: number;
    active?: boolean; // Add optional active field
}

// Match participant interface - aligned with API response
export interface MatchParticipant {
    teamId: number;
    teamName: string;
    playerId?: number;
    playerFullName?: string;
    score: number;
}

// Match event interface - matches API specification
export interface MatchEvent {
    id: number;
    matchId: number;
    playerId: number;
    playerName: string;
    type: EventType;
    minute: number;
}

// Match event request interface
export interface MatchEventRequest {
    matchId: number;
    playerId: number;
    type: EventType;
    minute: number;
}

// Match events response
export interface MatchEventsResponse {
    events: MatchEvent[];
}

// Match interfaces for API responses - aligned with API specification
export interface MatchFullResponse {
    id: number;
    matchDate: string;
    tournament: MatchTournament;
    participants: MatchParticipant[];
    status: MatchStatus; // Change from string to MatchStatus
    events?: MatchEvent[]; // Add optional events field
}

// Simplified match response for listings - same structure as full response
export interface MatchListResponse {
    id: number;
    matchDate: string;
    tournament: MatchTournament;
    participants: MatchParticipant[];
    status: MatchStatus; // Change from string to MatchStatus
}

// Request interfaces - aligned with API specification
export interface CreateMatchRequest {
    tournamentId: number;
    matchDate: string;
    teams: number[];
    cityId: number;
}

export interface UpdateMatchRequest {
    tournamentId: number;
    matchDate: string;
    teams: number[];
    cityId: number;
}

// Response for create/update
export interface MatchCreateResponse {
    id: number;
}

// Namespaces for consistent API
export namespace MatchRequest {
    export type Create = CreateMatchRequest;
    export type Update = UpdateMatchRequest;
}

export namespace MatchResponse {
    export type Full = MatchFullResponse;
    export type List = MatchListResponse;
    export type Create = MatchCreateResponse;
}

// Paginated response structure from API
export interface PageableOptions {
    pageNumber: number;
    pageSize: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

export interface PageResponse<T> {
    content: T[];
    pageable: PageableOptions;
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface MatchesPageResponse extends PageResponse<MatchListResponse> {}
