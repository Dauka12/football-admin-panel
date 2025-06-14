export interface SportType {
    id: number;
    name: string;
    description: string;
    teamBased: boolean;
    maxTeamSize: number;
    minTeamSize: number;
    createdAt: string;
    updatedAt: string;
    active: boolean;
}

export interface SportTypeCreateRequest {
    name: string;
    description: string;
    teamBased: boolean;
    maxTeamSize: number;
    minTeamSize: number;
    active: boolean;
}

export interface SportTypeUpdateRequest {
    name: string;
    description: string;
    teamBased: boolean;
    maxTeamSize: number;
    minTeamSize: number;
    active: boolean;
}

export interface SportTypeFilterParams {
    name?: string;
    teamBased?: boolean;
    active?: boolean;
}

export interface SportTypesPageResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: SportType[];
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
        paged: boolean;
        pageNumber: number;
        pageSize: number;
        unpaged: boolean;
    };
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}
