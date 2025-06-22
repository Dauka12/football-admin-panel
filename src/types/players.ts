import { PreferredFoot } from './teams';

// Player positions enum based on API
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

export interface PlayerBase {
    position: PlayerPosition;
    age: number;
    height?: number; // Made optional as it might not be required
    weight?: number; // Made optional as it might not be required
    nationality?: string; // Made optional as it might not be required
    birthplace?: string; // Made optional as it might not be required
    preferredFoot: PreferredFoot;
    bio?: string; // Made optional as it might not be required
    identificationNumber?: string; // Added from API
}

export interface PlayerPublicResponse extends PlayerBase {
    id: number;
    fullName: string; // API may return "Unknown" if not set
    teamId?: number; // Optional since not always present in API response
    sportTypeId?: number; // Optional since not always present in API response  
    number?: number; // Added player number from API response
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

export interface PlayerCreateRequest extends PlayerBase {
    teamId?: number; // Optional for team assignment
    userId?: number; // Added from API spec
    sportTypeId: number; // Required from API spec
    number?: number; // Added player number
}

export interface PlayerUpdateRequest extends PlayerCreateRequest {}

export interface PlayerCreateResponse {
    id: number;
}
