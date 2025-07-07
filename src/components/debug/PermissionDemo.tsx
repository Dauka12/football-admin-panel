import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGate } from '../auth/ProtectedRoute';

/**
 * Демонстрационный компонент для проверки системы разрешений
 */
export const PermissionDemo: React.FC = () => {
  const { userRoles, permissions, hasPermission, isAdmin } = usePermissions();

  return (
    <div className="bg-card-bg rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">
        Информация о разрешениях пользователя
      </h3>
      
      {/* Роли пользователя */}
      <div>
        <h4 className="text-lg font-medium text-gold mb-2">Роли:</h4>
        <div className="flex flex-wrap gap-2">
          {userRoles.map((role) => (
            <span
              key={role.id}
              className="px-3 py-1 text-sm font-medium rounded-full bg-gold/20 text-gold border border-gold/30"
            >
              {role.name}
            </span>
          ))}
        </div>
      </div>

      {/* Статус администратора */}
      <div>
        <h4 className="text-lg font-medium text-gold mb-2">Статус:</h4>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
          isAdmin() 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}>
          {isAdmin() ? 'Администратор' : 'Пользователь'}
        </span>
      </div>

      {/* Основные разрешения */}
      <div>
        <h4 className="text-lg font-medium text-gold mb-2">Основные разрешения:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { key: 'teams.view', label: 'Просмотр команд' },
            { key: 'players.view', label: 'Просмотр игроков' },
            { key: 'users.manage', label: 'Управление пользователями' },
            { key: 'news.create', label: 'Создание новостей' },
            { key: 'analytics.view', label: 'Просмотр аналитики' },
            { key: 'permissions.manage', label: 'Управление разрешениями' }
          ].map((permission) => (
            <div
              key={permission.key}
              className={`flex items-center justify-between p-2 rounded-md ${
                hasPermission(permission.key as any)
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              <span className="text-sm">{permission.label}</span>
              <span className="text-xs font-medium">
                {hasPermission(permission.key as any) ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Условно отображаемые блоки */}
      <div>
        <h4 className="text-lg font-medium text-gold mb-2">Условное отображение:</h4>
        
        <PermissionGate permission="users.manage">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-2">
            <p className="text-red-400 text-sm">
              🔒 Этот блок виден только администраторам (users.manage)
            </p>
          </div>
        </PermissionGate>

        <PermissionGate permission="news.create">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-2">
            <p className="text-blue-400 text-sm">
              📝 Этот блок виден редакторам контента (news.create)
            </p>
          </div>
        </PermissionGate>

        <PermissionGate permission="teams.view">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-2">
            <p className="text-green-400 text-sm">
              ⚽ Этот блок виден тем, кто может просматривать команды (teams.view)
            </p>
          </div>
        </PermissionGate>
      </div>

      {/* Общее количество разрешений */}
      <div>
        <h4 className="text-lg font-medium text-gold mb-2">Статистика:</h4>
        <p className="text-gray-300">
          Всего разрешений: <span className="text-white font-medium">{permissions.length}</span>
        </p>
      </div>
    </div>
  );
};
