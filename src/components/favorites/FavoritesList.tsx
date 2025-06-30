import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Favorite, EntityType } from '../../types/favorites';
import FavoriteButton from './FavoriteButton';

interface FavoritesListProps {
  favorites: Favorite[];
  loading?: boolean;
  onItemClick?: (favorite: Favorite) => void;
  showEntityType?: boolean;
}

const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  loading = false,
  onItemClick,
  showEntityType = true
}) => {
  const { t } = useTranslation();

  const getEntityTypeLabel = (entityType: EntityType): string => {
    switch (entityType) {
      case 'TEAM':
        return t('favorites.entityTypes.team');
      case 'TOURNAMENT':
        return t('favorites.entityTypes.tournament');
      case 'PLAYGROUND':
        return t('favorites.entityTypes.playground');
      case 'MATCH':
        return t('favorites.entityTypes.match');
      case 'PLAYER':
        return t('favorites.entityTypes.player');
      case 'SPORT_CLUB':
        return t('favorites.entityTypes.sportClub');
      default:
        return entityType;
    }
  };

  const getEntityTypeColor = (entityType: EntityType): string => {
    switch (entityType) {
      case 'TEAM':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'TOURNAMENT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'PLAYGROUND':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'MATCH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'PLAYER':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'SPORT_CLUB':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-card-bg border border-gray-700 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-20 bg-gray-600 rounded"></div>
                <div className="h-4 w-32 bg-gray-600 rounded"></div>
              </div>
              <div className="h-8 w-8 bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <p className="text-lg text-gray-300 mb-2">{t('favorites.noFavorites')}</p>
        <p className="text-gray-400">{t('favorites.noFavoritesSubtext')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {favorites.map((favorite) => (
        <div
          key={`${favorite.entityType}-${favorite.entityId}`}
          className={`
            bg-card-bg border border-gray-700 rounded-lg p-4 transition-all duration-200
            ${onItemClick ? 'hover:bg-gray-700 cursor-pointer' : ''}
          `}
          onClick={() => onItemClick?.(favorite)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showEntityType && (
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${getEntityTypeColor(favorite.entityType)}
                `}>
                  {getEntityTypeLabel(favorite.entityType)}
                </span>
              )}
              <div>
                <p className="text-white font-medium">
                  {favorite.entityType} ID: {favorite.entityId}
                </p>
                <p className="text-gray-400 text-sm">
                  {t('favorites.addedOn')} {new Date(favorite.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <FavoriteButton
              entityType={favorite.entityType}
              entityId={favorite.entityId}
              className="ml-4"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FavoritesList;
