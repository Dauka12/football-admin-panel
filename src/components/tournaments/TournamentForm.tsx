import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCityStore } from '../../store/cityStore';
import { useSportTypeStore } from '../../store/sportTypeStore';
import { useTeamStore } from '../../store/teamStore';
import { useTournamentCategoryStore } from '../../store/tournamentCategoryStore';
import type { CreateTournamentRequest, UpdateTournamentRequest } from '../../types/tournaments';
import { ErrorHandler } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import { tournamentValidators, useFormValidation } from '../../utils/validation';
import DateTimePicker from '../ui/DateTimePicker';
import TeamSelectionModal from './TeamSelectionModal';

interface TournamentFormProps {
    onSubmit: (data: CreateTournamentRequest | UpdateTournamentRequest) => void;
    onCancel: () => void;
    initialData?: Partial<CreateTournamentRequest>;
    isEdit?: boolean;
}

const TournamentForm: React.FC<TournamentFormProps> = ({
    onSubmit,
    onCancel,
    initialData,
    isEdit = false
}) => {    const { t } = useTranslation();
    const { teams, fetchTeams } = useTeamStore();
    const { sportTypes, fetchSportTypes } = useSportTypeStore();
    const { cities, fetchCities } = useCityStore();
    const { categories, fetchCategories } = useTournamentCategoryStore();const [formData, setFormData] = useState<CreateTournamentRequest>({
        name: initialData?.name || '',
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
        teams: initialData?.teams || [],
        cityId: initialData?.cityId || 0,
        sportTypeId: initialData?.sportTypeId || 0,
        categoryId: initialData?.categoryId || 0
    });    const { 
        errors, 
        validateForm, 
        validateField, 
        clearFieldError 
    } = useFormValidation(isEdit ? tournamentValidators.update : tournamentValidators.create);const [showTeamSelector, setShowTeamSelector] = useState(false);
    const [selectedTeams, setSelectedTeams] = useState<(typeof teams[0])[]>([]);    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSportTypes, setIsLoadingSportTypes] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            fetchTeams();
            
            setIsLoadingSportTypes(true);
            try {
                await fetchSportTypes();
            } catch (error) {
                console.error('Failed to load sport types:', error);
            } finally {
                setIsLoadingSportTypes(false);
            }            setIsLoadingCities(true);
            try {
                await fetchCities();
            } catch (error) {
                console.error('Failed to load cities:', error);
            } finally {
                setIsLoadingCities(false);
            }            setIsLoadingCategories(true);
            try {
                console.log('Loading tournament categories...');
                await fetchCategories();
                console.log('Categories loaded:', categories);
            } catch (error) {
                console.error('Failed to load categories:', error);
            } finally {
                setIsLoadingCategories(false);
            }
        };        
        loadData();
    }, [fetchTeams, fetchSportTypes, fetchCities, fetchCategories]);

    // Update selected teams when form data changes
    useEffect(() => {
        if (teams.length > 0 && formData.teams.length > 0) {
            const selected = teams.filter(t => formData.teams.includes(t.id));
            setSelectedTeams(selected);
        } else {
            setSelectedTeams([]);
        }
    }, [teams, formData.teams]);    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('Form submitted with data:', formData);
        console.log('Is editing:', isEdit);
        
        // Check required fields manually
        if (!formData.name?.trim()) {
            showToast('Tournament name is required', 'error');
            return;
        }
        
        if (!formData.startDate) {
            showToast('Start date is required', 'error');
            return;
        }
        
        if (!formData.endDate) {
            showToast('End date is required', 'error');
            return;
        }
        
        if (!formData.cityId || formData.cityId === 0) {
            showToast('City is required', 'error');
            return;
        }
        
        if (!formData.sportTypeId || formData.sportTypeId === 0) {
            showToast('Sport type is required', 'error');
            return;
        }
        
        if (!formData.categoryId || formData.categoryId === 0) {
            showToast('Category is required', 'error');
            return;
        }
        
        if (!formData.teams || formData.teams.length < 2) {
            showToast('At least 2 teams are required', 'error');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Calling onSubmit with data:', formData);
            await onSubmit(formData);
            console.log('onSubmit completed successfully');
        } catch (error) {
            console.error('Error in form submission:', error);
            const errorMessage = ErrorHandler.handle(error);
            showToast(errorMessage.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTeamToggle = (teamId: number) => {
        setFormData(prev => ({
            ...prev,
            teams: prev.teams.includes(teamId)
                ? prev.teams.filter(id => id !== teamId)
                : [...prev.teams, teamId]
        }));
    };

    const handleTeamSelection = (selectedIds: number[]) => {
        setFormData(prev => ({
            ...prev,
            teams: selectedIds
        }));
        // Validate teams after selection with updated data
        const updatedData = { ...formData, teams: selectedIds };
        validateField('teams', selectedIds, updatedData);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, name: value }));
        if (errors.name) {
            clearFieldError('name');
        }
    };

    const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        validateField('name', e.target.value);
    };

    const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            clearFieldError(field);
        }
        
        // Create updated data for validation
        const updatedData = { ...formData, [field]: value };
        
        // Validate the date field with full form data for context
        validateField(field, value, updatedData);
        
        // Also validate endDate if startDate changes to check date order
        if (field === 'startDate' && formData.endDate) {
            validateField('endDate', formData.endDate, updatedData);
        }
    };    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-card-bg rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden mx-2 sm:mx-0">
                {/* Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700/50 bg-gradient-to-r from-gold/10 to-transparent">
                    <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
                        {isEdit ? t('tournaments.editTournament') : t('tournaments.createTournament')}
                    </h2>
                </div>                {/* Form Content */}
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        {/* Tournament Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('tournaments.name')} *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={handleNameChange}
                                onBlur={handleNameBlur}
                                className="w-full px-4 py-3 bg-gray-800/50 border                   border-gray-600           rounded-lg
                                    focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-200
                                placeholder-gray-400 text-white"
                                placeholder={t('tournaments.enterName')}
                            />
                            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                        </div>                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="w-full">
                                <DateTimePicker
                                    value={formData.startDate}
                                    onChange={(value) => handleDateChange('startDate', value)}
                                    label={t('tournaments.startDate')}
                                    error={errors.startDate}
                                    required
                                    placeholder={t('tournaments.selectStartDate')}
                                />
                            </div>

                            <div className="w-full">
                                <DateTimePicker
                                    value={formData.endDate}
                                    onChange={(value) => handleDateChange('endDate', value)}
                                    label={t('tournaments.endDate')}
                                    error={errors.endDate}
                                    required
                                    placeholder={t('tournaments.selectEndDate')}
                                />
                            </div>                        </div>

                        {/* City and Sport Type Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Sport Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('tournaments.sportType')} *
                                </label>
                                <select
                                    value={formData.sportTypeId || ''}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        setFormData(prev => ({ ...prev, sportTypeId: value }));
                                        if (errors.sportTypeId) {
                                            clearFieldError('sportTypeId');
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg 
                                     focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-200 text-white"
                                    disabled={isLoadingSportTypes}
                                >
                                    <option value="">{isLoadingSportTypes ? t('common.loading') : t('sportTypes.selectSportType')}</option>
                                    {sportTypes.map((sportType) => (
                                        <option key={sportType.id} value={sportType.id}>
                                            {sportType.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.sportTypeId && <p className="text-red-400 text-sm mt-1">{errors.sportTypeId}</p>}
                            </div>

                            {/* City Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('tournaments.city')} *
                                </label>
                                <select
                                    value={formData.cityId || ''}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        setFormData(prev => ({ ...prev, cityId: value }));
                                        if (errors.cityId) {
                                            clearFieldError('cityId');
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg 
                                     focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-200 text-white"
                                    disabled={isLoadingCities}
                                >
                                    <option value="">{isLoadingCities ? t('common.loading') : t('cities.selectCity')}</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name}, {city.region}, {city.country}
                                        </option>
                                    ))}
                                </select>                                {errors.cityId && <p className="text-red-400 text-sm mt-1">{errors.cityId}</p>}
                            </div>
                        </div>

                        {/* Tournament Category Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('tournaments.category')} *
                            </label>
                            <select
                                value={formData.categoryId || ''}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    setFormData(prev => ({ ...prev, categoryId: value }));
                                    if (errors.categoryId) {
                                        clearFieldError('categoryId');
                                    }
                                }}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg 
                                 focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-200 text-white"
                                disabled={isLoadingCategories}
                            >
                                <option value="">{isLoadingCategories ? t('common.loading') : t('tournamentCategories.selectCategory')}</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && <p className="text-red-400 text-sm mt-1">{errors.categoryId}</p>}
                        </div>

                        {/* Team Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                {t('tournaments.teams')}
                            </label>

                            {/* Selected Teams Display */}
                            {selectedTeams.length > 0 && (
                                <div className="mb-4 p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-400">
                                            {t('tournaments.selectedTeams')}: <span className="text-gold">{selectedTeams.length}</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, teams: [] })}
                                            className="text-red-400 hover:text-red-300 text-sm transition-colors"
                                        >
                                            {t('common.clearAll')}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTeams.map((team) => (
                                            <div
                                                key={team.id}
                                                className="flex items-center bg-gold/20 border border-gold/30 rounded-lg px-3 py-2"
                                            >
                                                <div
                                                    className="w-6 h-6 rounded-full mr-2 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs"
                                                    style={{
                                                        backgroundColor: team.primaryColor || '#ffcc00',
                                                        color: team.secondaryColor || '#002b3d'
                                                    }}
                                                >
                                                    {team.avatar ? (
                                                        <img src={team.avatar} alt={team.name} className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        team.name.substring(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <span className="text-white text-sm font-medium mr-2">{team.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleTeamToggle(team.id)}
                                                    className="text-gold hover:text-gold/70 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add Teams Button */}
                            <button
                                type="button"
                                onClick={() => setShowTeamSelector(true)}
                                className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg
                         hover:border-gold/50 hover:bg-gold/5 transition-all duration-200
                         flex items-center justify-center space-x-2 text-gray-400 hover:text-gold"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>
                                    {selectedTeams.length === 0
                                        ? t('tournaments.selectTeams')
                                        : t('tournaments.addMoreTeams')
                                    }
                                </span>
                            </button>
                        </div>
                    </form>
                </div>                {/* Footer */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-700/50 bg-gray-800/30 flex flex-col sm:flex-row sm:justify-end gap-2 sm:space-x-3">                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 
                     transition-all duration-200 font-medium text-sm sm:text-base"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-gradient-to-r from-gold to-gold/80 text-black rounded-lg 
                     hover:from-gold/90 hover:to-gold/70 transition-all duration-200 font-medium text-sm sm:text-base
                     shadow-lg hover:shadow-gold/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('common.saving')}
                            </>
                        ) : (
                            isEdit ? t('common.save') : t('common.create')
                        )}
                    </button>
                </div>
            </div>

            {/* Team Selection Modal */}
            {showTeamSelector && (
                <TeamSelectionModal
                    isOpen={showTeamSelector}
                    onClose={() => setShowTeamSelector(false)}
                    onSelect={handleTeamSelection}
                    currentSelectedIds={formData.teams}
                />
            )}
        </div>
    );
};

export default React.memo(TournamentForm);
