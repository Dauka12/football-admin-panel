export interface TournamentTeamStatistics {
    teamId: number;
    teamName: string;
    gamesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
}

export interface TournamentMatchResult {
    homeTeamId: number;
    homeTeamName: string;
    awayTeamId: number;
    awayTeamName: string;
    homeScore: number;
    awayScore: number;
}

export interface TeamMatchResult {
    matchId: number;
    matchDate: string;
    opponentName: string;
    teamScore: number;
    opponentScore: number;
    tournamentName: string;
}

export interface TeamMatchResultsResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: TeamMatchResult[];
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

// Player statistics interfaces according to Swagger API
export interface PlayerStatistics {
    matchesPlayed: number;
    goals: number;
    assists: number;
}

export interface PlayerStatisticsResponse {
    playerId: number;
    statistics: PlayerStatistics;
}
