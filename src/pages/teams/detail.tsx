import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TeamForm from '../../components/teams/TeamForm';
import Modal from '../../components/ui/Modal';
import { useTeamStore } from '../../store/teamStore';
import type { UpdateTeamRequest } from '../../types/teams';

const TeamDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const teamId = id ? parseInt(id) : -1;
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentTeam, isLoading, error, fetchTeam, updateTeam, deleteTeam } = useTeamStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (teamId > 0) {
            fetchTeam(teamId);
        }
    }, [teamId, fetchTeam]);

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

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">{t('common.loading')}</div>;
    }

    if (error) {
        return (
            <div className="bg-red-500/20 border border-red-500 p-4 rounded-md text-red-500">
                <p>{error}</p>
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
                        className="bg-gold text-darkest-bg px-3 py-1.5 rounded-md hover:bg-gold/90 transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                        {t('common.edit')}
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-accent-pink text-white px-3 py-1.5 rounded-md hover:bg-accent-pink/90 transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        {t('common.delete')}
                    </button>
                </div>
            </div>

            {/* Team Details */}
            <div className="bg-card-bg rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mr-4"
                            style={{
                                backgroundColor: currentTeam.primaryColor || '#ffcc00',
                                color: currentTeam.secondaryColor || '#002b3d'
                            }}
                        >
                            {currentTeam.avatar ? (
                                <img src={currentTeam.avatar} alt={currentTeam.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <span className="font-bold text-2xl">
                                    {currentTeam.name.substring(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{currentTeam.name}</h2>
                            <div className="flex items-center mt-1">
                                <span
                                    className="h-3 w-3 rounded-full mr-1"
                                    style={{ backgroundColor: currentTeam.primaryColor }}
                                ></span>
                                <span
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: currentTeam.secondaryColor }}
                                ></span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-gray-400 text-sm mb-2">{t('teams.description')}</h3>
                        <p className="text-white">{currentTeam.description}</p>
                    </div>

                    <div>
                        <h3 className="text-gray-400 text-sm mb-2">{t('teams.players')}</h3>
                        {currentTeam.players.length > 0 ? (
                            <div className="bg-darkest-bg rounded-md overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-darkest-bg/50">
                                        <tr>
                                            <th className="px-4 py-2">{t('players.name')}</th>
                                            <th className="px-4 py-2 hidden sm:table-cell">{t('players.position')}</th>
                                            <th className="px-4 py-2 hidden md:table-cell">{t('players.age')}</th>
                                            <th className="px-4 py-2 hidden lg:table-cell">{t('players.nationality')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentTeam.players.map(player => (
                                            <tr key={player.id} className="border-t border-gray-700">
                                                <td className="px-4 py-3">{player.id}</td>
                                                <td className="px-4 py-3 hidden sm:table-cell">{player.position}</td>
                                                <td className="px-4 py-3 hidden md:table-cell">{player.age}</td>
                                                <td className="px-4 py-3 hidden lg:table-cell">{player.nationality}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-400">{t('teams.noPlayers')}</p>
                        )}
                    </div>
                </div>
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
                        players: currentTeam.players.map(p => p.id)
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
