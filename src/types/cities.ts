export interface City {
    id: number;
    name: string;
    country: string;
    region: string;
    latitude: number;
    longitude: number;
    description: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
    // Note: population and postalCode are only in create/update requests, not in responses
}

export interface CityCreateRequest {
    name: string;
    country: string;
    region: string;
    population: number;
    latitude: number;
    longitude: number;
    description: string;
    postalCode: string;
    active: boolean;
}

export interface CityUpdateRequest {
    name: string;
    country: string;
    region: string;
    population: number;
    latitude: number;
    longitude: number;
    description: string;
    postalCode: string;
    active: boolean;
}

export interface CityFilterParams {
    name?: string;
    country?: string;
    region?: string;
    active?: boolean;
}

export interface CitiesPageResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: City[];
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
