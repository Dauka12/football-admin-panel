export interface Country {
    id: number;
    name: string;
    code: string;
    isoCode2: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
    cities: City[];
}

export interface City {
    id: number;
    name: string;
    country: string;
    countryId: number;
    countryInfo: CountryInfo;
    region: string;
    latitude: number;
    longitude: number;
    description: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
}

export interface CountryInfo {
    id: number;
    name: string;
    code: string;
    isoCode2: string;
    active: boolean;
}

export interface CreateCountryRequest {
    name: string;
    code: string;
    isoCode2: string;
    active: boolean;
}

export interface UpdateCountryRequest {
    name?: string;
    code?: string;
    isoCode2?: string;
    active?: boolean;
}

export interface CountryFilters {
    name?: string;
    code?: string;
    active?: boolean;
    page?: number;
    size?: number;
}

export interface CountryResponse {
    content: Country[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}
