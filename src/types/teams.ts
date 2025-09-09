export type PreferredFoot = 'LEFT' | 'RIGHT' | 'BOTH';

export const PreferredFoot = {
    LEFT: 'LEFT' as PreferredFoot,
    RIGHT: 'RIGHT' as PreferredFoot,
    BOTH: 'BOTH' as PreferredFoot
} as const;

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
    heroId: number;
    imageUrl: string;
    heroGif: string;
}

export interface TeamBase {
    name: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    cityId: number;
    sportTypeId: number;
}

export interface CreateTeamRequest extends TeamBase {
    players: number[];
}

export interface UpdateTeamRequest extends TeamBase {
    players: number[];
}

export interface TeamBaseResponse extends TeamBase {
    id: number;
    avatar: string;
    teamId: number;
}

export interface TeamFullResponse extends TeamBaseResponse {
    players: Player[];
}

export interface TeamPublicResponse extends TeamBaseResponse {
}

export interface TeamCreateResponse {
    id: number;
}

export interface TeamsPageResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: TeamFullResponse[];
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
