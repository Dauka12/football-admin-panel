import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PlayerForm from '../../components/players/PlayerForm';
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
    const { t, i18n } = useTranslation();
    const { currentPlayer, isLoading, error, fetchPlayer, updatePlayer, deletePlayer } = usePlayerStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAvatarUpload, setShowAvatarUpload] = useState(false);

    // Check if current language is Russian for adaptive text sizing
    const isRussian = i18n.language === 'ru';

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

    const getPreferredFootLabel = (foot: string) => {
        switch (foot) {
            case 'LEFT': return t('players.leftFoot');
            case 'RIGHT': return t('players.rightFoot');
            case 'BOTH': return t('players.bothFeet');
            default: return foot;
        }
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
        { label: currentPlayer ? currentPlayer.position : t('players.playerDetails') }
    ];

    return (
        <div>
            {/* Breadcrumbs */}
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <div className="flex items-center">
                    <Link to="/dashboard/players" className="text-gray-400 hover:text-white mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <h1 className={`text-2xl font-bold ${isRussian ? 'text-xl' : 'text-2xl'}`}>
                        {t('players.playerDetails')}: {currentPlayer.position}
                    </h1>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-gold text-darkest-bg px-3 py-1.5 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                        {t('common.edit')}
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-accent-pink text-white px-3 py-1.5 rounded-md hover:bg-accent-pink/90 transition-colors duration-200 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        {t('common.delete')}
                    </button>
                </div>
            </div>

            {/* Player Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Basic Info */}
                <div className="bg-card-bg rounded-lg shadow-md overflow-hidden">
                    <div className="bg-darkest-bg p-3 border-b border-gray-700">
                        <h3 className="text-gold font-medium text-sm md:text-base">{t('players.basicInfo')}</h3>
                    </div>

                    <div className="p-3">
                        <div className="space-y-3">
                            {/* Player Avatar */}
                            <div className="flex flex-col items-center space-y-2 pb-3 border-b border-gray-700">
                                <div className="relative">
                                    <ImageDisplay
                                        objectId={playerId}
                                        type={'user-avatar' as FileType}
                                        alt={`${currentPlayer.position} avatar`}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gold"
                                        fallbackSrc="/default-avatar.png"
                                    />
                                    <button
                                        onClick={() => setShowAvatarUpload(true)}
                                        className="absolute bottom-0 right-0 bg-gold text-darkest-bg rounded-full p-1 hover:bg-gold/90 transition-colors"
                                        title={t('players.changeAvatar')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="font-medium text-center">{currentPlayer.position}</p>
                            </div>

                            <div className="grid grid-cols-[auto,1fr] items-baseline gap-x-2">
                                <span className={`text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`}>{t('players.position')}:</span>
                                <p className="font-medium text-sm overflow-hidden text-ellipsis">{currentPlayer.position}</p>
                            </div>

                            <div className="grid grid-cols-[auto,1fr] items-baseline gap-x-2">
                                <span className={`text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`}>{t('players.club')}:</span>
                                <p className="font-medium text-sm overflow-hidden text-ellipsis">{currentPlayer.club}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <span className={`text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'} block`}>{t('players.age')}:</span>
                                    <p className="font-medium text-sm">{currentPlayer.age}</p>
                                </div>

                                <div>
                                    <span className={`text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'} block`}>{t('players.height')}:</span>
                                    <p className="font-medium text-sm">{currentPlayer.height} cm</p>
                                </div>

                                <div>
                                    <span className={`text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'} block`}>{t('players.weight')}:</span>
                                    <p className="font-medium text-sm">{currentPlayer.weight} kg</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nationality Info */}
                <div className="bg-card-bg rounded-lg shadow-md overflow-hidden">
                    <div className="bg-darkest-bg p-3 border-b border-gray-700">
                        <h3 className="text-gold font-medium text-sm md:text-base">{t('players.nationalityInfo')}</h3>
                    </div>

                    <div className="p-3">
                        <div className="space-y-3">
                            <div className="grid grid-cols-[auto,1fr] items-baseline gap-x-2">
                                <span className={`text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`}>{t('players.nationality')}:</span>
                                <p className="font-medium text-sm overflow-hidden text-ellipsis">{currentPlayer.nationality}</p>
                            </div>

                            <div className="grid grid-cols-[auto,1fr] items-baseline gap-x-2">
                                <span className={`text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`}>{t('players.birthplace')}:</span>
                                <p className="font-medium text-sm overflow-hidden text-ellipsis">{currentPlayer.birthplace}</p>
                            </div>

                            <div className="grid grid-cols-[auto,1fr] items-baseline gap-x-2">
                                <span className={`text-gray-400 ${isRussian ? 'text-xs' : 'text-sm'}`}>{t('players.preferredFoot')}:</span>
                                <p className="font-medium text-sm">{getPreferredFootLabel(currentPlayer.preferredFoot)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div className="bg-card-bg rounded-lg shadow-md overflow-hidden">
                    <div className="bg-darkest-bg p-3 border-b border-gray-700">
                        <h3 className="text-gold font-medium text-sm md:text-base">{t('players.biography')}</h3>
                    </div>

                    <div className="p-3">
                        {currentPlayer.bio ? (
                            <p className="text-sm">{currentPlayer.bio}</p>
                        ) : (
                            <p className="text-gray-400 italic text-sm">{t('players.noBio')}</p>
                        )}
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

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={t('players.confirmDelete')}
            >
                <div>
                    <p className="text-gray-300 mb-6">
                        {t('players.deleteWarningDetail', { position: currentPlayer.position })}
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDeletePlayer}
                            className="px-4 py-2 bg-accent-pink text-white rounded-md hover:bg-accent-pink/90 transition-colors duration-200"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Avatar Upload Modal */}
            <Modal
                isOpen={showAvatarUpload}
                onClose={() => setShowAvatarUpload(false)}
                title={t('players.changeAvatar')}
            >
                <div className="space-y-4">
                    <FileUpload
                        type={'user-avatar' as FileType}
                        objectId={playerId}
                        accept="image/*"
                        maxSize={5}
                        onUploadComplete={handleAvatarUpload}
                        onUploadError={handleAvatarError}
                        className="h-40"
                    >
                        <div className="text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-gray-600">
                                {t('players.uploadAvatarHint')}
                            </p>
                        </div>
                    </FileUpload>

                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setShowAvatarUpload(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
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
