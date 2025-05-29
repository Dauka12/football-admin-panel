import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlayerStore } from '../../store/playerStore';
import type { CreateTeamRequest, UpdateTeamRequest } from '../../types/teams';

interface TeamFormProps {
    initialData?: Partial<CreateTeamRequest | UpdateTeamRequest>;
    onSubmit: (data: CreateTeamRequest | UpdateTeamRequest) => Promise<void>;
    onCancel: () => void;
}

const TeamForm: React.FC<TeamFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<CreateTeamRequest>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        players: initialData?.players || [],
        primaryColor: initialData?.primaryColor || '#ffcc00',
        secondaryColor: initialData?.secondaryColor || '#002b3d',
    });
    
    const { players, fetchPlayers, isLoading: playersLoading } = usePlayerStore();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Fetch players when component mounts
    useEffect(() => {
        fetchPlayers();
    }, [fetchPlayers]);
    
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('validations.nameRequired');
        }

        if (!formData.description.trim()) {
            newErrors.description = t('validations.descriptionRequired');
        }

        if (!formData.primaryColor) {
            newErrors.primaryColor = t('validations.colorRequired');
        }

        if (!formData.secondaryColor) {
            newErrors.secondaryColor = t('validations.colorRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const handlePlayerToggle = (playerId: number) => {
        setFormData(prev => {
            const playerExists = prev.players.includes(playerId);
            let updatedPlayers: number[];
            
            if (playerExists) {
                updatedPlayers = prev.players.filter(id => id !== playerId);
            } else {
                updatedPlayers = [...prev.players, playerId];
            }
            
            return {
                ...prev,
                players: updatedPlayers
            };
        });
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
            console.error('Form submission error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                    {t('teams.name')} *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
            ${errors.name ? 'border-red-500' : 'border-gray-700'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1" htmlFor="description">
                    {t('teams.description')} *
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
            ${errors.description ? 'border-red-500' : 'border-gray-700'}`}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="primaryColor">
                        {t('teams.primaryColor')} *
                    </label>
                    <div className="flex space-x-2">
                        <input
                            type="color"
                            id="primaryColor"
                            name="primaryColor"
                            value={formData.primaryColor}
                            onChange={handleChange}
                            className="h-10 w-10 rounded border border-gray-700 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={formData.primaryColor}
                            onChange={handleChange}
                            name="primaryColor"
                            className={`flex-1 px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
                ${errors.primaryColor ? 'border-red-500' : 'border-gray-700'}`}
                        />
                    </div>
                    {errors.primaryColor && <p className="text-red-500 text-xs mt-1">{errors.primaryColor}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="secondaryColor">
                        {t('teams.secondaryColor')} *
                    </label>
                    <div className="flex space-x-2">
                        <input
                            type="color"
                            id="secondaryColor"
                            name="secondaryColor"
                            value={formData.secondaryColor}
                            onChange={handleChange}
                            className="h-10 w-10 rounded border border-gray-700 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={formData.secondaryColor}
                            onChange={handleChange}
                            name="secondaryColor"
                            className={`flex-1 px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
                ${errors.secondaryColor ? 'border-red-500' : 'border-gray-700'}`}
                        />
                    </div>
                    {errors.secondaryColor && <p className="text-red-500 text-xs mt-1">{errors.secondaryColor}</p>}
                </div>
            </div>
            
            {/* Player Selection Section */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    {t('teams.selectPlayers')}
                </label>
                
                {playersLoading ? (
                    <div className="flex justify-center py-4">
                        <svg className="animate-spin h-5 w-5 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : players.length > 0 ? (
                    <div className="bg-darkest-bg rounded-md p-2 max-h-40 overflow-y-auto">
                        {players.map(player => (
                            <div 
                                key={player.id}
                                className={`
                                    flex items-center p-2 rounded-md mb-1 cursor-pointer transition-colors duration-200
                                    ${formData.players.includes(player.id) ? 'bg-gold/20 border border-gold' : 'hover:bg-darkest-bg/50'}
                                `}
                                onClick={() => handlePlayerToggle(player.id)}
                            >
                                <div className="w-6 h-6 rounded flex items-center justify-center border mr-2">
                                    {formData.players.includes(player.id) && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gold" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium">{player.position}</div>
                                    <div className="text-xs text-gray-400">{player.club} • {player.nationality}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-400 text-sm">
                        {t('players.noPlayersAvailable')}
                    </div>
                )}
                
                <div className="mt-2 text-xs flex items-center text-gold">
                    <span>{t('teams.selectedPlayers')}: {formData.players.length}</span>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-4 mt-4 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-gold text-darkest-bg rounded-md hover:bg-gold/90 transition-colors flex items-center"
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

export default TeamForm;
