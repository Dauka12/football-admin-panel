// Team reference for tournament responses
export interface TournamentTeam {
    id: number;
    name: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    avatar: string;
}

// Tournament status enum
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

// Tournament format enum
export type TournamentFormat = 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss';

// Simplified tournament request for create/update
export interface CreateTournamentRequest {
    name: string;
    startDate: string;
    endDate: string;
    teams: number[];
    cityId: number;
    sportTypeId: number;
    categoryId: number;
}

export interface UpdateTournamentRequest {
    name: string;
    startDate: string;
    endDate: string;
    teams: number[];
    cityId: number;
    sportTypeId: number;
    categoryId: number;
}

// Response interfaces  
export interface TournamentFullResponse {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    numberOfMatches: number;
    sportTypeId: number;
    categoryId: number;
    cityId: number;
    teams?: TournamentTeam[];
}

// Paginated response for tournaments list
export interface TournamentPaginatedResponse {
    content: TournamentFullResponse[];
    pageable: {
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
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}

export interface TournamentCreateResponse {
    id: number;
}

export interface TournamentErrorResponse {
    id: number;
}

// Tournament filter parameters for search/filtering
export interface TournamentFilters {
    name?: string;
    date?: string; // Single date filter as per Swagger API
    cityId?: number;
    sportTypeId?: number;
    categoryId?: number;
    page?: number;
    size?: number;
}

// Compatibility namespaces to avoid breaking existing code
export namespace TournamentRequest {
    export type Create = CreateTournamentRequest;
    export type Update = UpdateTournamentRequest;
}

export namespace TournamentResponse {
    export type Full = TournamentFullResponse;
    export type Create = TournamentCreateResponse;
    export type Error = TournamentErrorResponse;
}
