export type PreferredFoot = 'LEFT' | 'RIGHT' | 'BOTH';

export const PreferredFoot = {
    LEFT: 'LEFT' as PreferredFoot,
    RIGHT: 'RIGHT' as PreferredFoot,
    BOTH: 'BOTH' as PreferredFoot
} as const;

// Player type used in team responses
export interface Player {
    id: number;
    fullName: string;
    position: string;
    teamId: number;
    age: number;
    height: number;
    weight: number;
    nationality: string;
    birthplace: string;
    preferredFoot: PreferredFoot;
    bio: string;
    sportTypeId: number;
}

// Basic team interface with common properties
export interface TeamBase {
    name: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    cityId: number;
    sportTypeId: number;
}

// Request interfaces
export interface CreateTeamRequest extends TeamBase {
    players: number[];
}

export interface UpdateTeamRequest extends TeamBase {
    players: number[];
}

// Response interfaces
export interface TeamBaseResponse extends TeamBase {
    id: number;
    avatar: string;
}

export interface TeamFullResponse extends TeamBaseResponse {
    players: Player[];
    teamId: number;
}

export interface TeamPublicResponse extends TeamBaseResponse {
    teamId: number;
}

export interface TeamCreateResponse {
    id: number;
}

// Paginated response for teams
export interface TeamsPageResponse {
    content: TeamFullResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    pageable: {
        offset: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        pageNumber: number;
        pageSize: number;
        paged: boolean;
        unpaged: boolean;
    };
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface TeamErrorResponse {
    id: number;
}

// Compatibility namespaces to avoid breaking existing code
export namespace TeamRequest {
    export type Create = CreateTeamRequest;
    export type Update = UpdateTeamRequest;
}

export namespace TeamResponse {
    export type Base = TeamBaseResponse;
    export type Full = TeamFullResponse;
    export type Create = TeamCreateResponse;
    export type Error = TeamErrorResponse;
}
