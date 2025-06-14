import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCityStore } from '../../store/cityStore';
import { usePlayerStore } from '../../store/playerStore';
import { useSportTypeStore } from '../../store/sportTypeStore';
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
        cityId: initialData?.cityId || 0,
        sportTypeId: initialData?.sportTypeId || 0,
    });    const { players, fetchPlayers } = usePlayerStore();
    const { sportTypes, fetchSportTypes } = useSportTypeStore();
    const { cities, fetchCities } = useCityStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSportTypes, setIsLoadingSportTypes] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const { 
        errors, 
        validateForm, 
        validateField, 
        clearFieldError 
    } = useFormValidation(teamValidators.create);const [showPlayerSelector, setShowPlayerSelector] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<(typeof players[0])[]>([]);
    
    // Check if current language is Russian for adaptive text sizing
    const isRussian = i18n.language === 'ru';    // Helper function to get player display name - fix for API bug where fullName="Unknown" and real name is in position
    const getPlayerDisplayName = (player: any) => {
        // If fullName exists and is not "Unknown" or "string", use it
        if (player.fullName && player.fullName !== "Unknown" && player.fullName !== "string") {
            return player.fullName;
        }
        // If position field has actual data (not "string"), use it as name
        if (player.position && player.position !== "string") {
            return player.position;
        }        // Fallback to player ID if available
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
    };    // Fetch players, sport types, and cities when component mounts
    useEffect(() => {
        const loadData = async () => {
            fetchPlayers();
            
            setIsLoadingSportTypes(true);
            try {
                await fetchSportTypes();
            } catch (error) {
                console.error('Failed to load sport types:', error);
            } finally {
                setIsLoadingSportTypes(false);
            }

            setIsLoadingCities(true);
            try {
                await fetchCities();
            } catch (error) {
                console.error('Failed to load cities:', error);
            } finally {
                setIsLoadingCities(false);
            }
        };
        
        loadData();
    }, [fetchPlayers, fetchSportTypes, fetchCities]);
    
    // Update selected players when form data changes
    useEffect(() => {
        if (players.length > 0 && formData.players.length > 0) {
            const selected = players.filter(p => formData.players.includes(p.id));
            setSelectedPlayers(selected);
        } else {
            setSelectedPlayers([]);
        }    }, [players, formData.players]);
      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Handle numeric fields
        if (name === 'cityId' || name === 'sportTypeId') {
            setFormData(prev => ({ ...prev, [name]: Number(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when field is edited
        if (errors[name]) {
            clearFieldError(name as keyof CreateTeamRequest);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'cityId' || name === 'sportTypeId') {
            validateField(name as keyof CreateTeamRequest, Number(value) || 0);
        } else {
            validateField(name as keyof CreateTeamRequest, value);
        }
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
    };    const handleSubmit = async (e: React.FormEvent) => {
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
            </div>            <div>
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

            {/* Sport Type and City Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="sportTypeId">
                        {t('sportTypes.sportType')} *
                    </label>
                    <select
                        id="sportTypeId"
                        name="sportTypeId"
                        value={formData.sportTypeId || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
                        ${errors.sportTypeId ? 'border-red-500' : 'border-gray-700'}`}
                        disabled={isLoadingSportTypes}
                    >
                        <option value="">
                            {isLoadingSportTypes ? t('common.loading') : t('sportTypes.selectSportType')}
                        </option>
                        {sportTypes.map((sportType) => (
                            <option key={sportType.id} value={sportType.id}>
                                {sportType.name}
                            </option>
                        ))}
                    </select>
                    {errors.sportTypeId && <p className="text-red-500 text-xs mt-1">{errors.sportTypeId}</p>}
                </div>                <div>
                    <label className={`block font-medium mb-1 ${isRussian ? 'text-xs' : 'text-sm'}`} htmlFor="cityId">
                        {t('teams.city')} *
                    </label>
                    <select
                        id="cityId"
                        name="cityId"
                        value={formData.cityId || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
                        ${errors.cityId ? 'border-red-500' : 'border-gray-700'}`}
                        disabled={isLoadingCities}
                    >
                        <option value="">{isLoadingCities ? t('common.loading') : t('cities.selectCity')}</option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.name}, {city.region}, {city.country}
                            </option>
                        ))}
                    </select>
                    {errors.cityId && <p className="text-red-500 text-xs mt-1">{errors.cityId}</p>}
                </div>
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
                    {errors.secondaryColor && <p className="text-red-500 text-xs mt-1">{errors.secondaryColor}</p>}                </div>
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
                                        </div>                                        <div>
                                            <div className="text-sm font-medium">{getPlayerDisplayName(player)}</div>
                                            <div className="text-xs text-gray-400">{getPlayerPosition(player)}</div>
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
                    )}                </div>
            </div>

            <div className="border-t border-gray-700/50 pt-6 mt-6 flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 bg-darkest-bg text-gray-300 hover:text-white border border-gray-700 rounded-md hover:bg-card-bg transition-all duration-300"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-gold to-gold/90 text-darkest-bg font-medium rounded-md hover:shadow-lg hover:shadow-gold/20 transition-all duration-300 flex items-center relative overflow-hidden group"
                >                    <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                    {isLoading ? (
                        <span className="flex items-center relative">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-darkest-bg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('common.saving')}...
                        </span>
                    ) : (
                        <span className="flex items-center relative">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('common.save')}
                        </span>
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
