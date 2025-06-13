// Base playground types
export interface Playground {
    id: number;
    name: string;
    location: string;
    description: string;
    maxCapacity: number;
    currentCapacity: number;
    pricePerHour: number;
    availableFrom: string;
    availableTo: string;
    active: boolean;
    images: string[];
}

export interface CreatePlaygroundRequest {
    name: string;
    location: string;
    pricePerHour: number;
    description: string;
    maxCapacity: number;
    currentCapacity: number;
    availableFrom: string;
    availableTo: string;
    active: boolean;
}

export interface UpdatePlaygroundRequest {
    name?: string;
    location?: string;
    pricePerHour?: number;
    description?: string;
    maxCapacity?: number;
    currentCapacity?: number;
    availableFrom?: string;
    availableTo?: string;
    active?: boolean;
}

export interface PlaygroundFilters {
    name?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
}

export interface PlaygroundsResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: Playground[];
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

// Reservation types
export interface PlaygroundReservation {
    id: number;
    playgroundId: Playground;
    startTime: string;
    endTime: string;
    userId: number;
}

export interface CreateReservationRequest {
    playgroundId: number;
    startTime: string;
    endTime: string;
}

export interface ReservationFilters {
    playgroundId?: number;
    userId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
}

export interface ReservationsResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: PlaygroundReservation[];
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

export interface CreateResponse {
    id: number;
}
