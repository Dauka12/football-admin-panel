// Match status enum
export type MatchStatus = 'PENDING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

// Event type enum
export type EventType = 'GOAL' | 'CARD' | 'SUBSTITUTION' | 'INJURY';

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
}

// Match event interface
export interface MatchEvent {
    id: number;
    match: string;
    player: {
        id: number;
        user?: {
            firstname: string;
            lastname: string;
            email?: string;
            id: number;
        };
        position?: string;
        club?: string;
        // Other player properties simplified
    };
    type: EventType;
    minute: number;
}

// Match interfaces for API responses
export interface MatchFullResponse {
    id: number;
    matchDate: string;
    deleted: boolean;
    participants: MatchParticipant[];
    status: MatchStatus;
    tournament: {
        id: number;
        name: string;
        startDate: string;
        endDate: string;
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
    matchDate: string;
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
    matchDate: string;
    teams: number[];
}

export interface UpdateMatchRequest {
    tournamentId: number;
    matchDate: string;
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
