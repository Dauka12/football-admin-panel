// Base playground types
export interface Facility {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: string;
    active: boolean;
}

export interface PlaygroundFacility {
    id: number;
    facility: Facility;
    quantity: number;
    notes: string;
}

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
    address: string;
    latitude: number;
    longitude: number;
    facilities?: PlaygroundFacility[];
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
    address: string;
    latitude: number;
    longitude: number;
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
    address?: string;
    latitude?: number;
    longitude?: number;
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
    playground: Playground;  // Изменено с playgroundId на playground согласно Swagger
    startTime: string;
    endTime: string;
    userId: number;
    status: string;  // Добавлено согласно Swagger
}

// Additional reservation types from Swagger
export interface UpdateReservationStatusRequest {
    statusRequest: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'PAID';
}

export interface PayReservationRequest {
    reservationId: number;
    paymentMethod: string;
    amountPaid: number;
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
