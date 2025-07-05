// Playground Facilities Types
export interface PlaygroundFacility {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: string;
    active: boolean;
}

export interface PlaygroundFacilityAssignment {
    id: number;
    facility: PlaygroundFacility;
    quantity: number;
    notes: string;
}

// Request types
export interface CreatePlaygroundFacilityRequest {
    name: string;
    description: string;
    icon: string;
    category: string;
}

export interface UpdatePlaygroundFacilityRequest {
    name?: string;
    description?: string;
    icon?: string;
    category?: string;
}

export interface AssignFacilityToPlaygroundRequest {
    facilityId: number;
    quantity: number;
    notes: string;
}

export interface AssignFacilitiesToPlaygroundRequest {
    playgroundId: number;
    facilities: AssignFacilityToPlaygroundRequest[];
}

// Filter types
export interface PlaygroundFacilityFilters {
    name?: string;
    category?: string;
    active?: boolean;
    page?: number;
    size?: number;
}

// Response types
export interface PlaygroundFacilitiesResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: PlaygroundFacility[];
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

export interface CreatePlaygroundFacilityResponse {
    id: number;
}

// Common facility categories
export const FACILITY_CATEGORIES = {
    SPORTS: 'SPORTS',
    SAFETY: 'SAFETY',
    COMFORT: 'COMFORT',
    UTILITIES: 'UTILITIES',
    ENTERTAINMENT: 'ENTERTAINMENT',
    ACCESSIBILITY: 'ACCESSIBILITY'
} as const;

export type FacilityCategory = typeof FACILITY_CATEGORIES[keyof typeof FACILITY_CATEGORIES];

// Common facility icons - can be extended based on your icon system
export const FACILITY_ICONS = {
    BALL: 'ball',
    GOAL: 'goal',
    LIGHTING: 'lighting',
    PARKING: 'parking',
    RESTROOM: 'restroom',
    WATER: 'water',
    BENCH: 'bench',
    SECURITY: 'security',
    WIFI: 'wifi',
    ACCESSIBILITY: 'accessibility'
} as const;

export type FacilityIcon = typeof FACILITY_ICONS[keyof typeof FACILITY_ICONS];
