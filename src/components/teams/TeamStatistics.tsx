import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TeamMatchesResponse } from '../../types/statistics';

interface TeamStatisticsProps {
    matches: TeamMatchesResponse;
    isLoading: boolean;
    error: string | null;
    onLoadMore?: () => void;
}

const TeamStatistics: React.FC<TeamStatisticsProps> = ({
    matches,
    isLoading,
    error,
    onLoadMore
}) => {
    const { t, i18n } = useTranslation();
    const isRussian = i18n.language === 'ru';

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(isRussian ? 'ru-RU' : 'en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getMatchResult = (teamScore: number, opponentScore: number) => {
        if (teamScore > opponentScore) return 'win';
        if (teamScore < opponentScore) return 'loss';
        return 'draw';
    };

    const getResultColor = (result: string) => {
        switch (result) {
            case 'win': return 'text-green-400 bg-green-400/20';
            case 'loss': return 'text-red-400 bg-red-400/20';
            case 'draw': return 'text-yellow-400 bg-yellow-400/20';
            default: return 'text-gray-400 bg-gray-400/20';
        }
    };

    const getResultText = (result: string) => {
        switch (result) {
            case 'win': return t('statistics.win');
            case 'loss': return t('statistics.loss');
            case 'draw': return t('statistics.draw');
            default: return '';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-card-bg rounded-lg p-6">
                <h2 className={`font-semibold mb-4 ${isRussian ? 'text-lg' : 'text-xl'}`}>
                    {t('statistics.recentMatches')}
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
                    {t('statistics.recentMatches')}
                </h2>
                <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500">
                    {error}
                </div>
            </div>
        );
    }

    if (!matches || !matches.content || matches.content.length === 0) {
        return (
            <div className="bg-card-bg rounded-lg p-6 mt-8">
                <h2 className={`font-semibold mb-4 ${isRussian ? 'text-lg' : 'text-xl'}`}>
                    {t('statistics.recentMatches')}
                </h2>
                <p className="text-gray-400 text-center py-8">{t('statistics.noMatches')}</p>
            </div>
        );
    }

    // Подсчет статистики
    const stats = matches.content.reduce((acc, match) => {
        const result = getMatchResult(match.teamScore, match.opponentScore);
        acc[result] = (acc[result] || 0) + 1;
        acc.goalsFor += match.teamScore;
        acc.goalsAgainst += match.opponentScore;
        return acc;
    }, { win: 0, draw: 0, loss: 0, goalsFor: 0, goalsAgainst: 0 });

    const totalMatches = matches.content.length;
    const winPercentage = totalMatches > 0 ? Math.round((stats.win / totalMatches) * 100) : 0;

    return (
        <div className="space-y-6 mt-6">
            {/* Statistics Overview */}
            <div className="bg-card-bg rounded-lg p-6">
                <h2 className={`font-semibold mb-6 ${isRussian ? 'text-lg' : 'text-xl'} flex items-center`}>
                    <svg className="w-6 h-6 text-gold mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {t('statistics.overview')}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-darkest-bg rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105">
                        <div className="text-2xl font-bold text-gold mb-1">{totalMatches}</div>
                        <div className="text-sm text-gray-400">{t('statistics.totalMatches')}</div>
                    </div>
                    <div className="bg-darkest-bg rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105">
                        <div className="text-2xl font-bold text-green-400 mb-1">{stats.win}</div>
                        <div className="text-sm text-gray-400">{t('statistics.wins')}</div>
                    </div>
                    <div className="bg-darkest-bg rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105">
                        <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.draw}</div>
                        <div className="text-sm text-gray-400">{t('statistics.draws')}</div>
                    </div>
                    <div className="bg-darkest-bg rounded-lg p-4 text-center transform transition-all duration-300 hover:scale-105">
                        <div className="text-2xl font-bold text-red-400 mb-1">{stats.loss}</div>
                        <div className="text-sm text-gray-400">{t('statistics.losses')}</div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-darkest-bg rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-blue-400 mb-1">{winPercentage}%</div>
                        <div className="text-sm text-gray-400">{t('statistics.winRate')}</div>
                    </div>
                    <div className="bg-darkest-bg rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-green-400 mb-1">{stats.goalsFor}</div>
                        <div className="text-sm text-gray-400">{t('statistics.goalsScored')}</div>
                    </div>
                    <div className="bg-darkest-bg rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-red-400 mb-1">{stats.goalsAgainst}</div>
                        <div className="text-sm text-gray-400">{t('statistics.goalsConceded')}</div>
                    </div>
                </div>
            </div>
            

            {/* Recent Matches */}
            <div className="bg-card-bg rounded-lg p-6">
                <h2 className={`font-semibold mb-6 ${isRussian ? 'text-lg' : 'text-xl'} flex items-center`}>
                    <svg className="w-6 h-6 text-gold mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t('statistics.recentMatches')}
                </h2>
                
                <div className="space-y-3">
                    {matches.content.map((match, index) => {
                        const result = getMatchResult(match.teamScore, match.opponentScore);
                        
                        return (
                            <div
                                key={match.matchId}
                                className="bg-darkest-bg rounded-lg p-4 hover:bg-darkest-bg/70 transition-all duration-200 transform hover:scale-[1.02]"
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    animationFillMode: 'both',
                                    animationName: 'fadeInRight',
                                    animationDuration: '0.5s',
                                    animationTimingFunction: 'ease-out'
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getResultColor(result)}`}>
                                            {getResultText(result)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">{match.opponentName}</div>
                                            <div className="text-sm text-gray-400 truncate">{match.tournamentName}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <div className="text-lg font-bold">
                                            <span className={match.teamScore > match.opponentScore ? 'text-green-400' : 
                                                          match.teamScore < match.opponentScore ? 'text-red-400' : 'text-yellow-400'}>
                                                {match.teamScore}
                                            </span>
                                            <span className="text-gray-400 mx-2">-</span>
                                            <span className={match.opponentScore > match.teamScore ? 'text-green-400' : 
                                                          match.opponentScore < match.teamScore ? 'text-red-400' : 'text-yellow-400'}>
                                                {match.opponentScore}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {formatDate(match.matchDate)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Load More Button */}
                {matches.totalElements > matches.content.length && onLoadMore && (
                    <div className="text-center mt-6">
                        <button
                            onClick={onLoadMore}
                            className="bg-gold text-darkest-bg px-6 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 font-medium"
                        >
                            {t('statistics.loadMore')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamStatistics;
