import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { achievementApi } from '../../api/achievements';
import type { Achievement } from '../../types/achievements';
import { LoadingSpinner } from '../ui/LoadingIndicator';

interface PlayerAchievementsProps {
  playerId: number;
}

const PlayerAchievements: React.FC<PlayerAchievementsProps> = ({ playerId }) => {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAchievements = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await achievementApi.getAchievements({ playerId });
        setAchievements(response.content || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load achievements');
      } finally {
        setIsLoading(false);
      }
    };

    if (playerId > 0) {
      loadAchievements();
    }
  }, [playerId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'goal':
      case 'goals':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.75V12a2.25 2.25 0 00-2.25-2.25H8.25A2.25 2.25 0 006 12v.75m12 0V16.5" />
          </svg>
        );
      case 'tournament':
      case 'championship':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52a6.003 6.003 0 00-4.334 5.749 7.951 7.951 0 01-1.993-1.35A7.954 7.954 0 003.94 6.42c1.021-.13 2.042-.314 3.061-.555M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236C7.176 3.928 9.324 3.75 11.6 3.75h.8c2.276 0 4.424.178 6.35.486M19.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 014.334 5.749 7.951 7.951 0 001.993-1.35A7.954 7.954 0 0020.06 6.42c-1.021-.13-2.042-.314-3.061-.555M19.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228" />
          </svg>
        );
      case 'performance':
      case 'skill':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52a6.003 6.003 0 00-4.334 5.749 7.951 7.951 0 01-1.993-1.35A7.954 7.954 0 003.94 6.42c1.021-.13 2.042-.314 3.061-.555M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236C7.176 3.928 9.324 3.75 11.6 3.75h.8c2.276 0 4.424.178 6.35.486M19.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 014.334 5.749 7.951 7.951 0 001.993-1.35A7.954 7.954 0 0020.06 6.42c-1.021-.13-2.042-.314-3.061-.555M19.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 p-4 rounded-md text-red-500">
        {error}
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52a6.003 6.003 0 00-4.334 5.749 7.951 7.951 0 01-1.993-1.35A7.954 7.954 0 003.94 6.42c1.021-.13 2.042-.314 3.061-.555M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236C7.176 3.928 9.324 3.75 11.6 3.75h.8c2.276 0 4.424.178 6.35.486M19.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 014.334 5.749 7.951 7.951 0 001.993-1.35A7.954 7.954 0 0020.06 6.42c-1.021-.13-2.042-.314-3.061-.555M19.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228" />
        </svg>
        <p>{t('achievements.noAchievements')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {achievements.map((achievement) => (
        <div 
          key={achievement.id} 
          className={`bg-card-bg border rounded-lg p-4 transition-all duration-200 hover:shadow-lg ${
            achievement.featured 
              ? 'border-gold shadow-gold/20' 
              : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              achievement.featured 
                ? 'bg-gold/20 text-gold' 
                : 'bg-gray-700 text-gray-300'
            }`}>
              {getCategoryIcon(achievement.category)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-semibold ${achievement.featured ? 'text-gold' : 'text-white'}`}>
                    {achievement.title}
                    {achievement.featured && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gold/20 text-gold">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                        {t('achievements.featured')}
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                </div>
                
                <div className="text-right ml-4">
                  <div className={`text-lg font-bold ${achievement.featured ? 'text-gold' : 'text-green-400'}`}>
                    {achievement.points} {t('achievements.points')}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(achievement.achievementDate)}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  achievement.featured 
                    ? 'bg-gold/20 text-gold border border-gold/30' 
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {achievement.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerAchievements;
