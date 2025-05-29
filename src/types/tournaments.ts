// Team reference for tournament responses
export interface TournamentTeam {
    id: number;
    name: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    avatar: string;
}

// Tournament status enum
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

// Tournament format enum
export type TournamentFormat = 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss';

// Simplified tournament request for create/update
export interface CreateTournamentRequest {
    name: string;
    startDate: string;
    endDate: string;
    teams: number[];
}

export interface UpdateTournamentRequest {
    name: string;
    startDate: string;
    endDate: string;
    teams: number[];
}

// Response interfaces  
export interface TournamentFullResponse {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    teams?: TournamentTeam[];
}

export interface TournamentCreateResponse {
    id: number;
}

export interface TournamentErrorResponse {
    id: number;
}

// Compatibility namespaces to avoid breaking existing code
export namespace TournamentRequest {
    export type Create = CreateTournamentRequest;
    export type Update = UpdateTournamentRequest;
}

export namespace TournamentResponse {
    export type Full = TournamentFullResponse;
    export type Create = TournamentCreateResponse;
    export type Error = TournamentErrorResponse;
}
