import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlayerStore } from '../../store/playerStore';
import type { CreateTeamRequest, UpdateTeamRequest } from '../../types/teams';
import { ErrorHandler } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import { teamValidators, useFormValidation } from '../../utils/validation';
import PlayerSelectionModal from './PlayerSelectionModal';

interface TeamFormProps {
    initialData?: Partial<CreateTeamRequest | UpdateTeamRequest>;
    currentTeamId?: number;
    onSubmit: (data: CreateTeamRequest | UpdateTeamRequest) => Promise<void>;
    onCancel: () => void;
}

const TeamForm: React.FC<TeamFormProps> = React.memo(({ initialData, currentTeamId, onSubmit, onCancel }) => {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState<CreateTeamRequest>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        players: initialData?.players || [],
        primaryColor: initialData?.primaryColor || '#ffcc00',
        secondaryColor: initialData?.secondaryColor || '#002b3d',
    });
    
    const { players, fetchPlayers } = usePlayerStore();
    const [isLoading, setIsLoading] = useState(false);
    const { 
        errors, 
        validateForm, 
        validateField, 
        clearFieldError 
    } = useFormValidation(teamValidators.create);
    const [showPlayerSelector, setShowPlayerSelector] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<(typeof players[0])[]>([]);
    
    // Check if current language is Russian for adaptive text sizing
    const isRussian = i18n.language === 'ru';
    
    // Fetch players when component mounts
    useEffect(() => {
        fetchPlayers();
    }, [fetchPlayers]);
    
    // Update selected players when form data changes
    useEffect(() => {
        if (players.length > 0 && formData.players.length > 0) {
            const selected = players.filter(p => formData.players.includes(p.id));
            setSelectedPlayers(selected);
        } else {
            setSelectedPlayers([]);
        }
    }, [players, formData.players]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when field is edited
        if (errors[name]) {
            clearFieldError(name as keyof CreateTeamRequest);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        validateField(name as keyof CreateTeamRequest, value);
    };
    
    const handlePlayerSelection = (selectedIds: number[]) => {
        setFormData(prev => ({
            ...prev,
            players: selectedIds
        }));
    };
    
    const removePlayer = (playerId: number) => {
        setFormData(prev => ({
            ...prev,
            players: prev.players.filter(id => id !== playerId)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm(formData)) {
            showToast('Please fix the validation errors', 'error');
            return;
        }

        setIsLoading(true);
        try {
            // Make a copy to avoid potential reference issues
            const dataToSubmit = { ...formData };
            await onSubmit(dataToSubmit);
            showToast('Team saved successfully!', 'success');
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            showToast(errorMessage.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
                <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="name">
                    {t('teams.name')} *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
                    ${errors.name ? 'border-red-500' : 'border-gray-700'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
                <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="description">
                    {t('teams.description')} *
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={4}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
                    ${errors.description ? 'border-red-500' : 'border-gray-700'}`}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Improved color selection section with larger inputs */}
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className={`block font-medium mb-2 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="primaryColor">
                        {t('teams.primaryColor')} *
                    </label>
                    <div className="w-full bg-darkest-bg border border-gray-700 rounded-md overflow-hidden">
                        <input
                            type="text"
                            value={formData.primaryColor}
                            onChange={handleChange}
                            name="primaryColor"
                            className="w-full px-4 py-3 bg-darkest-bg border-0 focus:outline-none focus:ring-0"
                        />
                        <div className="flex items-center p-2 border-t border-gray-700">
                            <input
                                type="color"
                                id="primaryColor"
                                name="primaryColor"
                                value={formData.primaryColor}
                                onChange={handleChange}
                                className="h-8 w-8 cursor-pointer mr-2"
                            />
                            <div 
                                className="flex-1 h-8 rounded"
                                style={{ backgroundColor: formData.primaryColor }}
                            ></div>
                        </div>
                    </div>
                    {errors.primaryColor && <p className="text-red-500 text-xs mt-1">{errors.primaryColor}</p>}
                </div>

                <div>
                    <label className={`block font-medium mb-2 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="secondaryColor">
                        {t('teams.secondaryColor')} *
                    </label>
                    <div className="w-full bg-darkest-bg border border-gray-700 rounded-md overflow-hidden">
                        <input
                            type="text"
                            value={formData.secondaryColor}
                            onChange={handleChange}
                            name="secondaryColor"
                            className="w-full px-4 py-3 bg-darkest-bg border-0 focus:outline-none focus:ring-0"
                        />
                        <div className="flex items-center p-2 border-t border-gray-700">
                            <input
                                type="color"
                                id="secondaryColor"
                                name="secondaryColor"
                                value={formData.secondaryColor}
                                onChange={handleChange}
                                className="h-8 w-8 cursor-pointer mr-2"
                            />
                            <div 
                                className="flex-1 h-8 rounded"
                                style={{ backgroundColor: formData.secondaryColor }}
                            ></div>
                        </div>
                    </div>
                    {errors.secondaryColor && <p className="text-red-500 text-xs mt-1">{errors.secondaryColor}</p>}
                </div>
            </div>
            
            {/* Player Selection Section */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className={`block font-medium ${isRussian ? 'text-xs' : 'text-sm'}`}>
                        {t('teams.players')}
                    </label>
                    <button 
                        type="button"
                        onClick={() => setShowPlayerSelector(true)}
                        className="text-sm text-gold hover:underline flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        {t('teams.addPlayers')}
                    </button>
                </div>
                
                {/* Selected players list */}
                <div className="bg-darkest-bg rounded-md p-2">
                    {selectedPlayers.length === 0 ? (
                        <p className="text-gray-400 text-sm p-2">{t('teams.noPlayersSelected')}</p>
                    ) : (
                        <div className="max-h-40 overflow-y-auto">
                            {selectedPlayers.map(player => (
                                <div 
                                    key={player.id} 
                                    className="flex justify-between items-center p-2 border-b border-gray-700 last:border-b-0"
                                >
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-gold text-darkest-bg rounded-full flex items-center justify-center mr-2 text-xs font-bold">
                                            {player.id}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{player.position}</div>
                                            <div className="text-xs text-gray-400">{player.club}</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removePlayer(player.id)}
                                        className="text-gray-400 hover:text-accent-pink"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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
            
            {/* Player Selection Modal */}
            <PlayerSelectionModal
                isOpen={showPlayerSelector}
                onClose={() => setShowPlayerSelector(false)}
                onSelect={handlePlayerSelection}
                currentSelectedIds={formData.players}
                currentTeamId={currentTeamId}
            />
        </form>
    );
})

export default React.memo(TeamForm);
