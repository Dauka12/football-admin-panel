import { useMemo } from 'react';
import { useAuthStore } from '../store/auth';
import type { Permission, RoleName } from '../utils/permissions';
import { 
  hasPermission, 
  canAccessSidebarItem, 
  getUserPermissions, 
  hasAnyRole, 
  hasAllRoles 
} from '../utils/permissions';

/**
 * Хук для работы с разрешениями пользователя
 */
export function usePermissions() {
  const { user } = useAuthStore();
  
  // Получаем роли пользователя из user (который является LoginResponse)
  const userRoles = useMemo(() => {
    if (!user) return [];
    
    console.log('🔍 usePermissions - user object:', user);
    console.log('🔍 usePermissions - user.role:', user.role);
    
    // Если в LoginResponse есть поле roles как массив объектов
    if ('roles' in user && Array.isArray(user.roles)) {
      console.log('✅ Found roles array:', user.roles);
      return user.roles;
    }
    
    // Если роль хранится как массив строк (как в вашем случае)
    if (user.role && Array.isArray(user.role)) {
      const mappedRoles = user.role.map((roleName, index) => ({
        id: index + 1,
        name: roleName
      }));
      console.log('✅ Mapped roles from array:', mappedRoles);
      return mappedRoles;
    }
    
    // Если роль хранится как строка
    if (user.role && typeof user.role === 'string') {
      const singleRole = [{ id: 1, name: user.role }];
      console.log('✅ Mapped single role:', singleRole);
      return singleRole;
    }
    
    console.log('❌ No roles found');
    return [];
  }, [user]);
  
  const permissions = useMemo(() => {
    const perms = getUserPermissions(userRoles);
    console.log('🔐 Calculated permissions:', perms);
    console.log('🔐 User roles for permissions:', userRoles);
    return perms;
  }, [userRoles]);
  
  return {
    userRoles,
    permissions,
    
    /**
     * Проверяет, есть ли у пользователя конкретное разрешение
     */
    hasPermission: (permission: Permission) => hasPermission(userRoles, permission),
    
    /**
     * Проверяет, может ли пользователь видеть элемент сайдбара
     */
    canAccessSidebarItem: (sidebarItemId: string) => canAccessSidebarItem(userRoles, sidebarItemId),
    
    /**
     * Проверяет, имеет ли пользователь хотя бы одну из ролей
     */
    hasAnyRole: (roles: RoleName[]) => hasAnyRole(userRoles, roles),
    
    /**
     * Проверяет, имеет ли пользователь все указанные роли
     */
    hasAllRoles: (roles: RoleName[]) => hasAllRoles(userRoles, roles),
    
    /**
     * Проверяет, является ли пользователь администратором
     */
    isAdmin: () => hasAnyRole(userRoles, ['ADMIN']),
    
    /**
     * Проверяет, аутентифицирован ли пользователь
     */
    isAuthenticated: () => !!user,
  };
}
