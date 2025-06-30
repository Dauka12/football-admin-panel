import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PlayerStatisticsResponse } from '../../types/statistics';

interface PlayerStatisticsProps {
    playerStats: PlayerStatisticsResponse | null;
    isLoading: boolean;
    error: string | null;
    showTitle?: boolean; // Optional prop to control title display
}

const PlayerStatistics: React.FC<PlayerStatisticsProps> = ({
    playerStats,
    isLoading,
    error,
    showTitle = true
}) => {
    const { t, i18n } = useTranslation();
    const isRussian = i18n.language === 'ru';

    if (isLoading) {
        return (
            <div className={showTitle ? "bg-card-bg rounded-lg p-6" : ""}>
                {showTitle && (
                    <h2 className={`font-semibold mb-4 ${isRussian ? 'text-lg' : 'text-xl'}`}>
                        {t('statistics.playerStatistics')}
                    </h2>
                )}
                <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={showTitle ? "bg-card-bg rounded-lg p-6" : ""}>
                {showTitle && (
                    <h2 className={`font-semibold mb-4 ${isRussian ? 'text-lg' : 'text-xl'}`}>
                        {t('statistics.playerStatistics')}
                    </h2>
                )}
                <div className="text-red-400 text-center py-8">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!playerStats) {
        return (
            <div className={showTitle ? "bg-card-bg rounded-lg p-6" : ""}>
                {showTitle && (
                    <h2 className={`font-semibold mb-4 ${isRussian ? 'text-lg' : 'text-xl'}`}>
                        {t('statistics.playerStatistics')}
                    </h2>
                )}
                <div className="text-gray-400 text-center py-8">
                    <p>{t('statistics.noPlayerStats')}</p>
                </div>
            </div>
        );
    }

    const { statistics } = playerStats;

    return (
        <div className={showTitle ? "bg-card-bg rounded-lg p-6" : ""}>
            {showTitle && (
                <h2 className={`font-semibold mb-6 ${isRussian ? 'text-lg' : 'text-xl'}`}>
                    {t('statistics.playerStatistics')}
                </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Matches Played */}
                <div className="bg-darkest-bg rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                        {statistics.matchesPlayed}
                    </div>
                    <div className="text-sm text-gray-400">
                        {t('statistics.matchesPlayed')}
                    </div>
                </div>

                {/* Goals */}
                <div className="bg-darkest-bg rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <div className="text-2xl font-bold text-green-400 mb-1">
                        {statistics.goals}
                    </div>
                    <div className="text-sm text-gray-400">
                        {t('statistics.goals')}
                    </div>
                </div>

                {/* Assists */}
                <div className="bg-darkest-bg rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                    </div>
                    <div className="text-2xl font-bold text-yellow-400 mb-1">
                        {statistics.assists}
                    </div>
                    <div className="text-sm text-gray-400">
                        {t('statistics.assists')}
                    </div>
                </div>
            </div>

            {/* Player Summary */}
            <div className="mt-6 bg-darkest-bg rounded-lg p-4">
                <h3 className="font-medium mb-3 text-gray-200">
                    {t('statistics.playerSummary')}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">{t('statistics.goalsPerMatch')}:</span>
                        <span className="text-white">
                            {statistics.matchesPlayed > 0 ? (statistics.goals / statistics.matchesPlayed).toFixed(2) : '0.00'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">{t('statistics.assistsPerMatch')}:</span>
                        <span className="text-white">
                            {statistics.matchesPlayed > 0 ? (statistics.assists / statistics.matchesPlayed).toFixed(2) : '0.00'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerStatistics;
