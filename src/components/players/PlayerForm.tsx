import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sportTypeApi } from '../../api/sportTypes';
import { teamApi } from '../../api/teams';
import type { PlayerCreateRequest, PlayerPublicResponse, PlayerPosition } from '../../types/players';
import type { SportType } from '../../types/sportTypes';
import type { TeamFullResponse } from '../../types/teams';
import { PreferredFoot } from '../../types/teams';
import { ErrorHandler } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import { playerValidators, useFormValidation } from '../../utils/validation';

interface PlayerFormProps {
    initialData?: Partial<PlayerPublicResponse>;
    onSubmit: (data: PlayerCreateRequest) => Promise<void>;
    onCancel: () => void;
}

const PlayerForm: React.FC<PlayerFormProps> = React.memo(({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();    const [formData, setFormData] = useState<PlayerCreateRequest>({
        position: (initialData?.position as PlayerPosition) || 'GOALKEEPER',
        teamId: initialData?.teamId || 0,
        sportTypeId: initialData?.sportTypeId || 0,
        age: initialData?.age || 0,
        height: initialData?.height || 0,
        weight: initialData?.weight || 0,
        nationality: initialData?.nationality || '',
        birthplace: initialData?.birthplace || '',
        preferredFoot: initialData?.preferredFoot || PreferredFoot.RIGHT,
        bio: initialData?.bio || '',
        identificationNumber: '', // Required for create/update
        userId: 0, // Required for create/update  
        heroId: initialData?.heroId || 0, // Add heroId field
    });

    const [isLoading, setIsLoading] = useState(false);
    const [teams, setTeams] = useState<TeamFullResponse[]>([]);
    const [sportTypes, setSportTypes] = useState<SportType[]>([]);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);
    const [isLoadingSportTypes, setIsLoadingSportTypes] = useState(false);    const { 
        errors, 
        validateForm, 
        validateField, 
        clearFieldError 
    } = useFormValidation(playerValidators.create);

    // Load teams and sport types on component mount
    useEffect(() => {
        const loadTeamsAndSportTypes = async () => {
            try {
                // Load teams
                setIsLoadingTeams(true);
                const teamsResponse = await teamApi.getAll(); // Get all teams
                setTeams(teamsResponse.content);
                setIsLoadingTeams(false);

                // Load sport types
                setIsLoadingSportTypes(true);
                const sportTypesResponse = await sportTypeApi.getAll(); // Get active sport types
                setSportTypes(sportTypesResponse.content);
                setIsLoadingSportTypes(false);
            } catch (error) {
                console.error('Failed to load teams or sport types:', error);
                setIsLoadingTeams(false);
                setIsLoadingSportTypes(false);
            }
        };

        loadTeamsAndSportTypes();
    }, []);    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        
        // Handle numeric values
        if (name === 'age' || name === 'height' || name === 'weight' || name === 'userId' || name === 'teamId' || name === 'sportTypeId' || name === 'heroId') {
            setFormData(prev => ({ ...prev, [name]: Number(value) || 0 }));
        } else if (name === 'position') {
            // Handle position as PlayerPosition enum
            setFormData(prev => ({ ...prev, [name]: value as PlayerPosition }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when field is edited (only for validated fields)
        const validatedFields = playerValidators.create.fieldNames;
        if (validatedFields.includes(name as any) && errors[name as keyof typeof errors]) {
            clearFieldError(name as any);
        }
    };const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Only validate fields that are in the validator rules
        const validatedFields = playerValidators.create.fieldNames;
        if (validatedFields.includes(name as any)) {
            // Validate field on blur
            if (name === 'age' || name === 'height' || name === 'weight' || name === 'teamId' || name === 'sportTypeId' || name === 'heroId') {
                validateField(name as any, Number(value));
            } else {
                validateField(name as any, value);
            }
        }
    };    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Create validation data with required fields, providing defaults for optional fields
        const validationData = {
            ...formData,
            teamId: formData.teamId || 0,
            sportTypeId: formData.sportTypeId || 0,
            nationality: formData.nationality || '',
            birthplace: formData.birthplace || '',
            height: formData.height || 0,
            weight: formData.weight || 0
        };

        if (!validateForm(validationData)) {
            showToast('Please fix the validation errors', 'error');
            return;
        }

        // Check if teamId and sportTypeId are actually selected
        if (!formData.teamId) {
            showToast('Please select a team', 'error');
            return;
        }

        if (!formData.sportTypeId) {
            showToast('Please select a sport type', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
            showToast('Player saved successfully!', 'success');
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            showToast(errorMessage.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Basic Info Section */}
            <div className="bg-darkest-bg p-4 rounded-md mb-4">
                <h3 className="text-gold font-medium mb-3">{t('players.basicInfo')}</h3>                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="position">
                            {t('players.position')} *
                        </label>
                        <select
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`form-input ${errors.position ? 'border-red-500' : ''}`}
                        >
                            <option value="GOALKEEPER">{t('players.positions.goalkeeper')}</option>
                            <option value="CENTER_BACK">{t('players.positions.centerBack')}</option>
                            <option value="LEFT_BACK">{t('players.positions.leftBack')}</option>
                            <option value="RIGHT_BACK">{t('players.positions.rightBack')}</option>
                            <option value="LEFT_WING_BACK">{t('players.positions.leftWingBack')}</option>
                            <option value="RIGHT_WING_BACK">{t('players.positions.rightWingBack')}</option>
                            <option value="CENTRAL_DEFENSIVE_MIDFIELDER">{t('players.positions.centralDefensiveMidfielder')}</option>
                            <option value="CENTRAL_MIDFIELDER">{t('players.positions.centralMidfielder')}</option>
                            <option value="LEFT_MIDFIELDER">{t('players.positions.leftMidfielder')}</option>
                            <option value="RIGHT_MIDFIELDER">{t('players.positions.rightMidfielder')}</option>
                            <option value="CENTRAL_ATTACKING_MIDFIELDER">{t('players.positions.centralAttackingMidfielder')}</option>
                            <option value="LEFT_WING">{t('players.positions.leftWing')}</option>
                            <option value="RIGHT_WING">{t('players.positions.rightWing')}</option>
                            <option value="STRIKER">{t('players.positions.striker')}</option>
                            <option value="CENTER_FORWARD">{t('players.positions.centerForward')}</option>
                        </select>
                        {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="teamId">
                            {t('players.team')} *
                        </label>
                        <select
                            id="teamId"
                            name="teamId"
                            value={formData.teamId || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`form-input ${errors.teamId ? 'border-red-500' : ''}`}
                            disabled={isLoadingTeams}
                        >
                            <option value="">{isLoadingTeams ? t('common.loadingTeams') : t('common.selectTeam')}</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                        {errors.teamId && <p className="text-red-500 text-xs mt-1">{errors.teamId}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="sportTypeId">
                            {t('sportTypes.sportType')} *
                        </label>
                        <select
                            id="sportTypeId"
                            name="sportTypeId"
                            value={formData.sportTypeId || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`form-input ${errors.sportTypeId ? 'border-red-500' : ''}`}
                            disabled={isLoadingSportTypes}
                        >
                            <option value="">{isLoadingSportTypes ? t('common.loading') : t('sportTypes.selectSportType')}</option>
                            {sportTypes.map((sportType) => (
                                <option key={sportType.id} value={sportType.id}>
                                    {sportType.name}
                                </option>
                            ))}
                        </select>
                        {errors.sportTypeId && <p className="text-red-500 text-xs mt-1">{errors.sportTypeId}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="age">
                            {t('players.age')} *
                        </label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min="0"
                            className={`form-input ${errors.age ? 'border-red-500' : ''}`}
                        />
                        {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="height">
                            {t('players.height')} (cm) *
                        </label>
                        <input
                            type="number"
                            id="height"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min="0"
                            className={`form-input ${errors.height ? 'border-red-500' : ''}`}
                        />
                        {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="weight">
                            {t('players.weight')} (kg) *
                        </label>
                        <input
                            type="number"
                            id="weight"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min="0"
                            className={`form-input ${errors.weight ? 'border-red-500' : ''}`}
                        />
                        {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
                    </div>
                </div>
            </div>

            {/* Nationality Section */}
            <div className="bg-darkest-bg p-4 rounded-md mb-4">
                <h3 className="text-gold font-medium mb-3">{t('players.nationalityInfo')}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="nationality">
                            {t('players.nationality')} *
                        </label>
                        <input
                            type="text"
                            id="nationality"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`form-input ${errors.nationality ? 'border-red-500' : ''}`}
                        />
                        {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="birthplace">
                            {t('players.birthplace')} *
                        </label>
                        <input
                            type="text"
                            id="birthplace"
                            name="birthplace"
                            value={formData.birthplace}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`form-input ${errors.birthplace ? 'border-red-500' : ''}`}
                        />
                        {errors.birthplace && <p className="text-red-500 text-xs mt-1">{errors.birthplace}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="preferredFoot">
                        {t('players.preferredFoot')} *
                    </label>
                    <select
                        id="preferredFoot"
                        name="preferredFoot"
                        value={formData.preferredFoot}
                        onChange={handleChange}
                        className="form-input"
                    >
                        <option value={PreferredFoot.LEFT}>{t('players.leftFoot')}</option>
                        <option value={PreferredFoot.RIGHT}>{t('players.rightFoot')}</option>
                        <option value={PreferredFoot.BOTH}>{t('players.bothFeet')}</option>
                    </select>
                </div>
            </div>

            {/* Additional Info Section */}
            <div className="bg-darkest-bg p-4 rounded-md mb-4">
                <h3 className="text-gold font-medium mb-3">{t('players.additionalInfo')}</h3>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="bio">
                        {t('players.bio')}
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="form-input"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="identificationNumber">
                            {t('players.identificationNumber')} *
                        </label>
                        <input
                            type="text"
                            id="identificationNumber"
                            name="identificationNumber"
                            value={formData.identificationNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`form-input ${errors.identificationNumber ? 'border-red-500' : ''}`}
                        />
                        {errors.identificationNumber && (
                            <p className="text-red-500 text-xs mt-1">{errors.identificationNumber}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="userId">
                            {t('players.userId')} *
                        </label>
                        <input
                            type="number"
                            id="userId"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            min="0"
                            className={`form-input ${errors.userId ? 'border-red-500' : ''}`}
                        />
                        {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="heroId">
                            {t('players.heroId')}
                        </label>
                        <input
                            type="number"
                            id="heroId"
                            name="heroId"
                            value={formData.heroId}
                            onChange={handleChange}
                            min="0"
                            className="form-input"
                            placeholder={t('players.heroIdPlaceholder')}
                        />
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
});

export default PlayerForm;
