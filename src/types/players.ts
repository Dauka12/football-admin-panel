import { PreferredFoot } from './teams';

export interface PlayerBase {
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

export interface PlayerPublicResponse extends PlayerBase {
  id: number;
}

export interface PlayerCreateRequest extends PlayerBase {
  identificationNumber: string;
  userId: number;
}

export interface PlayerUpdateRequest extends PlayerCreateRequest {}

export interface PlayerCreateResponse {
  id: number;
}
