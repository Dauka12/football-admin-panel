export interface SportClubAddress {
    id?: number;
    streetLine1: string;
    streetLine2?: string;
    cityId: number;
    cityName?: string;
    zipCode?: string;
    description?: string;
    isPrimary: boolean;
    latitude?: string;
    longitude?: string;
}

export interface OpeningHours {
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    openTime: string;
    closeTime: string;
    isClosed: boolean;
}

export interface AgeCategory {
    ageCategory: 'U6' | 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | 'U21' | 'SENIOR';
    isActive: boolean;
    maxParticipants: number;
    categoryDescription?: string;
}

export interface SportClubTeam {
    id: number;
    name: string;
    description?: string;
    players: Array<{
        id: number;
        fullName: string;
        position: string;
        teamId: number;
        age: number;
        height?: number;
        weight?: number;
        nationality?: string;
        birthplace?: string;
        preferredFoot?: 'LEFT' | 'RIGHT';
        bio?: string;
        sportTypeId: number;
        heroId?: number; // Добавлено из Swagger
        imageUrl?: string; // Добавлено из Swagger
        heroGif?: string; // Добавлено из Swagger
    }>;
    primaryColor?: string;
    secondaryColor?: string;
    avatar?: string;
    teamId: number;
    sportTypeId: number;
}

export interface SportClub {
    id: number;
    name: string;
    description?: string;
    clubType: 'KIDS' | 'REGULAR' | 'PROFESSIONAL' | 'MIXED';
    addresses: SportClubAddress[];
    openingHours?: OpeningHours[];
    ageCategories?: AgeCategory[];
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    facilities?: string;
    membershipFee?: number;
    membershipBenefits?: string;
    sportTypeId: number;
    sportTypeName?: string;
    establishmentYear?: number;
    active: boolean;
    teams: SportClubTeam[];
    // Image fields from Swagger
    imageUrl?: number; // File ID for club avatar
    heroId?: number; // File ID for hero image
    heroGif?: string; // URL for hero GIF
}

export interface CreateSportClubRequest {
    name: string;
    description?: string;
    clubType: 'KIDS' | 'REGULAR' | 'PROFESSIONAL' | 'MIXED';
    addresses: Omit<SportClubAddress, 'id' | 'cityName'>[];
    openingHours?: OpeningHours[];
    ageCategories?: AgeCategory[];
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    facilities?: string;
    membershipFee?: number;
    membershipBenefits?: string;
    sportTypeId: number;
    establishmentYear?: number;
    teams?: number[];
    // Image fields from Swagger
    imageUrl?: number; // File ID for club avatar
    heroId?: number; // File ID for hero image
    heroGif?: string; // URL for hero GIF
}

export interface CreateSportClubAddressRequest {
    streetLine1: string;
    streetLine2?: string;
    cityId: number;
    zipCode?: string;
    description?: string;
    isPrimary: boolean;
    latitude?: string;
    longitude?: string;
}

export interface UpdateSportClubAddressRequest extends CreateSportClubAddressRequest {
    // All fields from CreateSportClubAddressRequest are available for update
}

export interface UpdateSportClubRequest extends CreateSportClubRequest {
    // All fields from CreateSportClubRequest are available for update
}

export interface SportClubFilterParams {
    name?: string;
    clubType?: 'KIDS' | 'REGULAR' | 'PROFESSIONAL' | 'MIXED';
    cityId?: number;
    minAge?: number;
    maxAge?: number;
    sportTypeId?: number;
    active?: boolean;
    page?: number;
    size?: number;
}

export interface SportClubsPageResponse {
    content: SportClub[];
    totalElements: number;
    totalPages: number;
    size: number;
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
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface CreateSportClubAddressRequest {
    streetLine1: string;
    streetLine2?: string;
    cityId: number;
    zipCode?: string;
    description?: string;
    isPrimary: boolean;
}

export interface UpdateSportClubAddressRequest extends CreateSportClubAddressRequest {}
