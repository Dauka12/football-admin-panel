// Match status enum
export type MatchStatus = 'PENDING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

// Event type enum - updated to match API values
export type EventType = 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SECOND_YELLOW' | 
                        'PENALTY_GOAL' | 'MISSED_PENALTY' | 'OWN_GOAL';

// Match participant interface
export interface MatchParticipant {
    id: number;
    match: string;
    team: {
        id: number;
        name: string;
        primaryColor: string;
        secondaryColor: string;
        description: string;
        players: Array<any>; // Simplified for brevity
        tournaments?: Array<any>; // Simplified for brevity
    };
    player?: {
        id: number;
        position: string;
        club: string;
        user?: {
            firstname: string;
            lastname: string;
            email?: string;
            id: number;
        };
        // Other player properties simplified
    };
    score: number;
    
    // Additional fields for flexibility with API responses
    teamId?: number;
    teamName?: string;
    playerId?: number;
    playerFullName?: string;
}

// Match event interface
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

// Match interfaces for API responses
export interface MatchFullResponse {
    id: number;
    matchDate: string | number;  // Accept both ISO date strings and Unix timestamps
    deleted: boolean;
    participants: MatchParticipant[];
    status: MatchStatus;
    tournament: {
        id: number;
        name: string;
        startDate: string | number;  // Also accept timestamps here
        endDate: string | number;    // Also accept timestamps here
        description: string;
        active: boolean;
        teams: string[];
        matches: string[];
    };
    events: MatchEvent[];
}

// Simplified match response for listings
export interface MatchListResponse {
    id: number;
    matchDate: string | number;  // Accept both ISO date strings and Unix timestamps
    tournament: {
        id: number;
        name: string;
        startDate: string;
        endDate: string;
    };
    participants: {
        teamId: number;
        teamName: string;
        playerId?: number;
        playerFullName?: string;
        score: number;
    }[];
    status: string;
}

// Request interfaces
export interface CreateMatchRequest {
    tournamentId: number;
    matchDate: string | number;
    teams: number[];
}

export interface UpdateMatchRequest {
    tournamentId: number;
    matchDate: string | number;
    teams: number[];
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
