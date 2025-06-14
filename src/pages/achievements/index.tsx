import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AchievementForm } from '../../components/achievements/AchievementForm';
import Modal from '../../components/ui/Modal';
import { useAchievementStore } from '../../store/achievementStore';
import { usePlayerStore } from '../../store/playerStore';
import type { Achievement } from '../../types/achievements';
import { ACHIEVEMENT_CATEGORIES } from '../../types/achievements';
import { formatDateTime } from '../../utils/dateUtils';

const AchievementsPage: React.FC = () => {
    const { t } = useTranslation();
    const {
        achievements,
        isLoading,
        error,
        totalElements,
        totalPages,
        currentPage,
        filters,
        fetchAchievements,
        createAchievement,
        updateAchievement,
        deleteAchievement,
        setFilters,
        clearFilters
    } = useAchievementStore();

    const { players, fetchPlayers } = usePlayerStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'regular'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    useEffect(() => {
        fetchAchievements();
        fetchPlayers(false, 0, 1000); // Load all players for filter dropdown
    }, [fetchAchievements, fetchPlayers]);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            const newFilters = {
                ...filters,
                title: searchQuery || undefined,
                category: selectedCategory || undefined,
                playerId: selectedPlayer ? parseInt(selectedPlayer) : undefined,
                featured: featuredFilter === 'all' ? undefined : featuredFilter === 'featured',
                page: 0
            };
            setFilters(newFilters);
            fetchAchievements(0, filters.size);
        }, 300);

        return () => clearTimeout(delayedSearch);
    }, [searchQuery, selectedCategory, selectedPlayer, featuredFilter, setFilters, fetchAchievements, filters.size]);

    const handlePageChange = (page: number) => {
        fetchAchievements(page, filters.size);
    };

    const handleCreateAchievement = async (data: any) => {
        const achievementId = await createAchievement(data);
        if (achievementId) {
            setIsCreateModalOpen(false);
        }
    };

    const handleUpdateAchievement = async (data: any) => {
        if (selectedAchievement) {
            await updateAchievement(selectedAchievement.id, data);
            setIsEditModalOpen(false);
            setSelectedAchievement(null);
        }
    };

    const handleDeleteAchievement = async (id: number) => {
        await deleteAchievement(id);
        setDeleteConfirmId(null);
    };

    const handleEditClick = (achievement: Achievement) => {
        setSelectedAchievement(achievement);
        setIsEditModalOpen(true);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedPlayer('');
        setFeaturedFilter('all');
        clearFilters();
        fetchAchievements();
    };

    const getPlayerName = (playerId: number) => {
        const player = players.find(p => p.id === playerId);
        return player?.fullName || `Player #${playerId}`;
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
            tournament_winner: '🏆',
            best_player: '⭐',
            top_scorer: '⚽',
            most_assists: '🎯',
            fair_play: '🤝',
            rookie_of_year: '🌟',
            veteran_achievement: '👴',
            team_captain: '👑',
            milestone: '🎖️',
            special_award: '🏅'
        };
        return icons[category] || '🏆';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{t('achievements.title')}</h1>
                    <p className="text-gray-400 mt-1">
                        {t('achievements.description')}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {t('achievements.createAchievement')}
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card-bg rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.228a25.628 25.628 0 004.244.247v.079a25.632 25.632 0 01-4.244.247M15.75 7.228a6.726 6.726 0 01-2.748 1.35m0 0a6.772 6.772 0 01-3.204 0" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-400">{t('achievements.totalAchievements')}</p>
                            <p className="text-xl font-bold text-white">{totalElements}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card-bg rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-gold/20 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gold">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-400">{t('achievements.featuredAchievements')}</p>
                            <p className="text-xl font-bold text-white">{achievements.filter(a => a.featured).length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card-bg rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-400">{t('achievements.uniquePlayers')}</p>
                            <p className="text-xl font-bold text-white">{new Set(achievements.map(a => a.playerId)).size}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card-bg rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-400">{t('achievements.categories')}</p>
                            <p className="text-xl font-bold text-white">{new Set(achievements.map(a => a.category)).size}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card-bg rounded-lg p-4 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('achievements.searchByTitle')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pl-10 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white placeholder-gray-400"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white"
                        >
                            <option value="">{t('achievements.allCategories')}</option>
                            {ACHIEVEMENT_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {t(`achievements.categories.${category}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Player Filter */}
                    <div>
                        <select
                            value={selectedPlayer}
                            onChange={(e) => setSelectedPlayer(e.target.value)}
                            className="w-full px-3 py-2 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white"
                        >
                            <option value="">{t('achievements.allPlayers')}</option>
                            {players.map((player) => (
                                <option key={player.id} value={player.id}>
                                    {player.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Featured Filter */}
                    <div>
                        <select
                            value={featuredFilter}
                            onChange={(e) => setFeaturedFilter(e.target.value as 'all' | 'featured' | 'regular')}
                            className="w-full px-3 py-2 bg-dark-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white"
                        >
                            <option value="all">{t('achievements.allAchievements')}</option>
                            <option value="featured">{t('achievements.featuredOnly')}</option>
                            <option value="regular">{t('achievements.regularOnly')}</option>
                        </select>
                    </div>
                </div>

                {/* Clear Filters Button */}
                {(searchQuery || selectedCategory || selectedPlayer || featuredFilter !== 'all') && (
                    <div className="mt-4">
                        <button
                            onClick={handleClearFilters}
                            className="text-gold hover:text-gold/80 text-sm transition-colors duration-200"
                        >
                            {t('common.clearFilters')}
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <svg className="animate-spin h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

            {/* Achievements List */}
            {!isLoading && achievements.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.228a25.628 25.628 0 004.244.247v.079a25.632 25.632 0 01-4.244.247M15.75 7.228a6.726 6.726 0 01-2.748 1.35m0 0a6.772 6.772 0 01-3.204 0" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-1">
                        {searchQuery || selectedCategory || selectedPlayer || featuredFilter !== 'all'
                            ? t('achievements.noResultsFound')
                            : t('achievements.noAchievements')}
                    </h3>
                    <p className="text-gray-400 mb-4">
                        {searchQuery || selectedCategory || selectedPlayer || featuredFilter !== 'all'
                            ? t('achievements.tryDifferentFilters')
                            : t('achievements.createFirst')}
                    </p>
                    {(!searchQuery && !selectedCategory && !selectedPlayer && featuredFilter === 'all') && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gold text-darkest-bg px-6 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
                        >
                            {t('achievements.createAchievement')}
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement) => (
                        <div key={achievement.id} className="bg-card-bg rounded-lg border border-gray-700 p-6 hover:border-gold/50 transition-colors duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="text-2xl mr-3">
                                        {getCategoryIcon(achievement.category)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{achievement.title}</h3>
                                        <p className="text-sm text-gray-400">
                                            {t(`achievements.categories.${achievement.category}`)}
                                        </p>
                                    </div>
                                </div>
                                {achievement.featured && (
                                    <div className="flex items-center bg-gold/20 text-gold px-2 py-1 rounded-md text-xs">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3 mr-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                        </svg>
                                        {t('achievements.featured')}
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-300 mb-4 text-sm">{achievement.description}</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">{t('achievements.player')}</span>
                                    <Link
                                        to={`/dashboard/players/${achievement.playerId}`}
                                        className="text-gold hover:text-gold/80 transition-colors duration-200"
                                    >
                                        {getPlayerName(achievement.playerId)}
                                    </Link>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">{t('achievements.achievementDate')}</span>
                                    <span className="text-white">{formatDateTime(achievement.achievementDate)}</span>
                                </div>
                                {achievement.points > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">{t('achievements.points')}</span>
                                        <span className="text-gold font-medium">{achievement.points}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Link
                                    to={`/dashboard/achievements/${achievement.id}`}
                                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                                >
                                    {t('common.view')}
                                </Link>
                                <button
                                    onClick={() => handleEditClick(achievement)}
                                    className="text-gold hover:text-gold/80 text-sm transition-colors duration-200"
                                >
                                    {t('common.edit')}
                                </button>
                                <button
                                    onClick={() => setDeleteConfirmId(achievement.id)}
                                    className="text-red-400 hover:text-red-300 text-sm transition-colors duration-200"
                                >
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {t('common.previous')}
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                                currentPage === i
                                    ? 'bg-gold text-darkest-bg'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}

            {/* Create Achievement Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={t('achievements.createAchievement')}
            >
                <AchievementForm
                    onSubmit={handleCreateAchievement}
                    onCancel={() => setIsCreateModalOpen(false)}
                    isLoading={isLoading}
                />
            </Modal>

            {/* Edit Achievement Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedAchievement(null);
                }}
                title={t('achievements.editAchievement')}
            >
                {selectedAchievement && (
                    <AchievementForm
                        achievement={selectedAchievement}
                        onSubmit={handleUpdateAchievement}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setSelectedAchievement(null);
                        }}
                        isLoading={isLoading}
                    />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteConfirmId !== null}
                onClose={() => setDeleteConfirmId(null)}
                title={t('achievements.confirmDelete')}
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        {t('achievements.deleteWarning')}
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={() => deleteConfirmId && handleDeleteAchievement(deleteConfirmId)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AchievementsPage;
