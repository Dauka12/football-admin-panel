// Match status enum - matches Swagger API specification exactly
export type MatchStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const MatchStatus = {
    PENDING: 'PENDING' as MatchStatus,
    IN_PROGRESS: 'IN_PROGRESS' as MatchStatus,
    COMPLETED: 'COMPLETED' as MatchStatus,
    CANCELLED: 'CANCELLED' as MatchStatus
} as const;

// Participant status enum - matches MatchParticipantStatus for consistency
export type ParticipantStatus = 'CONFIRMED' | 'WAITING_PAYMENT' | 'CANCELLED';

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

// Facility info for playground
export interface PlaygroundFacility {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: string;
    active: boolean;
}

export interface PlaygroundFacilityItem {
    id: number;
    facility: PlaygroundFacility;
    quantity: number;
    notes: string;
}

// Playground info for match reservation - updated to match Swagger
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
    address: string;
    latitude: number;
    longitude: number;
    facilities: PlaygroundFacilityItem[];
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
    teams?: number[];
    cityId?: number;
    status?: string;
    playgroundId?: number;
    startTime?: string; // ISO 8601 format (e.g., "2025-07-02T10:18:49.251Z") - optional for status updates
    endTime?: string;   // ISO 8601 format (e.g., "2025-07-02T10:18:49.251Z") - optional for status updates
    maxCapacity?: number;
    description?: string;
    sportTypeId?: number;
}

// Specialized type for status-only updates
export interface UpdateMatchStatusRequest {
    status: MatchStatus;
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

// Additional utility types for better development experience
export interface MatchStatistics {
    totalMatches: number;
    pendingMatches: number;
    inProgressMatches: number;
    completedMatches: number;
    cancelledMatches: number;
}

export interface MatchSummary {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    status: MatchStatus;
    participantsCount: number;
    playgroundName?: string;
    cityName?: string;
    tournamentName?: string;
}

// Enhanced filter types
export interface MatchAdvancedFilter extends MatchFilterParams {
    startDate?: string;
    endDate?: string;
    minParticipants?: number;
    maxParticipants?: number;
    hasReservation?: boolean;
    priceRange?: {
        min: number;
        max: number;
    };
}

export interface MatchBulkOperation {
    matchIds: number[];
    action: 'cancel' | 'start' | 'complete' | 'delete';
    reason?: string;
}
