import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCityStore } from '../../store/cityStore';
import { useTeamStore } from '../../store/teamStore';
import { useTournamentStore } from '../../store/tournamentStore';
import { usePlaygroundStore } from '../../store/playgroundStore';
import { useSportTypeStore } from '../../store/sportTypeStore';
import type { CreateMatchRequest, UpdateMatchRequest } from '../../types/matches';
import { ErrorHandler } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import DateTimePicker from '../ui/DateTimePicker';

interface MatchFormProps {
    initialData?: Partial<CreateMatchRequest | UpdateMatchRequest>;
    onSubmit: (data: CreateMatchRequest | UpdateMatchRequest) => Promise<void>;
    onCancel: () => void;
    isEditing?: boolean; // Flag to distinguish between create and update modes
}

const MatchForm: React.FC<MatchFormProps> = ({ initialData, onSubmit, onCancel, isEditing = false }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const { teams, fetchTeams } = useTeamStore();
    const { tournaments, fetchTournaments } = useTournamentStore();
    const { cities, fetchCities } = useCityStore();
    const { playgrounds, fetchPlaygrounds } = usePlaygroundStore();
    const { sportTypes, fetchSportTypes } = useSportTypeStore();

    // Form data
    const [formData, setFormData] = useState<CreateMatchRequest>({
        tournamentId: initialData?.tournamentId,
        startTime: initialData?.startTime || new Date().toISOString(),
        endTime: initialData?.endTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Default to 2 hours later
        teams: initialData?.teams || [],
        cityId: initialData?.cityId || 1, // Default to first city
        status: initialData?.status || 'PENDING',
        playgroundId: initialData?.playgroundId || 1, // Default to first playground
        maxCapacity: initialData?.maxCapacity || 20,
        description: initialData?.description || '',
        sportTypeId: initialData?.sportTypeId || 1 // Default to first sport type
    });
    
    // Normalize initial startTime and endTime
    useEffect(() => {
        if (initialData?.startTime) {
            const startTime = initialData.startTime as string | number;
            let normalizedStartDate: Date;
            
            if (typeof startTime === 'number') {
                // Handle Unix timestamp (check if it's in seconds or milliseconds)
                const timestampStr = String(startTime);
                const timestamp = timestampStr.length === 10 ? startTime * 1000 : startTime;
                normalizedStartDate = new Date(timestamp);
            } else {
                // Handle string date
                normalizedStartDate = new Date(startTime);
            }
            
            if (!isNaN(normalizedStartDate.getTime())) {
                setFormData(prev => ({
                    ...prev,
                    startTime: normalizedStartDate.toISOString()
                }));
            }
        }
        
        if (initialData?.endTime) {
            const endTime = initialData.endTime as string | number;
            let normalizedEndDate: Date;
            
            if (typeof endTime === 'number') {
                const timestampStr = String(endTime);
                const timestamp = timestampStr.length === 10 ? endTime * 1000 : endTime;
                normalizedEndDate = new Date(timestamp);
            } else {
                normalizedEndDate = new Date(endTime);
            }
            
            if (!isNaN(normalizedEndDate.getTime())) {
                setFormData(prev => ({
                    ...prev,
                    endTime: normalizedEndDate.toISOString()
                }));
            }
        }
    }, [initialData]);

    // Form validation
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch required data on mount
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                fetchTeams(), 
                fetchTournaments(), 
                fetchCities(),
                fetchPlaygrounds(),
                fetchSportTypes()
            ]);
        };
        loadData();
    }, [fetchTeams, fetchTournaments, fetchCities, fetchPlaygrounds, fetchSportTypes]);

    // Handle form field changes
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'tournamentId' || name === 'cityId' || name === 'playgroundId' || name === 'sportTypeId' || name === 'maxCapacity') {
            setFormData(prev => ({ 
                ...prev, 
                [name]: value ? parseInt(value, 10) : (name === 'tournamentId' ? undefined : 1)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle team selection
    const handleTeamSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const teamId = parseInt(e.target.value, 10);
        const isChecked = e.target.checked;

        setFormData(prev => {
            if (isChecked) {
                // Check if we already have 2 teams selected
                if (prev.teams.length >= 2) {
                    showToast(t('matches.form.errors.maxTwoTeams'), 'error');
                    e.target.checked = false; // Uncheck the checkbox
                    return prev; // Don't add the team
                }
                
                // Add team if not already in the list
                if (!prev.teams.includes(teamId)) {
                    return { ...prev, teams: [...prev.teams, teamId] };
                }
            } else {
                // Remove team
                return { ...prev, teams: prev.teams.filter(id => id !== teamId) };
            }
            return prev;
        });

        // Clear teams error if any
        if (errors.teams) {
            setErrors(prev => ({ ...prev, teams: '' }));
        }
    };

    // Handle start time change
    const handleStartTimeChange = (dateValue: string | Date | null) => {
        if (dateValue) {
            // If we get a string, we need to parse it
            const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
            
            if (isNaN(date.getTime())) {
                console.error('Invalid start date provided:', dateValue);
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                // Store as ISO string for consistency
                startTime: date.toISOString()
            }));

            // Clear date error if any
            if (errors.startTime) {
                setErrors(prev => ({ ...prev, startTime: '' }));
            }
        }
    };

    // Handle end time change
    const handleEndTimeChange = (dateValue: string | Date | null) => {
        if (dateValue) {
            // If we get a string, we need to parse it
            const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
            
            if (isNaN(date.getTime())) {
                console.error('Invalid end date provided:', dateValue);
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                // Store as ISO string for consistency
                endTime: date.toISOString()
            }));

            // Clear date error if any
            if (errors.endTime) {
                setErrors(prev => ({ ...prev, endTime: '' }));
            }
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Tournament is optional - matches can be created without tournaments
        // No validation needed for tournamentId

        // Check start time
        if (!formData.startTime) {
            newErrors.startTime = t('matches.form.errors.startTimeRequired');
        }

        // Check end time
        if (!formData.endTime) {
            newErrors.endTime = t('matches.form.errors.endTimeRequired');
        }

        // Check if end time is after start time
        if (formData.startTime && formData.endTime) {
            const startDate = new Date(formData.startTime);
            const endDate = new Date(formData.endTime);
            if (endDate <= startDate) {
                newErrors.endTime = t('matches.form.errors.endTimeAfterStart');
            }
        }

        // Check teams selection
        if (!formData.teams.length) {
            newErrors.teams = t('matches.form.errors.teamsRequired');
        } else if (formData.teams.length < 2) {
            newErrors.teams = t('matches.form.errors.minimumTwoTeams');
        } else if (formData.teams.length > 2) {
            newErrors.teams = t('matches.form.errors.maxTwoTeams');
        }

        // Check required fields
        if (!formData.cityId || formData.cityId <= 0) {
            newErrors.cityId = t('matches.form.errors.cityRequired');
        }

        if (!formData.playgroundId || formData.playgroundId <= 0) {
            newErrors.playgroundId = t('matches.form.errors.playgroundRequired');
        }

        if (!formData.sportTypeId || formData.sportTypeId <= 0) {
            newErrors.sportTypeId = t('matches.form.errors.sportTypeRequired');
        }

        if (!formData.maxCapacity || formData.maxCapacity <= 0) {
            newErrors.maxCapacity = t('matches.form.errors.maxCapacityRequired');
        }

        if (!formData.description.trim()) {
            newErrors.description = t('matches.form.errors.descriptionRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast(t('common.fixValidationErrors'), 'error');
            return;
        }

        setIsLoading(true);
        try {
            // Prepare data for API - ensure all required fields are present
            const submitData = isEditing ? {
                // For updates, only send non-empty fields
                ...(formData.tournamentId && { tournamentId: formData.tournamentId }),
                ...(formData.teams && formData.teams.length > 0 && { teams: formData.teams }),
                ...(formData.cityId && { cityId: formData.cityId }),
                ...(formData.status && { status: formData.status }),
                ...(formData.playgroundId && { playgroundId: formData.playgroundId }),
                ...(formData.startTime && { startTime: formData.startTime }),
                ...(formData.endTime && { endTime: formData.endTime }),
                ...(formData.maxCapacity && { maxCapacity: formData.maxCapacity }),
                ...(formData.description !== undefined && { description: formData.description }),
                ...(formData.sportTypeId && { sportTypeId: formData.sportTypeId })
            } : {
                // For creation, ensure all required fields are present
                tournamentId: formData.tournamentId,
                teams: formData.teams || [],
                cityId: formData.cityId || 1,
                status: formData.status || 'PENDING',
                playgroundId: formData.playgroundId || 1,
                startTime: formData.startTime || new Date().toISOString(),
                endTime: formData.endTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                maxCapacity: formData.maxCapacity || 20,
                description: formData.description || '',
                sportTypeId: formData.sportTypeId || 1
            };

            await onSubmit(submitData);
            showToast(t('matches.form.success'), 'success');
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            showToast(errorMessage.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Tournament selection */}
            <div>
                <label className="block font-medium mb-1 text-sm" htmlFor="tournamentId">
                    {t('matches.form.tournament')}
                </label>
                <select
                    id="tournamentId"
                    name="tournamentId"
                    value={formData.tournamentId || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
          ${errors.tournamentId ? 'border-red-500' : 'border-gray-700'}`}
                    disabled={isLoading}
                >
                    <option value="">{t('matches.form.selectTournament')}</option>
                    {tournaments.map(tournament => (
                        <option key={tournament.id} value={tournament.id}>
                            {tournament.name}
                        </option>
                    ))}
                </select>
                {errors.tournamentId && (
                    <p className="text-red-500 text-xs mt-1">{errors.tournamentId}</p>
                )}
            </div>

            {/* City selection */}
            <div>
                <label className="block font-medium mb-1 text-sm" htmlFor="cityId">
                    {t('matches.form.city')}
                </label>
                <select
                    id="cityId"
                    name="cityId"
                    value={formData.cityId || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
          ${errors.cityId ? 'border-red-500' : 'border-gray-700'}`}
                    disabled={isLoading}
                >
                    <option value="">{t('matches.form.selectCity')}</option>
                    {cities.map(city => (
                        <option key={city.id} value={city.id}>
                            {city.name}
                        </option>
                    ))}
                </select>
                {errors.cityId && (
                    <p className="text-red-500 text-xs mt-1">{errors.cityId}</p>
                )}
            </div>

            {/* Start time */}
            <div className="w-full">
                <div className="block font-medium mb-1 text-sm sr-only">
                    {t('matches.form.startTime')} *
                </div>
                <DateTimePicker
                    value={formData.startTime}
                    onChange={(dateValue) => handleStartTimeChange(dateValue)}
                    className={errors.startTime ? 'border-red-500' : ''}
                    label={t('matches.form.startTime')}
                    required
                />
                {errors.startTime && (
                    <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
                )}
            </div>

            {/* End time */}
            <div className="w-full">
                <div className="block font-medium mb-1 text-sm sr-only">
                    {t('matches.form.endTime')} *
                </div>
                <DateTimePicker
                    value={formData.endTime}
                    onChange={(dateValue) => handleEndTimeChange(dateValue)}
                    className={errors.endTime ? 'border-red-500' : ''}
                    label={t('matches.form.endTime')}
                    required
                />
                {errors.endTime && (
                    <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
                )}
            </div>

            {/* Sport Type selection */}
            <div>
                <label className="block font-medium mb-1 text-sm" htmlFor="sportTypeId">
                    {t('matches.form.sportType')} *
                </label>
                <select
                    id="sportTypeId"
                    name="sportTypeId"
                    value={formData.sportTypeId || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
          ${errors.sportTypeId ? 'border-red-500' : 'border-gray-700'}`}
                    disabled={isLoading}
                >
                    <option value="">{t('matches.form.selectSportType')}</option>
                    {sportTypes.map(sportType => (
                        <option key={sportType.id} value={sportType.id}>
                            {sportType.name}
                        </option>
                    ))}
                </select>
                {errors.sportTypeId && (
                    <p className="text-red-500 text-xs mt-1">{errors.sportTypeId}</p>
                )}
            </div>

            {/* Playground selection */}
            <div>
                <label className="block font-medium mb-1 text-sm" htmlFor="playgroundId">
                    {t('matches.form.playground')} *
                </label>
                <select
                    id="playgroundId"
                    name="playgroundId"
                    value={formData.playgroundId || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
          ${errors.playgroundId ? 'border-red-500' : 'border-gray-700'}`}
                    disabled={isLoading}
                >
                    <option value="">{t('matches.form.selectPlayground')}</option>
                    {playgrounds?.content?.map(playground => (
                        <option key={playground.id} value={playground.id}>
                            {playground.name}
                        </option>
                    ))}
                </select>
                {errors.playgroundId && (
                    <p className="text-red-500 text-xs mt-1">{errors.playgroundId}</p>
                )}
            </div>

            {/* Max Capacity */}
            <div>
                <label className="block font-medium mb-1 text-sm" htmlFor="maxCapacity">
                    {t('matches.form.maxCapacity')} *
                </label>
                <input
                    type="number"
                    id="maxCapacity"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
          ${errors.maxCapacity ? 'border-red-500' : 'border-gray-700'}`}
                    disabled={isLoading}
                />
                {errors.maxCapacity && (
                    <p className="text-red-500 text-xs mt-1">{errors.maxCapacity}</p>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="block font-medium mb-1 text-sm" htmlFor="description">
                    {t('matches.form.description')} *
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
          ${errors.description ? 'border-red-500' : 'border-gray-700'}`}
                    disabled={isLoading}
                    placeholder={t('matches.form.descriptionPlaceholder')}
                />
                {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
            </div>

            {/* Status selection */}
            <div>
                <label className="block font-medium mb-1 text-sm" htmlFor="status">
                    {t('matches.status.title')}
                </label>
                <select
                    id="status"
                    name="status"
                    value={formData.status || 'PENDING'}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 focus:ring-gold
          ${errors.status ? 'border-red-500' : 'border-gray-700'}`}
                    disabled={isLoading}
                >
                    <option value="PENDING">{t('matches.status.pending')}</option>
                    <option value="IN_PROGRESS">{t('matches.status.inProgress')}</option>
                    <option value="COMPLETED">{t('matches.status.completed')}</option>
                    <option value="CANCELLED">{t('matches.status.cancelled')}</option>
                </select>
                {errors.status && (
                    <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                )}
            </div>

            {/* Team selection */}
            <div>
                <label className="block font-medium mb-2 text-sm">
                    {t('matches.form.teams')} * 
                    <span className="text-gray-400 font-normal ml-1">
                        ({formData.teams.length}/2 {t('matches.form.teamsSelected')})
                    </span>
                </label>
                {formData.teams.length >= 2 && (
                    <p className="text-yellow-500 text-xs mb-2">
                        {t('matches.form.maxTeamsReached')}
                    </p>
                )}
                {errors.teams && (
                    <p className="text-red-500 text-xs mb-2">{errors.teams}</p>
                )}

                <div className="bg-darkest-bg border border-gray-700 rounded-md max-h-60 overflow-y-auto">
                    {teams.length === 0 ? (
                        <p className="text-gray-400 p-3 text-sm">{t('matches.form.noTeams')}</p>
                    ) : (
                        teams.map(team => {
                            const isSelected = formData.teams.includes(team.id);
                            const isDisabled = !isSelected && formData.teams.length >= 2;
                            
                            return (
                            <div key={team.id} className={`flex items-center space-x-3 p-3 border-b border-gray-700 last:border-b-0 ${isDisabled ? 'opacity-50' : ''}`}>
                                <input
                                    type="checkbox"
                                    id={`team-${team.id}`}
                                    value={team.id}
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={handleTeamSelection}
                                    className="h-4 w-4 text-gold focus:ring-gold border-gray-700 bg-darkest-bg rounded disabled:opacity-50"
                                />
                                <div className="flex items-center flex-1">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                                        style={{
                                            backgroundColor: team.primaryColor || '#ffcc00',
                                            color: team.secondaryColor || '#002b3d'
                                        }}
                                    >
                                        {team.avatar ? (
                                            <img src={team.avatar} alt={team.name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span className="font-bold text-sm">
                                                {team.name.substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span>{team.name}</span>
                                </div>
                            </div>
                        );})
                    )}
                </div>
            </div>

            {/* Form buttons */}
            <div className="border-t border-gray-700 pt-4 mt-4 flex flex-col sm:flex-row sm:justify-end gap-2 sm:space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm sm:text-base"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-gold text-darkest-bg rounded-md hover:bg-gold/90 transition-colors flex items-center justify-center text-sm sm:text-base"
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

export default React.memo(MatchForm);
