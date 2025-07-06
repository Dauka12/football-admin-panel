// Tournament statistics interface
export interface TournamentStatisticsResponse {
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

// Match results matrix interface
export interface MatchResultsResponse {
    homeTeamId: number;
    homeTeamName: string;
    awayTeamId: number;
    awayTeamName: string;
    homeScore: number;
    awayScore: number;
}

// Team match details interface
export interface TeamMatchDetails {
    matchId: number;
    matchDate: string;
    opponentName: string;
    teamScore: number;
    opponentScore: number;
    tournamentName: string;
}

// Team matches paginated response
export interface TeamMatchesResponse {
    totalElements: number;
    totalPages: number;
    size: number;
    content: TeamMatchDetails[];
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

// Player statistics interface
export interface PlayerStatistics {
    matchesPlayed: number;
    goals: number;
    assists: number;
}

export interface PlayerStatisticsResponse {
    playerId: number;
    statistics: PlayerStatistics;
}
