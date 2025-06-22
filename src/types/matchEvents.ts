export interface MatchEvent {
  id: number;
  matchId: number;
  playerId?: number;
  teamId?: number;
  eventType: MatchEventType;
  eventTime: number; // in minutes
  description?: string;
  createdAt: string;
  updatedAt: string;
  playerFullName?: string;
  teamName?: string;
}

export type MatchEventType = 
  | 'GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SECOND_YELLOW'
  | 'PENALTY_GOAL'
  | 'MISSED_PENALTY'
  | 'OWN_GOAL';

export const MATCH_EVENT_TYPES = {
  GOAL: 'GOAL' as const,
  YELLOW_CARD: 'YELLOW_CARD' as const,
  RED_CARD: 'RED_CARD' as const,
  SECOND_YELLOW: 'SECOND_YELLOW' as const,
  PENALTY_GOAL: 'PENALTY_GOAL' as const,
  MISSED_PENALTY: 'MISSED_PENALTY' as const,
  OWN_GOAL: 'OWN_GOAL' as const
} as const;

export interface CreateMatchEventRequest {
  matchId: number;
  playerId?: number;
  teamId?: number;
  eventType: MatchEventType;
  eventTime: number;
  description?: string;
}

export interface UpdateMatchEventRequest {
  playerId?: number;
  teamId?: number;
  eventType?: MatchEventType;
  eventTime?: number;
  description?: string;
}
