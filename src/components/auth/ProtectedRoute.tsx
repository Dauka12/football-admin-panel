import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import type { Permission, RoleName } from '../../utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: Permission;
  roles?: RoleName[];
  requireAll?: boolean; // Для roles: true = все роли, false = хотя бы одна роль
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Компонент для защиты маршрутов на основе разрешений и ролей
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
  roles,
  requireAll = false,
  fallback,
  redirectTo = '/auth'
}) => {
  const { hasPermission, hasAnyRole, hasAllRoles, isAuthenticated } = usePermissions();
  
  // Проверяем аутентификацию
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Проверяем разрешение
  if (permission && !hasPermission(permission)) {
    return fallback ? <>{fallback}</> : <Navigate to="/dashboard" replace />;
  }
  
  // Проверяем роли
  if (roles && roles.length > 0) {
    const hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
    if (!hasAccess) {
      return fallback ? <>{fallback}</> : <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

/**
 * Компонент для отображения контента только при наличии разрешения
 */
export const PermissionGate: React.FC<{
  children: React.ReactNode;
  permission?: Permission;
  roles?: RoleName[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}> = ({ children, permission, roles, requireAll = false, fallback = null }) => {
  const { hasPermission, hasAnyRole, hasAllRoles } = usePermissions();
  
  // Проверяем разрешение
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  // Проверяем роли
  if (roles && roles.length > 0) {
    const hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }
  
  return <>{children}</>;
};

/**
 * Компонент для отображения сообщения об отсутствии доступа
 */
export const AccessDenied: React.FC<{ message?: string }> = ({ 
  message = "У вас нет доступа к этой странице" 
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 max-w-md mx-auto">
          <svg 
            className="w-16 h-16 text-red-500 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Доступ запрещен</h3>
          <p className="text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
};
