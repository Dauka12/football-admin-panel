import { PreferredFoot } from './teams';

export interface PlayerBase {
    position: string;
    age: number;
    height: number;
    weight: number;
    nationality: string;
    birthplace: string;
    preferredFoot: PreferredFoot;
    bio: string;
    club?: string; // Made optional to match API
}

export interface PlayerPublicResponse extends PlayerBase {
    id: number;
    fullName?: string; // Added to handle API response that has fullName field
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
    teamId?: number; // Add teamId field for team selection
    identificationNumber?: string;
    userId?: number;
    sportTypeId?: number; // Add sportTypeId to match API spec
}

export interface PlayerUpdateRequest extends PlayerCreateRequest { }

export interface PlayerCreateResponse {
    id: number;
}
