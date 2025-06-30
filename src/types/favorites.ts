export type EntityType = 'TEAM' | 'TOURNAMENT' | 'PLAYGROUND' | 'MATCH' | 'PLAYER' | 'SPORT_CLUB';

export interface Favorite {
  id: number;
  entityType: EntityType;
  entityId: number;
  createdAt: string;
}

export interface AddFavoriteRequest {
  entityId: number;
  entityType: EntityType;
}

export interface FavoritesResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: Favorite[];
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

export interface BatchCheckResponse {
  [entityId: string]: boolean;
}

export interface FavoritesFilters {
  entityType?: EntityType;
  page?: number;
  size?: number;
}
