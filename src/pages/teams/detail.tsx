import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TeamForm from '../../components/teams/TeamForm';
import TeamStatistics from '../../components/teams/TeamStatistics';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FileUpload from '../../components/ui/FileUpload';
import ImageDisplay from '../../components/ui/ImageDisplay';
import Modal from '../../components/ui/Modal';
import { usePlayerStore } from '../../store/playerStore';
import { useStatisticsStore } from '../../store/statisticsStore';
import { useTeamStore } from '../../store/teamStore';
import { type FileType } from '../../types/files';
import type { PlayerPublicResponse } from '../../types/players';
import type { UpdateTeamRequest } from '../../types/teams';

const TeamDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const teamId = id ? parseInt(id) : -1;
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { currentTeam, isLoading: teamLoading, error: teamError, fetchTeam, updateTeam, deleteTeam } = useTeamStore();
    const { fetchPlayersByIds } = usePlayerStore();
    const { 
        teamMatches, 
        isTeamMatchesLoading, 
        teamMatchesError, 
        fetchTeamMatches 
    } = useStatisticsStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAvatarUpload, setShowAvatarUpload] = useState(false);
    const [teamPlayers, setTeamPlayers] = useState<PlayerPublicResponse[]>([]);
    const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
    const [playerError, setPlayerError] = useState<string | null>(null);
    
    // Check if current language is Russian for adaptive text sizing
    const isRussian = i18n.language === 'ru';

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

    // Helper function to get player position - since real name might be in position field
    const getPlayerPosition = (player: any) => {
        // If fullName is "Unknown" or "string", then position field might contain the name, not the position
        if (player.fullName === "Unknown" || player.fullName === "string") {
            // If position field also has placeholder data, try to use a meaningful fallback
            if (player.position === "string") {
                return player.club && player.club !== "string" ? player.club : t('common.notSpecified');
            }
            // If position has real data but fullName is placeholder, position might be the actual name
            // In this case, use club as position fallback
            return player.club && player.club !== "string" ? player.club : t('common.notSpecified');
        }
        // If fullName is valid, then position field should contain actual position
        return player.position && player.position !== "string" ? player.position : t('common.notSpecified');
    };

    // Fetch team data - Fixed with useCallback and proper dependency array
    const loadTeam = useCallback(() => {
        if (teamId > 0) {
            fetchTeam(teamId);
        }
    }, [teamId, fetchTeam]);

    useEffect(() => {
        loadTeam();
        // Only run this effect once when the component mounts or when teamId changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamId]);
    
    // Fetch team statistics
    useEffect(() => {
        if (teamId > 0) {
            fetchTeamMatches(teamId);
        }
    }, [teamId]); // Remove fetchTeamMatches from dependencies
    
    // Fetch player details - Fixed to prevent infinite loop
    useEffect(() => {
        const getPlayerDetails = async () => {
            if (currentTeam && Array.isArray(currentTeam.players) && currentTeam.players.length > 0) {
                // Skip if we already have the players loaded
                if (teamPlayers.length > 0) return;
                
                setIsLoadingPlayers(true);
                setPlayerError(null);
                
                try {
                    // Check if players are already full objects or just IDs
                    if (typeof currentTeam.players[0] === 'number') {
                        // If they're IDs, fetch the full player data
                        const playerIds = currentTeam.players as unknown as number[];
                        const players = await fetchPlayersByIds(playerIds);
                        setTeamPlayers(players);
                    } else {
                        // If they're already full objects, use them directly
                        setTeamPlayers(currentTeam.players as unknown as PlayerPublicResponse[]);
                    }
                } catch (error) {
                    console.error("Failed to fetch players:", error);
                    setPlayerError(t('errors.failedToLoadPlayers'));
                } finally {
                    setIsLoadingPlayers(false);
                }
            } else {
                setTeamPlayers([]);
            }
        };

        getPlayerDetails();
    }, [currentTeam, fetchPlayersByIds, t]);

    const handleUpdateTeam = async (data: UpdateTeamRequest) => {
        if (teamId > 0) {
            const success = await updateTeam(teamId, data);
            if (success) {
                setIsEditing(false);
                // Explicitly refresh team data after update
                await fetchTeam(teamId);
                // Also reload players data if player list changed
                if (data.players && currentTeam?.players) {
                    const currentPlayerIds = Array.isArray(currentTeam.players) 
                        ? currentTeam.players.map(p => typeof p === 'number' ? p : p.id)
                        : [];
                    
                    // Check if player list changed
                    if (JSON.stringify(currentPlayerIds) !== JSON.stringify(data.players)) {
                        setTeamPlayers([]); // Clear current players to force reload
                        setIsLoadingPlayers(true); // Show loading indicator
                        try {
                            const players = await fetchPlayersByIds(data.players);
                            setTeamPlayers(players);
                        } catch (error) {
                            console.error("Failed to refresh players:", error);
                            setPlayerError(t('errors.failedToLoadPlayers'));
                        } finally {
                            setIsLoadingPlayers(false);
                        }
                    }
                }
            }
        }
    };

    const handleDeleteTeam = async () => {
        if (teamId > 0) {
            const success = await deleteTeam(teamId);
            if (success) {
                navigate('/dashboard/teams');
            }
        }
    };

    const handleAvatarUpload = (fileIds: number[]) => {
        if (fileIds.length > 0) {
            // Here you could update the team with the new avatar ID
            // For now, we'll just close the upload modal and refresh the team data
            setShowAvatarUpload(false);
            loadTeam(); // Refresh team data to show new avatar
        }
    };

    const handleAvatarError = (error: string) => {
        console.error('Team avatar upload error:', error);
    };

    const handleLoadMore = () => {
        if (teamMatches && !teamMatches.last) {
            fetchTeamMatches(teamId, teamMatches.number + 1);
        }
    };

    // Fix the edit button handler
    const handleEdit = () => {
        setIsEditing(true);
    };

    if (teamLoading) {
        return <div className="flex justify-center items-center h-64">{t('common.loading')}</div>;
    }

    if (teamError) {
        return (
            <div className="bg-red-500/20 border border-red-500 p-4 rounded-md text-red-500">
                <p>{teamError}</p>
                <Link to="/dashboard/teams" className="mt-4 inline-block text-gold hover:underline">
                    {t('common.backToList')}
                </Link>
            </div>
        );
    }

    if (!currentTeam) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400 mb-4">{t('teams.notFound')}</p>
                <Link to="/dashboard/teams" className="text-gold hover:underline">
                    {t('common.backToList')}
                </Link>
            </div>
        );
    }

    // Breadcrumb items
    const breadcrumbItems = [
        { label: t('sidebar.home'), path: '/dashboard' },
        { label: t('sidebar.teams'), path: '/dashboard/teams' },
        { label: currentTeam.name }
    ];

    return (
        <div>
            {/* Breadcrumbs */}
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <div className="flex items-center">
                    <Link to="/dashboard/teams" className="text-gray-400 hover:text-white mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <h1 className={`font-bold ${isRussian ? 'text-xl' : 'text-2xl'}`}>{currentTeam.name}</h1>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={handleEdit} // Use the explicit handler here
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

            {/* Team Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Team Info */}
                <div className="md:col-span-4 bg-card-bg rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="relative">
                            <div
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                                style={{
                                    backgroundColor: currentTeam.primaryColor || '#ffcc00',
                                    color: currentTeam.secondaryColor || '#002b3d'
                                }}
                            >
                                <ImageDisplay
                                    objectId={teamId}
                                    type={'team-avatar' as FileType}
                                    alt={`${currentTeam.name} avatar`}
                                    className="w-full h-full object-cover"
                                    fallbackSrc=""
                                    showLoader={false}
                                />
                                {/* Fallback initials if no avatar */}
                                <span className="font-bold text-2xl md:text-3xl absolute inset-0 flex items-center justify-center">
                                    {currentTeam.name.substring(0, 2).toUpperCase()}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowAvatarUpload(true)}
                                className="absolute bottom-0 right-0 bg-gold text-darkest-bg rounded-full p-1 hover:bg-gold/90 transition-colors"
                                title={t('teams.changeAvatar')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-grow">
                            <h2 className={`font-semibold mb-1 ${isRussian ? 'text-lg' : 'text-xl'}`}>{currentTeam.name}</h2>
                            <div className="flex items-center gap-2 mb-3">
                                <span
                                    className="h-4 w-4 rounded-full border border-white"
                                    style={{ backgroundColor: currentTeam.primaryColor }}
                                    title={t('teams.primaryColor')}
                                ></span>
                                <span
                                    className="h-4 w-4 rounded-full border border-white"
                                    style={{ backgroundColor: currentTeam.secondaryColor }}
                                    title={t('teams.secondaryColor')}
                                ></span>
                            </div>
                            <p className="text-gray-300 text-sm">{currentTeam.description}</p>
                        </div>
                    </div>
                </div>

                {/* Players Header */}
                <div className="md:col-span-4">
                    <h3 className={`font-semibold mb-4 flex items-center ${isRussian ? 'text-lg' : 'text-xl'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gold">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        {t('teams.players')} ({Array.isArray(currentTeam.players) ? currentTeam.players.length : 0})
                    </h3>
                </div>

                {/* Players List */}
                {isLoadingPlayers ? (
                    <div className="md:col-span-4 flex justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : playerError ? (
                    <div className="md:col-span-4 bg-red-500/20 border border-red-500 p-4 rounded-md text-red-500">
                        <p>{playerError}</p>
                    </div>
                ) : !Array.isArray(currentTeam.players) || currentTeam.players.length === 0 ? (
                    <div className="md:col-span-4 text-center py-8">
                        <p className="text-gray-400">{t('teams.noPlayers')}</p>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="mt-4 text-gold hover:underline transition-colors duration-200"
                        >
                            {t('teams.addPlayers')}
                        </button>
                    </div>
                ) : (
                    <>
                        {teamPlayers.map(player => (
                            <div key={player.id} className="bg-card-bg rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:transform hover:scale-103 hover:shadow-lg">
                                <div className="p-3 border-b border-darkest-bg">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gold text-darkest-bg rounded-full flex items-center justify-center font-bold mr-3">
                                            {player.id}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">{getPlayerDisplayName(player)}</h4>
                                            <p className="text-xs text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">{getPlayerPosition(player)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2 sm:p-3">
                                    <div className="grid grid-cols-2 gap-x-1 gap-y-1 text-xs sm:text-sm">
                                        <div>
                                            <span className={`text-gray-400 text-xs block`}>{t('players.age')}:</span>
                                            <p>{player.age}</p>
                                        </div>
                                        <div>
                                            <span className={`text-gray-400 text-xs block`}>{t('players.nationality')}:</span>
                                            <p className="truncate">{player.nationality}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-darkest-bg p-2 sm:p-3">
                                    <Link
                                        to={`/dashboard/players/${player.id}`}
                                        className="text-gold hover:underline text-xs sm:text-sm transition-colors duration-200"
                                    >
                                        {t('common.viewDetails')}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Team Statistics */}
            <TeamStatistics
                matches={teamMatches}
                isLoading={isTeamMatchesLoading}
                error={teamMatchesError}
                onLoadMore={handleLoadMore}
            />

            {/* Edit Team Modal */}
            <Modal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                title={t('teams.editTeam')}
            >
                {currentTeam && (
                    <TeamForm
                        initialData={{
                            name: currentTeam.name,
                            description: currentTeam.description,
                            primaryColor: currentTeam.primaryColor,
                            secondaryColor: currentTeam.secondaryColor,
                            players: Array.isArray(currentTeam.players) 
                                ? currentTeam.players.map(p => typeof p === 'number' ? p : p.id)
                                : []
                        }}
                        currentTeamId={teamId}
                        onSubmit={handleUpdateTeam}
                        onCancel={() => setIsEditing(false)}
                    />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={t('teams.confirmDelete')}
            >
                <div>
                    <p className="text-gray-300 mb-6">{t('teams.deleteWarningDetail', { name: currentTeam.name })}</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDeleteTeam}
                            className="px-4 py-2 bg-accent-pink text-white rounded-md hover:bg-accent-pink/90 transition-colors duration-200"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Team Avatar Upload Modal */}
            <Modal
                isOpen={showAvatarUpload}
                onClose={() => setShowAvatarUpload(false)}
                title={t('teams.changeAvatar')}
            >
                <div className="space-y-4">
                    <FileUpload
                        type={'team-avatar' as FileType}
                        objectId={teamId}
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
                                {t('teams.uploadAvatarHint')}
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

export default TeamDetailPage;
