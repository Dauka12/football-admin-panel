// Match status enum - matches API specification
export type MatchStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const MatchStatus = {
    PENDING: 'PENDING' as MatchStatus,
    IN_PROGRESS: 'IN_PROGRESS' as MatchStatus,
    COMPLETED: 'COMPLETED' as MatchStatus,
    CANCELLED: 'CANCELLED' as MatchStatus
} as const;

// Participant status enum
export type ParticipantStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED';

// Tournament info for match responses - updated to match Swagger
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

// Playground info for match reservation
export interface MatchPlayground {
    id: number;
    name: string;
    cityId: number;
    description: string;
    maxCapacity: number;
    currentCapacity: number;
    pricePerHour: number;
    availableFrom: string;
    availableTo: string;
    active: boolean;
    images: string[];
}

// Reservation info for match
export interface MatchReservation {
    id: number;
    playground: MatchPlayground;
    startTime: string;
    endTime: string;
    userId: number;
    status: string;
}

// Match participant interface - aligned with Swagger response
export interface MatchParticipant {
    id: number;
    teamId: number;
    teamName: string;
    playerId: number;
    playerFullName: string;
    score: number;
    userId: number;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    status: ParticipantStatus;
    hasPaid: boolean;
    amountPaid: number;
    joinedAt: string;
}

// Match response interface - aligned with Swagger specification
export interface MatchFullResponse {
    id: number;
    startTime: string;
    endTime: string;
    tournament: MatchTournament;
    participants: MatchParticipant[];
    status: string;
    reservation: MatchReservation;
    organizerUserId: number;
    description: string;
    cityId: number;
    sportTypeId: number;
}

// Request interfaces - aligned with Swagger specification
export interface CreateMatchRequest {
    tournamentId?: number;
    teams: number[];
    cityId: number;
    status: string;
    playgroundId: number;
    startTime: string;
    
    endTime: string;
    maxCapacity: number;
    description: string;
    sportTypeId: number;
}

export interface UpdateMatchRequest {
    tournamentId?: number;
    teams: number[];
    cityId: number;
    status: string;
    playgroundId: number;
    startTime: string; // ISO 8601 format (e.g., "2025-07-02T10:18:49.251Z")
    endTime: string;   // ISO 8601 format (e.g., "2025-07-02T10:18:49.251Z")
    maxCapacity: number;
    description: string;
    sportTypeId: number;
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
    organizerUserId?: number;
    page?: number;
    size?: number;
}

// Filter for matches with reservations
export interface MatchWithReservationFilter {
    cityId?: number;
    organizerUserId?: number;
    status?: MatchStatus;
    dateFrom?: string;
    dateTo?: string;
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
