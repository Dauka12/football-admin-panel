export interface SportClubAddress {
    id?: number;
    streetLine1: string;
    streetLine2?: string;
    cityId: number;
    cityName?: string;
    zipCode?: string;
    description?: string;
    isPrimary: boolean;
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
        number?: number;
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
    minAge: number;
    maxAge: number;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    facilities?: string;
    membershipFee?: number;
    membershipBenefits?: string;
    operatingHours?: string;
    sportTypeId: number;
    sportTypeName?: string;
    establishmentYear?: number;
    active: boolean;
    teams: SportClubTeam[];
}

export interface CreateSportClubRequest {
    name: string;
    description?: string;
    clubType: 'KIDS' | 'REGULAR' | 'PROFESSIONAL' | 'MIXED';
    addresses: Omit<SportClubAddress, 'id' | 'cityName'>[];
    minAge: number;
    maxAge: number;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    facilities?: string;
    membershipFee?: number;
    membershipBenefits?: string;
    operatingHours?: string;
    sportTypeId: number;
    establishmentYear?: number;
    teams?: number[];
}

export interface UpdateSportClubRequest extends CreateSportClubRequest {
    active?: boolean;
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
