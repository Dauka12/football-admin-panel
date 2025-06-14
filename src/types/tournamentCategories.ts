// Tournament Category Types
export interface TournamentCategory {
    id: number;
    name: string;
    description: string;
    active: boolean;
}

// Request types
export interface CreateTournamentCategoryRequest {
    name: string;
    description: string;
}

export interface UpdateTournamentCategoryRequest {
    name: string;
    description: string;
}

// Response types
export interface TournamentCategoryResponse {
    id: number;
}

export interface TournamentCategoriesPageResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: TournamentCategory[];
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

// Filter types
export interface TournamentCategoryFilters {
    name?: string;
    active?: boolean;
    page?: number;
    size?: number;
}

// Statistics types
export interface TournamentCategoryStatistics {
    total: number;
    active: number;
    inactive: number;
}
