// Match status enum - matches API specification
export type MatchStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const MatchStatus = {
    PENDING: 'PENDING' as MatchStatus,
    IN_PROGRESS: 'IN_PROGRESS' as MatchStatus,
    COMPLETED: 'COMPLETED' as MatchStatus,
    CANCELLED: 'CANCELLED' as MatchStatus
} as const;

// Tournament info for match responses - updated to match backend
export interface MatchTournament {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    numberOfMatches: number;
    sportTypeId: number;
    categoryId: number;
    cityId: number;
}

// Match participant interface - aligned with API response
export interface MatchParticipant {
    teamId: number;
    teamName: string;
    playerId: number;
    playerFullName: string;
    score: number;
}

// Match response interface - aligned with API specification
export interface MatchFullResponse {
    id: number;
    matchDate: string;
    tournament: MatchTournament;
    participants: MatchParticipant[];
    status: string; // Backend returns string, not enum
}

// Request interfaces - aligned with API specification
export interface CreateMatchRequest {
    tournamentId?: number; // Optional when creating matches outside tournaments
    matchDate: string;
    teams: number[];
    cityId?: number; // Optional field
    status?: string; // Optional, defaults to PENDING
}

export interface UpdateMatchRequest {
    tournamentId?: number;
    matchDate: string;
    teams: number[];
    cityId?: number;
    status?: string;
}

// Response for create operations
export interface MatchCreateResponse {
    id: number;
}

// Filter parameters for match queries
export interface MatchFilterParams {
    date?: string;
    status?: MatchStatus;
    cityId?: number;
    tournamentId?: number;
    teamId?: number;
    page?: number;
    size?: number;
}

// Paginated response structure
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

export interface MatchesPageResponse extends PageResponse<MatchFullResponse> {}

// Namespaces for consistent API
export namespace MatchRequest {
    export type Create = CreateMatchRequest;
    export type Update = UpdateMatchRequest;
}

export namespace MatchResponse {
    export type Full = MatchFullResponse;
    export type Create = MatchCreateResponse;
}
