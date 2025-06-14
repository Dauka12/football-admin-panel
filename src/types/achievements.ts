
export interface Achievement {
    id: number;
    playerId: number;
    title: string;
    description: string;
    achievementDate: string;
    category: string;
    points: number;
    featured: boolean;
    createdAt: string;
}

export interface CreateAchievementRequest {
    playerId: number;
    title: string;
    description: string;
    achievementDate: string;
    category: string;
    points: number;
    featured: boolean;
}

export interface UpdateAchievementRequest {
    title: string;
    description: string;
    achievementDate: string;
    category: string;
    points: number;
    featured: boolean;
}

export interface AchievementsFilter {
    playerId?: number;
    title?: string;
    category?: string;
    featured?: boolean;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
}

export interface AchievementsResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: Achievement[];
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

export interface CreateAchievementResponse {
    id: number;
}

export const ACHIEVEMENT_CATEGORIES = [
    'tournament_winner',
    'best_player',
    'top_scorer',
    'most_assists',
    'fair_play',
    'rookie_of_year',
    'veteran_achievement',
    'team_captain',
    'milestone',
    'special_award'
] as const;

export type AchievementCategory = typeof ACHIEVEMENT_CATEGORIES[number];
