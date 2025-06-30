// Match Participant status enum
export type MatchParticipantStatus = 'CONFIRMED' | 'WAITING_PAYMENT' | 'CANCELLED';

export const MatchParticipantStatus = {
    CONFIRMED: 'CONFIRMED' as MatchParticipantStatus,
    WAITING_PAYMENT: 'WAITING_PAYMENT' as MatchParticipantStatus,
    CANCELLED: 'CANCELLED' as MatchParticipantStatus
} as const;

// Base participant interface
export interface MatchParticipant {
    id: number;
    teamId: number;
    teamName: string;
    playerId: number;
    playerFullName: string;
    score: number;
    userId: number;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    status: MatchParticipantStatus;
    hasPaid: boolean;
    amountPaid: number;
    joinedAt: string;
}

// Simplified participant interface for organized matches
export interface OrganizedMatchParticipant {
    id: number;
    teamId: number;
    teamName: string;
    playerId?: number;
    playerFullName?: string;
    score?: number;
    userId?: number;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    status?: MatchParticipantStatus;
    hasPaid?: boolean;
    amountPaid?: number;
    joinedAt?: string;
}

// Create participant request
export interface CreateMatchParticipantRequest {
    matchId: number;
    teamId: number;
    playerId: number;
    userId: number;
    isOrganizer: boolean;
    status: MatchParticipantStatus;
    hasPaid: boolean;
    amountPaid: number;
    paymentMethod: string;
}

// Update participant request
export interface UpdateMatchParticipantRequest {
    teamId: number;
    playerId: number;
    score: number;
    status: MatchParticipantStatus;
    hasPaid: boolean;
    amountPaid: number;
    paymentMethod: string;
}

// Payment request
export interface MatchParticipantPaymentRequest {
    [key: string]: string;
}

// Status update request
export interface MatchParticipantStatusRequest {
    [key: string]: string;
}

// Response types
export interface MatchParticipantResponse {
    id: number;
    teamId: number;
    teamName: string;
    playerId: number;
    playerFullName: string;
    score: number;
    userId: number;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    status: MatchParticipantStatus;
    hasPaid: boolean;
    amountPaid: number;
    joinedAt: string;
}

// Participation check response
export interface ParticipationCheckResponse {
    [key: string]: boolean;
}

// Filter parameters
export interface MatchParticipantFilters {
    matchId?: number;
    status?: MatchParticipantStatus;
    teamId?: number;
    playerId?: number;
    userId?: number;
    hasPaid?: boolean;
}
