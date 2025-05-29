import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TeamForm from '../../components/teams/TeamForm';
import Modal from '../../components/ui/Modal';
import { usePlayerStore } from '../../store/playerStore';
import { useTeamStore } from '../../store/teamStore';
import type { PlayerPublicResponse } from '../../types/players';
import type { UpdateTeamRequest } from '../../types/teams';

const TeamDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const teamId = id ? parseInt(id) : -1;
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentTeam, isLoading: teamLoading, error: teamError, fetchTeam, updateTeam, deleteTeam } = useTeamStore();
    const { fetchPlayersByIds } = usePlayerStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [teamPlayers, setTeamPlayers] = useState<PlayerPublicResponse[]>([]);
    const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
    const [playerError, setPlayerError] = useState<string | null>(null);

    // Fetch team data
    useEffect(() => {
        if (teamId > 0) {
            fetchTeam(teamId);
        }
    }, [teamId, fetchTeam]);
    
    // Fetch player details when team data is loaded
    useEffect(() => {
        const getPlayerDetails = async () => {
            if (currentTeam && Array.isArray(currentTeam.players) && currentTeam.players.length > 0) {
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Link to="/dashboard/teams" className="text-gray-400 hover:text-white mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <h1 className="text-2xl font-bold">{currentTeam.name}</h1>
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

            {/* Team Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Team Info */}
                <div className="md:col-span-4 bg-card-bg rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center shrink-0"
                            style={{
                                backgroundColor: currentTeam.primaryColor || '#ffcc00',
                                color: currentTeam.secondaryColor || '#002b3d'
                            }}
                        >
                            {currentTeam.avatar ? (
                                <img src={currentTeam.avatar} alt={currentTeam.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <span className="font-bold text-3xl">
                                    {currentTeam.name.substring(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="flex-grow">
                            <h2 className="text-xl font-semibold mb-1">{currentTeam.name}</h2>
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
                            <p className="text-gray-300">{currentTeam.description}</p>
                        </div>
                    </div>
                </div>

                {/* Players Header */}
                <div className="md:col-span-4">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
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
                                <div className="p-4 border-b border-darkest-bg">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gold text-darkest-bg rounded-full flex items-center justify-center font-bold mr-3">
                                            {player.id}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{player.position}</h4>
                                            <p className="text-sm text-gray-400">{player.club}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3">
                                    <div className="grid grid-cols-2 gap-1 text-sm">
                                        <div>
                                            <span className="text-gray-400 text-xs">{t('players.age')}:</span>
                                            <p>{player.age}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-xs">{t('players.nationality')}:</span>
                                            <p>{player.nationality}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-darkest-bg p-3">
                                    <Link
                                        to={`/dashboard/players/${player.id}`}
                                        className="text-gold hover:underline text-sm transition-colors duration-200"
                                    >
                                        {t('common.viewDetails')}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Edit Team Modal */}
            <Modal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                title={t('teams.editTeam')}
            >
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
                    onSubmit={handleUpdateTeam}
                    onCancel={() => setIsEditing(false)}
                />
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
        </div>
    );
};

export default TeamDetailPage;
