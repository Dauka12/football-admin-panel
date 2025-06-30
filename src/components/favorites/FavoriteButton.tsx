import React, { useEffect, useState } from 'react';
import { useFavoriteStore } from '../../store/favoriteStore';
import type { EntityType } from '../../types/favorites';

// Simple heart icons as SVG components
const HeartOutlineIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const HeartSolidIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

interface FavoriteButtonProps {
  entityType: EntityType;
  entityId: number;
  className?: string;
  showLabel?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  entityType,
  entityId,
  className = '',
  showLabel = false
}) => {
  const { favoriteStatus, checkFavoriteStatus, toggleFavorite, isLoading } = useFavoriteStore();
  const [isToggling, setIsToggling] = useState(false);
  
  const favoriteKey = `${entityType}_${entityId}`;
  const isFavorite = favoriteStatus[favoriteKey] || false;

  useEffect(() => {
    // Check favorite status on mount if not already checked
    if (favoriteStatus[favoriteKey] === undefined) {
      checkFavoriteStatus(entityType, entityId);
    }
  }, [entityType, entityId, favoriteKey, favoriteStatus, checkFavoriteStatus]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      await toggleFavorite(entityType, entityId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || isToggling}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200
        ${isFavorite 
          ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
          : 'text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800'
        }
        ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? (
        <HeartSolidIcon className="h-5 w-5" />
      ) : (
        <HeartOutlineIcon className="h-5 w-5" />
      )}
      {showLabel && (
        <span className="text-sm">
          {isFavorite ? 'Favorited' : 'Add to favorites'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;
