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
    identificationNumber?: string;
    userId?: number;
}

export interface PlayerUpdateRequest extends PlayerCreateRequest { }

export interface PlayerCreateResponse {
    id: number;
}
