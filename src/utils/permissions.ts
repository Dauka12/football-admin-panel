import type { UserRole } from '../types/users';

// Типы разрешений
export type Permission = 
  // Teams
  | 'teams.view'
  | 'teams.create' 
  | 'teams.edit'
  | 'teams.delete'
  // Players
  | 'players.view'
  | 'players.create'
  | 'players.edit'
  | 'players.delete'
  // Matches
  | 'matches.view'
  | 'matches.create'
  | 'matches.edit'
  | 'matches.delete'
  // Tournaments
  | 'tournaments.view'
  | 'tournaments.create'
  | 'tournaments.edit'
  | 'tournaments.delete'
  // Tournament Categories
  | 'tournament-categories.view'
  | 'tournament-categories.create'
  | 'tournament-categories.edit'
  | 'tournament-categories.delete'
  // Sport Clubs
  | 'sport-clubs.view'
  | 'sport-clubs.create'
  | 'sport-clubs.edit'
  | 'sport-clubs.delete'
  // Sport Types
  | 'sport-types.view'
  | 'sport-types.create'
  | 'sport-types.edit'
  | 'sport-types.delete'
  // Match Participants
  | 'match-participants.view'
  | 'match-participants.create'
  | 'match-participants.edit'
  | 'match-participants.delete'
  // Users
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage'
  // Playgrounds
  | 'playgrounds.view'
  | 'playgrounds.create'
  | 'playgrounds.edit'
  | 'playgrounds.delete'
  // Achievements
  | 'achievements.view'
  | 'achievements.create'
  | 'achievements.edit'
  | 'achievements.delete'
  // Regions
  | 'regions.view'
  | 'regions.create'
  | 'regions.edit'
  | 'regions.delete'
  // Cities
  | 'cities.view'
  | 'cities.create'
  | 'cities.edit'
  | 'cities.delete'
  // Countries
  | 'countries.view'
  | 'countries.create'
  | 'countries.edit'
  | 'countries.delete'
  // Files
  | 'files.view'
  | 'files.upload'
  | 'files.delete'
  // News
  | 'news.view'
  | 'news.create'
  | 'news.edit'
  | 'news.delete'
  | 'news.publish'
  // Favorites
  | 'favorites.view'
  | 'favorites.manage'
  // Analytics
  | 'analytics.view'
  | 'analytics.export'
  // Permissions
  | 'permissions.view'
  | 'permissions.manage';

// Роли системы
export type RoleName = 'ADMIN' | 'PLAYER' | 'MANAGER' | 'COACH' | 'CONTENT_EDITOR' | 'ANALYST';

// Конфигурация разрешений
export const permissions: Record<Permission, RoleName[]> = {
  // Teams
  'teams.view': ['ADMIN', 'MANAGER', 'COACH'],
  'teams.create': ['ADMIN', 'MANAGER'],
  'teams.edit': ['ADMIN', 'MANAGER'],
  'teams.delete': ['ADMIN'],
  
  // Players
  'players.view': ['ADMIN', 'MANAGER', 'COACH'],
  'players.create': ['ADMIN', 'MANAGER'],
  'players.edit': ['ADMIN', 'MANAGER', 'COACH'],
  'players.delete': ['ADMIN'],
  
  // Matches
  'matches.view': ['ADMIN', 'MANAGER', 'COACH', 'ANALYST'],
  'matches.create': ['ADMIN', 'MANAGER'],
  'matches.edit': ['ADMIN', 'MANAGER'],
  'matches.delete': ['ADMIN'],
  
  // Tournaments
  'tournaments.view': ['ADMIN', 'MANAGER', 'COACH', 'ANALYST'],
  'tournaments.create': ['ADMIN', 'MANAGER'],
  'tournaments.edit': ['ADMIN', 'MANAGER'],
  'tournaments.delete': ['ADMIN'],
  
  // Tournament Categories
  'tournament-categories.view': ['ADMIN', 'MANAGER'],
  'tournament-categories.create': ['ADMIN'],
  'tournament-categories.edit': ['ADMIN'],
  'tournament-categories.delete': ['ADMIN'],
  
  // Sport Clubs
  'sport-clubs.view': ['ADMIN', 'MANAGER', 'COACH'],
  'sport-clubs.create': ['ADMIN', 'MANAGER'],
  'sport-clubs.edit': ['ADMIN', 'MANAGER'],
  'sport-clubs.delete': ['ADMIN'],
  
  // Sport Types
  'sport-types.view': ['ADMIN', 'MANAGER'],
  'sport-types.create': ['ADMIN'],
  'sport-types.edit': ['ADMIN'],
  'sport-types.delete': ['ADMIN'],
  
  // Match Participants
  'match-participants.view': ['ADMIN', 'MANAGER', 'COACH'],
  'match-participants.create': ['ADMIN', 'MANAGER'],
  'match-participants.edit': ['ADMIN', 'MANAGER'],
  'match-participants.delete': ['ADMIN'],
  
  // Users
  'users.view': ['ADMIN'],
  'users.create': ['ADMIN'],
  'users.edit': ['ADMIN'],
  'users.delete': ['ADMIN'],
  'users.manage': ['ADMIN'],
  
  // Playgrounds
  'playgrounds.view': ['ADMIN', 'MANAGER'],
  'playgrounds.create': ['ADMIN', 'MANAGER'],
  'playgrounds.edit': ['ADMIN', 'MANAGER'],
  'playgrounds.delete': ['ADMIN'],
  
  // Achievements
  'achievements.view': ['ADMIN', 'MANAGER', 'COACH', 'PLAYER'],
  'achievements.create': ['ADMIN', 'MANAGER'],
  'achievements.edit': ['ADMIN', 'MANAGER'],
  'achievements.delete': ['ADMIN'],
  
  // Regions
  'regions.view': ['ADMIN', 'MANAGER'],
  'regions.create': ['ADMIN'],
  'regions.edit': ['ADMIN'],
  'regions.delete': ['ADMIN'],
  
  // Cities
  'cities.view': ['ADMIN', 'MANAGER'],
  'cities.create': ['ADMIN'],
  'cities.edit': ['ADMIN'],
  'cities.delete': ['ADMIN'],
  
  // Countries
  'countries.view': ['ADMIN', 'MANAGER'],
  'countries.create': ['ADMIN'],
  'countries.edit': ['ADMIN'],
  'countries.delete': ['ADMIN'],
  
  // Files
  'files.view': ['ADMIN', 'CONTENT_EDITOR'],
  'files.upload': ['ADMIN', 'CONTENT_EDITOR'],
  'files.delete': ['ADMIN'],
  
  // News
  'news.view': ['ADMIN', 'CONTENT_EDITOR'],
  'news.create': ['ADMIN', 'CONTENT_EDITOR'],
  'news.edit': ['ADMIN', 'CONTENT_EDITOR'],
  'news.delete': ['ADMIN'],
  'news.publish': ['ADMIN', 'CONTENT_EDITOR'],
  
  // Favorites
  'favorites.view': ['ADMIN', 'CONTENT_EDITOR'],
  'favorites.manage': ['ADMIN', 'CONTENT_EDITOR'],
  
  // Analytics
  'analytics.view': ['ADMIN', 'ANALYST', 'MANAGER'],
  'analytics.export': ['ADMIN', 'ANALYST'],
  
  // Permissions
  'permissions.view': ['ADMIN'],
  'permissions.manage': ['ADMIN'],
};

// Маппинг разделов сайдбара к разрешениям
export const sidebarPermissions: Record<string, Permission> = {
  'teams': 'teams.view',
  'players': 'players.view',
  'matches': 'matches.view',
  'tournaments': 'tournaments.view',
  'tournamentCategories': 'tournament-categories.view',
  'sportClubs': 'sport-clubs.view',
  'sportTypes': 'sport-types.view',
  'match-participants': 'match-participants.view',
  'users': 'users.view',
  'playgrounds': 'playgrounds.view',
  'achievements': 'achievements.view',
  'regions': 'regions.view',
  'cities': 'cities.view',
  'countries': 'countries.view',
  'files': 'files.view',
  'news': 'news.view',
  'favorites': 'favorites.view',
  'permissions': 'permissions.view',
};

/**
 * Проверяет, есть ли у пользователя определенное разрешение
 */
export function hasPermission(userRoles: UserRole[], permission: Permission): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  
  const allowedRoles = permissions[permission];
  if (!allowedRoles) {
    return false;
  }
  
  return userRoles.some(role => allowedRoles.includes(role.name as RoleName));
}

/**
 * Проверяет, может ли пользователь видеть определенный раздел в сайдбаре
 */
export function canAccessSidebarItem(userRoles: UserRole[], sidebarItemId: string): boolean {
  const permission = sidebarPermissions[sidebarItemId];
  if (!permission) {
    return false;
  }
  
  return hasPermission(userRoles, permission);
}

/**
 * Получает все разрешения пользователя
 */
export function getUserPermissions(userRoles: UserRole[]): Permission[] {
  const userPermissions: Permission[] = [];
  
  Object.entries(permissions).forEach(([permission, allowedRoles]) => {
    if (userRoles.some(role => allowedRoles.includes(role.name as RoleName))) {
      userPermissions.push(permission as Permission);
    }
  });
  
  return userPermissions;
}

/**
 * Проверяет, имеет ли пользователь хотя бы одну из ролей
 */
export function hasAnyRole(userRoles: UserRole[], requiredRoles: RoleName[]): boolean {
  return userRoles.some(role => requiredRoles.includes(role.name as RoleName));
}

/**
 * Проверяет, имеет ли пользователь все указанные роли
 */
export function hasAllRoles(userRoles: UserRole[], requiredRoles: RoleName[]): boolean {
  return requiredRoles.every(requiredRole => 
    userRoles.some(role => role.name === requiredRole)
  );
}
