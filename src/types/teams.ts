export type PreferredFoot = "LEFT" | "RIGHT" | "BOTH";

// Player type used in team responses
export interface Player {
  id: number;
  position: string;
  club: string;
  age: number;
  height: number;
  weight: number;
  nationality: string;
  birthplace: string;
  preferredFoot: PreferredFoot;
  bio: string;
}

// Basic team interface with common properties
export interface TeamBase {
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
}

// Request types
export interface CreateTeamRequest extends TeamBase {
  players: number[];
}

export interface UpdateTeamRequest extends TeamBase {
  players: number[];
}

// Response types
export interface TeamBaseResponse extends TeamBase {
  id: number;
  avatar: string;
}

export interface TeamFullResponse extends TeamBaseResponse {
  players: Player[];
}

export interface TeamCreateResponse {
  id: number;
}

export interface TeamErrorResponse {
  id: number;
}

// For backward compatibility
// Note: Types cannot be used as values at runtime. If you need runtime references, use string literals or interfaces.
