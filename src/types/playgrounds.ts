// Base playground types
export interface Playground {
    id: number;
    name: string;
    cityId: number;
    description: string;
    maxCapacity: number;
    currentCapacity: number;
    pricePerHour: number;
    availableFrom: string;
    availableTo: string;
    active: boolean;
    images: string[];
    // Эти поля не возвращаются в public API, только в admin
    fieldSize?: string;
    fieldCoverType?: string;
    fieldSurfaceType?: string;
}

export interface CreatePlaygroundRequest {
    name: string;
    cityId: number;
    pricePerHour: number;
    description: string;
    maxCapacity: number;
    currentCapacity: number;
    availableFrom: string;
    availableTo: string;
    fieldSize: string;
    fieldCoverType: string;
    fieldSurfaceType: string;
    // active не нужно в CreateRequest - устанавливается автоматически на бэкенде
}

export interface UpdatePlaygroundRequest {
    name?: string;
    cityId?: number;
    pricePerHour?: number;
    description?: string;
    maxCapacity?: number;
    currentCapacity?: number;
    availableFrom?: string;
    availableTo?: string;
    fieldSize?: string;
    fieldCoverType?: string;
    fieldSurfaceType?: string;
}

export interface PlaygroundFilters {
    name?: string;
    playgroundCityId?: number; // Изменено с location на playgroundCityId согласно Swagger
    startTime?: string; // Добавлено из Swagger
    endTime?: string; // Добавлено из Swagger
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
