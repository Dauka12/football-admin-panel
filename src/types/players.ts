import { PreferredFoot } from './teams';

// Player positions enum based on API specification
export type PlayerPosition = 
    | 'GOALKEEPER'
    | 'CENTER_BACK'
    | 'LEFT_BACK'
    | 'RIGHT_BACK'
    | 'LEFT_WING_BACK'
    | 'RIGHT_WING_BACK'
    | 'CENTRAL_DEFENSIVE_MIDFIELDER'
    | 'CENTRAL_MIDFIELDER'
    | 'LEFT_MIDFIELDER'
    | 'RIGHT_MIDFIELDER'
    | 'CENTRAL_ATTACKING_MIDFIELDER'
    | 'LEFT_WING'
    | 'RIGHT_WING'
    | 'STRIKER'
    | 'CENTER_FORWARD';

export const PlayerPositions = {
    GOALKEEPER: 'GOALKEEPER',
    CENTER_BACK: 'CENTER_BACK',
    LEFT_BACK: 'LEFT_BACK',
    RIGHT_BACK: 'RIGHT_BACK',
    LEFT_WING_BACK: 'LEFT_WING_BACK',
    RIGHT_WING_BACK: 'RIGHT_WING_BACK',
    CENTRAL_DEFENSIVE_MIDFIELDER: 'CENTRAL_DEFENSIVE_MIDFIELDER',
    CENTRAL_MIDFIELDER: 'CENTRAL_MIDFIELDER',
    LEFT_MIDFIELDER: 'LEFT_MIDFIELDER',
    RIGHT_MIDFIELDER: 'RIGHT_MIDFIELDER',
    CENTRAL_ATTACKING_MIDFIELDER: 'CENTRAL_ATTACKING_MIDFIELDER',
    LEFT_WING: 'LEFT_WING',
    RIGHT_WING: 'RIGHT_WING',
    STRIKER: 'STRIKER',
    CENTER_FORWARD: 'CENTER_FORWARD'
} as const;

// Base interface for player data - used for create/update requests
export interface PlayerBase {
    position: PlayerPosition;
    teamId: number;
    age: number;
    height: number;
    weight: number;
    nationality: string;
    birthplace: string;
    preferredFoot: PreferredFoot;
    bio: string;
    identificationNumber: string; // Only used in create/update requests
    userId: number;
    sportTypeId: number;
    heroId: number;
}

// Public response interface - aligned with API specification
export interface PlayerPublicResponse {
    id: number;
    fullName: string;
    position: string; // API returns position as string, not enum
    teamId: number;
    age: number;
    height: number;
    weight: number;
    nationality: string;
    birthplace: string;
    preferredFoot: PreferredFoot;
    bio: string;
    sportTypeId: number;
    heroId: number;
    imageUrl: string;
    heroGif: string;
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

export interface PlayersPageResponse extends PageResponse<PlayerPublicResponse> {}

// Create request interface - aligned with API specification
export interface PlayerCreateRequest {
    position: PlayerPosition;
    teamId: number;
    age: number;
    height: number;
    weight: number;
    nationality: string;
    birthplace: string;
    preferredFoot: PreferredFoot;
    bio: string;
    identificationNumber: string;
    userId: number;
    sportTypeId: number;
    heroId: number;
}

// Update request interface - aligned with API specification  
export interface PlayerUpdateRequest {
    position: PlayerPosition;
    teamId: number;
    age: number;
    height: number;
    weight: number;
    nationality: string;
    birthplace: string;
    preferredFoot: PreferredFoot;
    bio: string;
    identificationNumber: string;
    userId: number;
    sportTypeId: number;
    heroId: number;
}

// Response for create/update operations
export interface PlayerCreateResponse {
    id: number;
}

// Filter parameters for API queries - aligned with API specification
export interface PlayerFilterParams {
    teamId?: number;
    age?: number;
    nationality?: string;
    birthplace?: string;
    preferredFoot?: PreferredFoot;
    fullName?: string;
    sportTypeId?: number;
    position?: PlayerPosition;
    page?: number;
    size?: number;
}
