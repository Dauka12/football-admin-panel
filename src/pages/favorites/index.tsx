import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFavoriteStore } from '../../store/favoriteStore';
import FavoritesList from '../../components/favorites/FavoritesList';
import type { EntityType } from '../../types/favorites';

const ENTITY_TYPES: EntityType[] = ['TEAM', 'TOURNAMENT', 'PLAYGROUND', 'MATCH', 'PLAYER', 'SPORT_CLUB'];

export default function FavoritesPage() {
  const { t } = useTranslation();
  const {
    favorites,
    favoritesCount,
    isLoading,
    error,
    getFavorites,
    getFavoritesCount,
    clearError,
    currentPage,
    totalPages,
    pageSize
  } = useFavoriteStore();

  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('TEAM');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load favorites for selected entity type
    getFavorites(selectedEntityType, { page: 0, size: pageSize });
    
    // Load counts for all entity types
    ENTITY_TYPES.forEach(entityType => {
      getFavoritesCount(entityType);
    });
  }, [selectedEntityType, getFavorites, getFavoritesCount, pageSize]);

  const handleEntityTypeChange = (entityType: EntityType) => {
    setSelectedEntityType(entityType);
    setSearchTerm('');
  };

  const handlePageChange = (page: number) => {
    getFavorites(selectedEntityType, { page, size: pageSize });
  };

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

  const filteredFavorites = favorites.filter(favorite => {
    if (!searchTerm) return true;
    return favorite.entityId.toString().includes(searchTerm);
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-red-400">{t('common.error')}</h3>
              <p className="text-red-300 mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('favorites.title')}</h1>
          <p className="text-gray-400">{t('favorites.subtitle')}</p>
        </div>
      </div>

      {/* Entity Type Tabs */}
      <div className="bg-card-bg border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {ENTITY_TYPES.map((entityType) => (
            <button
              key={entityType}
              onClick={() => handleEntityTypeChange(entityType)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${selectedEntityType === entityType
                  ? 'bg-gold text-darkest-bg'
                  : 'bg-darkest-bg text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              {getEntityTypeLabel(entityType)}
              {favoritesCount[entityType] !== undefined && (
                <span className="ml-2 text-xs opacity-75">
                  ({favoritesCount[entityType]})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-card-bg border border-gray-700 rounded-lg p-4 mb-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('favorites.search.placeholder')}
          </label>
          <input
            type="text"
            placeholder={t('favorites.search.byId')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          />
        </div>
      </div>

      {/* Favorites List */}
      <div className="bg-card-bg border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            {getEntityTypeLabel(selectedEntityType)} {t('favorites.title')}
          </h3>
          {filteredFavorites.length > 0 && (
            <span className="text-gray-400 text-sm">
              {filteredFavorites.length} {t('common.items')}
            </span>
          )}
        </div>

        <FavoritesList
          favorites={filteredFavorites}
          loading={isLoading}
          showEntityType={false}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-gray-400 text-sm">
              {t('common.page')} {currentPage + 1} {t('common.of')} {totalPages}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1 bg-darkest-bg text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.previous')}
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 bg-darkest-bg text-gray-300 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
