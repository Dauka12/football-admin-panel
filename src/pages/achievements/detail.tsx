
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AchievementForm } from '../../components/achievements/AchievementForm';
import Modal from '../../components/ui/Modal';
import { useAchievementStore } from '../../store/achievementStore';
import { usePlayerStore } from '../../store/playerStore';
import { formatDateTime } from '../../utils/dateUtils';

const AchievementDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const {
        currentAchievement,
        isLoading,
        error,
        fetchAchievementById,
        updateAchievement,
        deleteAchievement
    } = useAchievementStore();
    
    const { players, fetchPlayers } = usePlayerStore();
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchAchievementById(parseInt(id));
        }
        fetchPlayers(false, 0, 1000);
    }, [id, fetchAchievementById, fetchPlayers]);

    const handleUpdateAchievement = async (data: any) => {
        if (currentAchievement) {
            await updateAchievement(currentAchievement.id, data);
            setIsEditModalOpen(false);
        }
    };

    const handleDeleteAchievement = async () => {
        if (currentAchievement) {
            await deleteAchievement(currentAchievement.id);
            navigate('/dashboard/achievements');
        }
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <svg className="animate-spin h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    if (error || !currentAchievement) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-1">
                    {t('achievements.notFound')}
                </h3>
                <p className="text-gray-400 mb-4">
                    {error || t('achievements.achievementNotFoundDescription')}
                </p>
                <Link
                    to="/dashboard/achievements"
                    className="bg-gold text-darkest-bg px-6 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
                >
                    {t('achievements.backToList')}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                    <li>
                        <Link to="/dashboard/achievements" className="text-gray-400 hover:text-white transition-colors duration-200">
                            {t('achievements.title')}
                        </Link>
                    </li>
                    <li>
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                        </svg>
                    </li>
                    <li>
                        <span className="text-gray-300" aria-current="page">
                            {currentAchievement.title}
                        </span>
                    </li>
                </ol>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center">
                    <div className="text-3xl mr-4">
                        {getCategoryIcon(currentAchievement.category)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{currentAchievement.title}</h1>
                        <p className="text-gray-400 mt-1">
                            {t(`achievements.categories.${currentAchievement.category}`)}
                        </p>
                    </div>
                    {currentAchievement.featured && (
                        <div className="ml-4 flex items-center bg-gold/20 text-gold px-3 py-1 rounded-md text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                            {t('achievements.featured')}
                        </div>
                    )}
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        {t('common.edit')}
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        {t('common.delete')}
                    </button>
                </div>
            </div>

            {/* Achievement Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-3">{t('achievements.description')}</h3>
                        <p className="text-gray-300 leading-relaxed">{currentAchievement.description}</p>
                    </div>

                    {/* Achievement Details */}
                    <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">{t('achievements.details')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-400">{t('achievements.category')}</label>
                                    <p className="text-white mt-1">{t(`achievements.categories.${currentAchievement.category}`)}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">{t('achievements.achievementDate')}</label>
                                    <p className="text-white mt-1">{formatDateTime(currentAchievement.achievementDate)}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-400">{t('achievements.points')}</label>
                                    <p className="text-white mt-1">{currentAchievement.points || t('achievements.noPoints')}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">{t('achievements.createdAt')}</label>
                                    <p className="text-white mt-1">{formatDateTime(currentAchievement.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Player Information */}
                    <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">{t('achievements.player')}</h3>
                        <div className="text-center">
                            <Link
                                to={`/dashboard/players/${currentAchievement.playerId}`}
                                className="text-gold hover:text-gold/80 transition-colors duration-200 text-lg font-medium"
                            >
                                {getPlayerName(currentAchievement.playerId)}
                            </Link>
                            <p className="text-gray-400 text-sm mt-1">{t('achievements.clickToViewPlayer')}</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">{t('achievements.quickStats')}</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">{t('achievements.type')}</span>
                                <span className="text-white">
                                    {currentAchievement.featured ? t('achievements.featured') : t('achievements.regular')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">{t('achievements.points')}</span>
                                <span className="text-gold font-medium">
                                    {currentAchievement.points > 0 ? currentAchievement.points : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">{t('achievements.playerId')}</span>
                                <span className="text-white">#{currentAchievement.playerId}</span>
                            </div>
                        </div>
                    </div>

                    {/* Achievement Category Info */}
                    <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">{t('achievements.categoryInfo')}</h3>
                        <div className="text-center">
                            <div className="text-4xl mb-3">
                                {getCategoryIcon(currentAchievement.category)}
                            </div>
                            <p className="text-white font-medium">
                                {t(`achievements.categories.${currentAchievement.category}`)}
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                {t(`achievements.categoryDescriptions.${currentAchievement.category}`)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Achievement Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={t('achievements.editAchievement')}
            >
                <AchievementForm
                    achievement={currentAchievement}
                    onSubmit={handleUpdateAchievement}
                    onCancel={() => setIsEditModalOpen(false)}
                    isLoading={isLoading}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={t('achievements.confirmDelete')}
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        {t('achievements.deleteWarningDetail', { name: currentAchievement.title })}
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDeleteAchievement}
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

export default AchievementDetailPage;
