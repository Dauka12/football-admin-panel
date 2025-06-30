import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { teamApi } from '../../api/teams';
import { playerApi } from '../../api/players';
import { usersApi } from '../../api/users';
import type { 
    CreateMatchParticipantRequest, 
    MatchParticipant, 
    MatchParticipantStatus,
    UpdateMatchParticipantRequest 
} from '../../types/matchParticipants';
import type { TeamFullResponse } from '../../types/teams';
import type { PlayerPublicResponse } from '../../types/players';
import type { User } from '../../types/users';
import { ErrorHandler } from '../../utils/errorHandler';

interface MatchParticipantFormProps {
    initialData?: Partial<MatchParticipant>;
    matchId?: number;
    onSubmit: (data: CreateMatchParticipantRequest | UpdateMatchParticipantRequest) => Promise<void>;
    onCancel: () => void;
}

const MatchParticipantForm: React.FC<MatchParticipantFormProps> = ({
    initialData,
    matchId,
    onSubmit,
    onCancel
}) => {
    const { t } = useTranslation();
    
    const [formData, setFormData] = useState<CreateMatchParticipantRequest>({
        matchId: matchId || initialData?.id || 0,
        teamId: initialData?.teamId || 0,
        playerId: initialData?.playerId || 0,
        userId: initialData?.userId || 0,
        isOrganizer: false,
        status: (initialData?.status as MatchParticipantStatus) || 'CONFIRMED',
        hasPaid: initialData?.hasPaid || false,
        amountPaid: initialData?.amountPaid || 0,
        paymentMethod: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [teams, setTeams] = useState<TeamFullResponse[]>([]);
    const [players, setPlayers] = useState<PlayerPublicResponse[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                
                // Load teams, players, and users in parallel
                const [teamsResponse, playersResponse, usersResponse] = await Promise.all([
                    teamApi.getAll(),
                    playerApi.getAll(),
                    usersApi.getAll()
                ]);
                
                setTeams(teamsResponse.content || []);
                setPlayers(playersResponse.content || []);
                setUsers(usersResponse.content || []);
            } catch (error) {
                ErrorHandler.handle(error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'teamId' || name === 'playerId' || name === 'userId' || name === 'matchId') {
            setFormData(prev => ({ ...prev, [name]: Number(value) || 0 }));
        } else if (name === 'amountPaid') {
            setFormData(prev => ({ ...prev, [name]: Number(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.matchId) {
            newErrors.matchId = t('matchParticipants.validation.matchRequired');
        }

        if (!formData.teamId) {
            newErrors.teamId = t('matchParticipants.validation.teamRequired');
        }

        if (!formData.playerId) {
            newErrors.playerId = t('matchParticipants.validation.playerRequired');
        }

        if (!formData.userId) {
            newErrors.userId = t('matchParticipants.validation.userRequired');
        }

        if (formData.amountPaid < 0) {
            newErrors.amountPaid = t('matchParticipants.validation.amountPaidInvalid');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            ErrorHandler.handle(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Match Information */}
            <div className="bg-darkest-bg p-4 rounded-md">
                <h3 className="text-gold font-medium mb-3">{t('matchParticipants.matchInformation')}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="matchId">
                            {t('matchParticipants.matchId')} *
                        </label>
                        <input
                            type="number"
                            id="matchId"
                            name="matchId"
                            value={formData.matchId}
                            onChange={handleChange}
                            disabled={!!matchId} // Disable if matchId is provided as prop
                            className={`form-input ${errors.matchId ? 'border-red-500' : ''}`}
                        />
                        {errors.matchId && <p className="text-red-500 text-xs mt-1">{errors.matchId}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="status">
                            {t('matchParticipants.status')} *
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="form-input"
                        >
                            <option value="CONFIRMED">{t('matchParticipants.statuses.confirmed')}</option>
                            <option value="WAITING_PAYMENT">{t('matchParticipants.statuses.waitingPayment')}</option>
                            <option value="CANCELLED">{t('matchParticipants.statuses.cancelled')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Participant Details */}
            <div className="bg-darkest-bg p-4 rounded-md">
                <h3 className="text-gold font-medium mb-3">{t('matchParticipants.participantDetails')}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="teamId">
                            {t('matchParticipants.team')} *
                        </label>
                        <select
                            id="teamId"
                            name="teamId"
                            value={formData.teamId || ''}
                            onChange={handleChange}
                            className={`form-input ${errors.teamId ? 'border-red-500' : ''}`}
                        >
                            <option value="">{t('matchParticipants.selectTeam')}</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                        {errors.teamId && <p className="text-red-500 text-xs mt-1">{errors.teamId}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="playerId">
                            {t('matchParticipants.player')} *
                        </label>
                        <select
                            id="playerId"
                            name="playerId"
                            value={formData.playerId || ''}
                            onChange={handleChange}
                            className={`form-input ${errors.playerId ? 'border-red-500' : ''}`}
                        >
                            <option value="">{t('matchParticipants.selectPlayer')}</option>
                            {players.map((player) => (
                                <option key={player.id} value={player.id}>
                                    {player.fullName}
                                </option>
                            ))}
                        </select>
                        {errors.playerId && <p className="text-red-500 text-xs mt-1">{errors.playerId}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="userId">
                            {t('matchParticipants.user')} *
                        </label>
                        <select
                            id="userId"
                            name="userId"
                            value={formData.userId || ''}
                            onChange={handleChange}
                            className={`form-input ${errors.userId ? 'border-red-500' : ''}`}
                        >
                            <option value="">{t('matchParticipants.selectUser')}</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.firstname} {user.lastname}
                                </option>
                            ))}
                        </select>
                        {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId}</p>}
                    </div>
                </div>
            </div>

            {/* Payment Information */}
            <div className="bg-darkest-bg p-4 rounded-md">
                <h3 className="text-gold font-medium mb-3">{t('matchParticipants.paymentInformation')}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="hasPaid"
                            name="hasPaid"
                            checked={formData.hasPaid}
                            onChange={handleChange}
                            className="form-checkbox"
                        />
                        <label htmlFor="hasPaid" className="ml-2 text-sm">
                            {t('matchParticipants.hasPaid')}
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="amountPaid">
                            {t('matchParticipants.amountPaid')}
                        </label>
                        <input
                            type="number"
                            id="amountPaid"
                            name="amountPaid"
                            value={formData.amountPaid}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className={`form-input ${errors.amountPaid ? 'border-red-500' : ''}`}
                        />
                        {errors.amountPaid && <p className="text-red-500 text-xs mt-1">{errors.amountPaid}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="paymentMethod">
                            {t('matchParticipants.paymentMethod')}
                        </label>
                        <input
                            type="text"
                            id="paymentMethod"
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            placeholder={t('matchParticipants.paymentMethodPlaceholder')}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isOrganizer"
                            name="isOrganizer"
                            checked={formData.isOrganizer}
                            onChange={handleChange}
                            className="form-checkbox"
                        />
                        <label htmlFor="isOrganizer" className="ml-2 text-sm">
                            {t('matchParticipants.isOrganizer')}
                        </label>
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-700 pt-4 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-gold text-darkest-bg rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-darkest-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('common.saving')}
                        </>
                    ) : (
                        t('common.save')
                    )}
                </button>
            </div>
        </form>
    );
};

export default MatchParticipantForm;
