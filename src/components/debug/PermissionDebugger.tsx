import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuthStore } from '../../store/auth';

/**
 * Компонент отладки разрешений - показывает что видит система
 */
export const PermissionDebugger: React.FC = () => {
  const { user } = useAuthStore();
  const { userRoles, permissions, hasPermission, isAdmin, canAccessSidebarItem } = usePermissions();

  // Не показываем отладчик, если пользователь не админ
  if (!isAdmin()) {
    return null;
  }

  const sidebarItems = [
    'teams', 'players', 'matches', 'tournaments', 'users', 'news', 'files'
  ];

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-sm max-h-96 overflow-y-auto shadow-lg z-50">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <span>🔧</span>
        Debug: Разрешения
      </h3>
      
      {/* Информация о пользователе */}
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-gray-400">Пользователь:</span>
          <div className="text-white">{user?.firstname} {user?.lastname}</div>
        </div>
        
        <div>
          <span className="text-gray-400">Raw role field:</span>
          <div className="text-white font-mono text-xs bg-gray-800 p-1 rounded">
            {JSON.stringify(user?.role)}
          </div>
        </div>
        
        <div>
          <span className="text-gray-400">Parsed roles:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {userRoles.map(role => (
              <span key={role.id} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                {role.name}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <span className="text-gray-400">Права доступа:</span>
          <div className="text-xs space-y-1 mt-1">
            {['teams.view', 'users.manage', 'news.create'].map(permission => (
              <div key={permission} className="flex justify-between">
                <span className="text-gray-300">{permission}:</span>
                <span className={hasPermission(permission as any) ? 'text-green-400' : 'text-red-400'}>
                  {hasPermission(permission as any) ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <span className="text-gray-400">Sidebar доступ:</span>
          <div className="text-xs space-y-1 mt-1">
            {sidebarItems.map(item => (
              <div key={item} className="flex justify-between">
                <span className="text-gray-300">{item}:</span>
                <span className={canAccessSidebarItem(item) ? 'text-green-400' : 'text-red-400'}>
                  {canAccessSidebarItem(item) ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <span className="text-gray-400">Всего разрешений:</span>
          <span className="text-white ml-2">{permissions.length}</span>
        </div>
      </div>
    </div>
  );
};
