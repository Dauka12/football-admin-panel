export type NewsCategory = 
    | 'GENERAL_SPORTS'
    | 'FOOTBALL'
    | 'BASKETBALL'
    | 'TENNIS'
    | 'BASEBALL'
    | 'HOCKEY'
    | 'OLYMPICS'
    | 'LOCAL_SPORTS'
    | 'INTERNATIONAL'
    | 'TRANSFERS'
    | 'MATCH_RESULTS'
    | 'PLAYER_NEWS'
    | 'TEAM_NEWS'
    | 'TOURNAMENT_NEWS'
    | 'EQUIPMENT_REVIEW'
    | 'HEALTH_FITNESS'
    | 'COACHING_TIPS'
    | 'YOUTH_SPORTS'
    | 'WOMEN_SPORTS'
    | 'ESPORTS';

export type NewsStatus = 
    | 'DRAFT'
    | 'PUBLISHED'
    | 'ARCHIVED'
    | 'DELETED';

export interface NewsAuthor {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

export interface News {
    id: number;
    title: string;
    summary: string;
    content: string;
    images: string[];
    tags: string[];
    category: NewsCategory;
    status: NewsStatus;
    viewCount: number;
    isFeatured: boolean;
    isBreaking: boolean;
    publishedAt: string;
    author: NewsAuthor;
    metaTitle: string;
    metaDescription: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
}

export interface NewsListItem {
    id: number;
    title: string;
    summary: string;
    imageUrl: string;
    tags: string[];
    category: NewsCategory;
    viewCount: number;
    isFeatured: boolean;
    isBreaking: boolean;
    publishedAt: string;
    authorName: string;
    slug: string;
}

export interface CreateNewsRequest {
    title: string;
    summary: string;
    content: string;
    tags: string[];
    category: NewsCategory;
    status: NewsStatus;
    isFeatured: boolean;
    isBreaking: boolean;
    publishedAt?: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
    active: boolean;
}

export interface UpdateNewsRequest {
    title?: string;
    summary?: string;
    content?: string;
    tags?: string[];
    category?: NewsCategory;
    status?: NewsStatus;
    isFeatured?: boolean;
    isBreaking?: boolean;
    publishedAt?: string;
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
    active?: boolean;
}

export interface NewsFilters {
    title?: string;
    content?: string;
    summary?: string;
    category?: NewsCategory;
    status?: NewsStatus;
    isFeatured?: boolean;
    isBreaking?: boolean;
    isActive?: boolean;
    authorId?: number;
    authorName?: string;
    tags?: string[];
    publishedAfter?: string;
    publishedBefore?: string;
    createdAfter?: string;
    createdBefore?: string;
    minViewCount?: number;
    maxViewCount?: number;
    keyword?: string;
    page?: number;
    size?: number;
    sort?: string[];
}

export interface NewsResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: News[];
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

export interface NewsListResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: NewsListItem[];
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

export interface CreateNewsResponse {
    id: number;
}

export interface SlugValidationResponse {
    [key: string]: boolean;
}

export interface NewsStatistics {
    [key: string]: string;
}

export interface NewsFormData {
    title: string;
    summary: string;
    content: string;
    tags: string[];
    category: NewsCategory;
    status: NewsStatus;
    isFeatured: boolean;
    isBreaking: boolean;
    publishedAt?: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
    active: boolean;
    images?: string[];
}

export interface NewsSearchResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: News[];
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
