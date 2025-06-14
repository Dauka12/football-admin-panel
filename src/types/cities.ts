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
    first: boolean;
    last: boolean;
    empty: boolean;
}
