import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PlayerForm from '../../components/players/PlayerForm';
import PlayerAchievements from '../../components/players/PlayerAchievements';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FileUpload from '../../components/ui/FileUpload';
import ImageDisplay from '../../components/ui/ImageDisplay';
import Modal from '../../components/ui/Modal';
import { usePlayerStore } from '../../store/playerStore';
import { type FileType } from '../../types/files';
import type { PlayerUpdateRequest } from '../../types/players';

const PlayerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const playerId = id ? parseInt(id) : -1;
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentPlayer, isLoading, error, fetchPlayer, updatePlayer, deletePlayer } = usePlayerStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAvatarUpload, setShowAvatarUpload] = useState(false);

    useEffect(() => {
        if (playerId > 0) {
            fetchPlayer(playerId);
        }
    }, [playerId, fetchPlayer]);

    const handleUpdatePlayer = async (data: PlayerUpdateRequest) => {
        if (playerId > 0) {
            const success = await updatePlayer(playerId, data);
            if (success) {
                setIsEditing(false);
            }
        }
    };

    const handleDeletePlayer = async () => {
        if (playerId > 0) {
            const success = await deletePlayer(playerId);
            if (success) {
                navigate('/dashboard/players');
            }
        }
    };

    const handleAvatarUpload = (fileIds: number[]) => {
        if (fileIds.length > 0) {
            // Here you could update the player with the new avatar ID
            // For now, we'll just close the upload modal
            setShowAvatarUpload(false);
        }
    };

    const handleAvatarError = (error: string) => {
        console.error('Avatar upload error:', error);
    };

    // Helper function to get player display name - fix for API bug where fullName="Unknown" and real name is in position
    const getPlayerDisplayName = (player: any) => {
        // If fullName exists and is not "Unknown" or "string", use it
        if (player.fullName && player.fullName !== "Unknown" && player.fullName !== "string") {
            return player.fullName;
        }
        // If position field has actual data (not "string"), use it as name
        if (player.position && player.position !== "string") {
            return player.position;
        }
        // Fallback to player ID if available
        return player.id ? `Player #${player.id}` : t('players.unknownPlayer') || 'Unknown Player';
    };

    const getPreferredFootLabel = (foot: string) => {
        switch (foot) {
            case 'LEFT': return t('players.leftFoot');
            case 'RIGHT': return t('players.rightFoot');
            case 'BOTH': return t('players.bothFeet');
            default: return foot;
        }
    };



    // Helper function to translate position
    const translatePosition = (position: string) => {
        const positionMap: Record<string, string> = {
            'GOALKEEPER': t('players.positions.goalkeeper'),
            'CENTER_BACK': t('players.positions.centerBack'),
            'LEFT_BACK': t('players.positions.leftBack'),
            'RIGHT_BACK': t('players.positions.rightBack'),
            'LEFT_WING_BACK': t('players.positions.leftWingBack'),
            'RIGHT_WING_BACK': t('players.positions.rightWingBack'),
            'CENTRAL_DEFENSIVE_MIDFIELDER': t('players.positions.centralDefensiveMidfielder'),
            'CENTRAL_MIDFIELDER': t('players.positions.centralMidfielder'),
            'LEFT_MIDFIELDER': t('players.positions.leftMidfielder'),
            'RIGHT_MIDFIELDER': t('players.positions.rightMidfielder'),
            'CENTRAL_ATTACKING_MIDFIELDER': t('players.positions.centralAttackingMidfielder'),
            'LEFT_WING': t('players.positions.leftWing'),
            'RIGHT_WING': t('players.positions.rightWing'),
            'STRIKER': t('players.positions.striker'),
            'CENTER_FORWARD': t('players.positions.centerForward')
        };
        return positionMap[position] || position;
    };

    // Helper function to get player position
    const getPlayerPosition = (player: any) => {
        // If fullName is "Unknown" or "string", then position field might contain the name, not the position
        if (player.fullName === "Unknown" || player.fullName === "string") {
            // If position field also has placeholder data, return not specified
            if (player.position === "string") {
                return t('common.notSpecified');
            }
            // If position has real data but fullName is placeholder, position might be the actual name
            // Return not specified as fallback
            return t('common.notSpecified');
        }
        // If fullName is valid, then position field should contain actual position
        const position = player.position && player.position !== "string" ? player.position : '';
        return position ? translatePosition(position) : t('common.notSpecified');
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

    if (error) {
        return (
            <div className="bg-red-500/20 border border-red-500 p-4 rounded-md text-red-500">
                <p>{error}</p>
                <Link to="/dashboard/players" className="mt-4 inline-block text-gold hover:underline">
                    {t('common.backToList')}
                </Link>
            </div>
        );
    }

    if (!currentPlayer) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400 mb-4">{t('players.notFound')}</p>
                <Link to="/dashboard/players" className="text-gold hover:underline">
                    {t('common.backToList')}
                </Link>
            </div>
        );
    }

    // Breadcrumb items
    const breadcrumbItems = [
        { label: t('sidebar.home'), path: '/dashboard' },
        { label: t('sidebar.players'), path: '/dashboard/players' },
        { label: currentPlayer ? getPlayerDisplayName(currentPlayer) : t('players.playerDetails') }
    ];

    return (
        <div>
            {/* Breadcrumbs */}
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <Link to="/dashboard/players" className="text-gray-400 hover:text-white mr-4 p-2 rounded-full hover:bg-darkest-bg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gold to-yellow-500 bg-clip-text text-transparent">
                            {getPlayerDisplayName(currentPlayer)}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">{t('players.playerDetails')}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-gold text-darkest-bg px-6 py-3 rounded-lg hover:bg-gold/90 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                        {t('common.edit')}
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        {t('common.delete')}
                    </button>
                </div>
            </div>

            {/* Player Details - Новый адаптивный дизайн */}
            <div className="space-y-6">
                {/* Главная информация - карточка профиля */}
                <div className="bg-gradient-to-r from-card-bg to-darkest-bg rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Аватар и основная информация */}
                            <div className="flex flex-col items-center text-center md:text-left">
                                <div className="relative">
                                    <ImageDisplay
                                        objectId={playerId}
                                        type={'user-avatar' as FileType}
                                        alt={`${getPlayerDisplayName(currentPlayer)} avatar`}
                                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-gold shadow-lg"
                                        fallbackSrc="/default-avatar.png"
                                    />
                                    <button
                                        onClick={() => setShowAvatarUpload(true)}
                                        className="absolute bottom-0 right-0 bg-gold text-darkest-bg rounded-full p-2 hover:bg-gold/90 transition-colors shadow-lg"
                                        title={t('players.changeAvatar')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gold">
                                        {getPlayerDisplayName(currentPlayer)}
                                    </h2>
                                    <p className="text-lg text-gray-300 mt-1">
                                        {getPlayerPosition(currentPlayer)}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        #{currentPlayer.id}
                                    </p>
                                </div>
                            </div>

                            {/* Быстрая статистика */}
                            <div className="flex-1 w-full">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-darkest-bg/50 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-gold">{currentPlayer.age}</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wide">{t('players.age')}</div>
                                    </div>
                                    <div className="bg-darkest-bg/50 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-gold">{currentPlayer.height}</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wide">{t('players.height')} см</div>
                                    </div>
                                    <div className="bg-darkest-bg/50 rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-gold">{currentPlayer.weight}</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wide">{t('players.weight')} кг</div>
                                    </div>
                                    <div className="bg-darkest-bg/50 rounded-lg p-4 text-center col-span-2 md:col-span-1">
                                        <div className="text-lg font-bold text-gold">{getPreferredFootLabel(currentPlayer.preferredFoot)}</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wide">{t('players.preferredFoot')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Детальная информация в сетке */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Основная информация */}
                    <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-gold to-yellow-500 p-4">
                            <h3 className="text-darkest-bg font-bold text-lg flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                {t('players.basicInfo')}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400 font-medium">{t('players.position')}:</span>
                                <span className="text-white font-semibold">{getPlayerPosition(currentPlayer)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400 font-medium">{t('players.age')}:</span>
                                <span className="text-white font-semibold">{currentPlayer.age}</span>
                            </div>
                            {currentPlayer.number !== undefined && currentPlayer.number !== 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                    <span className="text-gray-400 font-medium">{t('players.number')}:</span>
                                    <span className="text-gold font-bold">#{currentPlayer.number}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400 font-medium">ID:</span>
                                <span className="text-gold font-bold">#{currentPlayer.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Физические данные */}
                    <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
                            <h3 className="text-white font-bold text-lg flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.254 48.254 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.589-1.202L18.75 4.97z" />
                                </svg>
                                {t('players.physicalData')}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {currentPlayer.height && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                    <span className="text-gray-400 font-medium">{t('players.height')}:</span>
                                    <span className="text-white font-semibold">{currentPlayer.height} см</span>
                                </div>
                            )}
                            {currentPlayer.weight && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                    <span className="text-gray-400 font-medium">{t('players.weight')}:</span>
                                    <span className="text-white font-semibold">{currentPlayer.weight} кг</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400 font-medium">{t('players.preferredFoot')}:</span>
                                <span className="text-white font-semibold">{getPreferredFootLabel(currentPlayer.preferredFoot)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Информация о национальности */}
                <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                        <h3 className="text-white font-bold text-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9z" />
                            </svg>
                            {t('players.nationalityInfo')}
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400 font-medium">{t('players.nationality')}:</span>
                            <span className="text-white font-semibold">{currentPlayer.nationality && currentPlayer.nationality !== "string" ? currentPlayer.nationality : t('common.notSpecified')}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400 font-medium">{t('players.birthplace')}:</span>
                            <span className="text-white font-semibold">{currentPlayer.birthplace && currentPlayer.birthplace !== "string" ? currentPlayer.birthplace : t('common.notSpecified')}</span>
                        </div>
                    </div>
                </div>

                {/* Биография - полная ширина */}
                <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                        <h3 className="text-white font-bold text-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            {t('players.biography')}
                        </h3>
                    </div>
                    <div className="p-6">
                        {currentPlayer.bio && currentPlayer.bio !== "string" ? (
                            <p className="text-gray-300 leading-relaxed text-base">{currentPlayer.bio}</p>
                        ) : (
                            <p className="text-gray-400 italic text-center py-8">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25l-4.5-4.5m0 0l-4.5 4.5L8.25 15l1.875-1.875L8.25 11.25z" />
                                </svg>
                                {t('players.noBio')}
                            </p>
                        )}
                    </div>
                </div>

                {/* Player Achievements */}
                <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gold to-yellow-600 p-4">
                        <h3 className="text-darkest-bg font-bold text-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52a6.003 6.003 0 00-4.334 5.749 7.951 7.951 0 01-1.993-1.35A7.954 7.954 0 003.94 6.42c1.021-.13 2.042-.314 3.061-.555M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236C7.176 3.928 9.324 3.75 11.6 3.75h.8c2.276 0 4.424.178 6.35.486M19.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 014.334 5.749 7.951 7.951 0 001.993-1.35A7.954 7.954 0 0020.06 6.42c-1.021-.13-2.042-.314-3.061-.555M19.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228" />
                            </svg>
                            {t('achievements.achievementsTitle')}
                        </h3>
                    </div>
                    <div className="p-6">
                        <PlayerAchievements playerId={playerId} />
                    </div>
                </div>
            </div>

            {/* Edit Player Modal */}
            <Modal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                title={t('players.editPlayer')}
            >
                <PlayerForm
                    initialData={currentPlayer}
                    onSubmit={handleUpdatePlayer}
                    onCancel={() => setIsEditing(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal - Улучшенный дизайн */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={t('players.confirmDelete')}
            >
                <div className="p-4">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2">{t('common.warning')}</h3>
                    <p className="text-gray-300 text-center mb-8 leading-relaxed">
                        {t('players.deleteWarningDetail', { position: getPlayerDisplayName(currentPlayer) })}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDeletePlayer}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Avatar Upload Modal - Улучшенный дизайн */}
            <Modal
                isOpen={showAvatarUpload}
                onClose={() => setShowAvatarUpload(false)}
                title={t('players.changeAvatar')}
            >
                <div className="p-4 space-y-6">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gold rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-darkest-bg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{t('players.changeAvatar')}</h3>
                        <p className="text-gray-400 text-sm">{t('players.uploadAvatarHint') || 'Upload a new avatar for the player'}</p>
                    </div>
                    
                    <FileUpload
                        type={'user-avatar' as FileType}
                        objectId={playerId}
                        accept="image/*"
                        maxSize={5}
                        onUploadComplete={handleAvatarUpload}
                        onUploadError={handleAvatarError}
                        className="h-48 border-2 border-dashed border-gold/30 rounded-lg hover:border-gold/50 transition-colors"
                    >
                        <div className="text-center p-8">
                            <svg className="w-16 h-16 text-gold mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-gold font-medium mb-1">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-400">
                                PNG, JPG up to 5MB
                            </p>
                        </div>
                    </FileUpload>

                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowAvatarUpload(false)}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PlayerDetailPage;
