import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TournamentTeamStatistics } from '../../types/statistics';

interface TournamentStatisticsProps {
    stats: TournamentTeamStatistics[];
    isLoading: boolean;
    error: string | null;
}

const TournamentStatistics: React.FC<TournamentStatisticsProps> = ({
    stats,
    isLoading,
    error
}) => {
    const { t, i18n } = useTranslation();
    const isRussian = i18n.language === 'ru';

    const getPositionColor = (index: number) => {
        if (index === 0) return 'text-yellow-400'; // Золото
        if (index === 1) return 'text-gray-300'; // Серебро
        if (index === 2) return 'text-orange-400'; // Бронза
        return 'text-gray-400';
    };

    const getPositionIcon = (index: number) => {
        if (index < 3) {
            return (
                <svg className={`w-5 h-5 ${getPositionColor(index)}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="bg-card-bg rounded-lg p-6">
                <h2 className={`font-semibold mb-4 ${isRussian ? 'text-lg' : 'text-xl'}`}>
                    {t('statistics.tournamentTable')}
                </h2>
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
            <div className="bg-card-bg rounded-lg p-6">
                <h2 className={`font-semibold mb-4 ${isRussian ? 'text-lg' : 'text-xl'}`}>
                    {t('statistics.tournamentTable')}
                </h2>
                <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500">
                    {error}
                </div>
            </div>
        );
    }

    if (!stats || stats.length === 0) {
        return (
            <div className="bg-card-bg rounded-lg p-6">
                <h2 className={`font-semibold mb-4 ${isRussian ? 'text-lg' : 'text-xl'}`}>
                    {t('statistics.tournamentTable')}
                </h2>
                <p className="text-gray-400 text-center py-8">{t('statistics.noStatistics')}</p>
            </div>
        );
    }

    // Сортируем команды по очкам, затем по разности голов
    const sortedStats = [...stats].sort((a, b) => {
        const pointsDiff = b.points - a.points;
        if (pointsDiff !== 0) return pointsDiff;
        
        const goalDiffA = a.goalsFor - a.goalsAgainst;
        const goalDiffB = b.goalsFor - b.goalsAgainst;
        const goalDiffDiff = goalDiffB - goalDiffA;
        if (goalDiffDiff !== 0) return goalDiffDiff;
        
        return b.goalsFor - a.goalsFor;
    });

    return (
        <div className="bg-card-bg rounded-lg p-6">
            <h2 className={`font-semibold mb-6 ${isRussian ? 'text-lg' : 'text-xl'} flex items-center`}>
                <svg className="w-6 h-6 text-gold mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t('statistics.tournamentTable')}
            </h2>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">#</th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">{t('statistics.team')}</th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">{t('statistics.played')}</th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">{t('statistics.wins')}</th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">{t('statistics.draws')}</th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">{t('statistics.losses')}</th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">{t('statistics.goalsFor')}</th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">{t('statistics.goalsAgainst')}</th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">{t('statistics.goalDiff')}</th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">{t('statistics.points')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStats.map((team, index) => {
                            const goalDiff = team.goalsFor - team.goalsAgainst;
                            const isTopThree = index < 3;
                            
                            return (
                                <tr
                                    key={team.teamId}
                                    className={`border-b border-gray-700/50 hover:bg-darkest-bg/30 transition-all duration-200 ${
                                        isTopThree ? 'bg-gradient-to-r from-gold/5 to-transparent' : ''
                                    }`}
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                        animationFillMode: 'both',
                                        animationName: 'fadeInUp',
                                        animationDuration: '0.5s',
                                        animationTimingFunction: 'ease-out'
                                    }}
                                >
                                    <td className="py-3 px-2">
                                        <div className="flex items-center space-x-2">
                                            <span className={`font-bold ${getPositionColor(index)}`}>
                                                {index + 1}
                                            </span>
                                            {getPositionIcon(index)}
                                        </div>
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="font-medium truncate max-w-[120px] sm:max-w-none">
                                            {team.teamName}
                                        </div>
                                    </td>
                                    <td className="py-3 px-2 text-center">{team.gamesPlayed}</td>
                                    <td className="py-3 px-2 text-center text-green-400">{team.wins}</td>
                                    <td className="py-3 px-2 text-center text-yellow-400">{team.draws}</td>
                                    <td className="py-3 px-2 text-center text-red-400">{team.losses}</td>
                                    <td className="py-3 px-2 text-center">{team.goalsFor}</td>
                                    <td className="py-3 px-2 text-center">{team.goalsAgainst}</td>
                                    <td className={`py-3 px-2 text-center font-medium ${
                                        goalDiff > 0 ? 'text-green-400' : 
                                        goalDiff < 0 ? 'text-red-400' : 'text-gray-400'
                                    }`}>
                                        {goalDiff > 0 ? '+' : ''}{goalDiff}
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                        <span className="bg-gold text-darkest-bg px-2 py-1 rounded-full text-sm font-bold">
                                            {team.points}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TournamentStatistics;
