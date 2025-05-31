import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTeamStore } from '../../store/teamStore';
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
}) => {
    const { t } = useTranslation();
    const { teams, fetchTeams } = useTeamStore();

    const [formData, setFormData] = useState<CreateTournamentRequest>({
        name: initialData?.name || '',
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
        teams: initialData?.teams || []
    });

    const { 
        errors, 
        validateForm, 
        validateField, 
        clearFieldError 
    } = useFormValidation(tournamentValidators.create);
    const [showTeamSelector, setShowTeamSelector] = useState(false);
    const [selectedTeams, setSelectedTeams] = useState<(typeof teams[0])[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    // Update selected teams when form data changes
    useEffect(() => {
        if (teams.length > 0 && formData.teams.length > 0) {
            const selected = teams.filter(t => formData.teams.includes(t.id));
            setSelectedTeams(selected);
        } else {
            setSelectedTeams([]);
        }
    }, [teams, formData.teams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm(formData)) {
            showToast('Please fix the validation errors', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
            showToast('Tournament saved successfully!', 'success');
        } catch (error) {
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
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card-bg rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-gold/10 to-transparent">
                    <h2 className="text-xl font-semibold text-white">
                        {isEdit ? t('tournaments.editTournament') : t('tournaments.createTournament')}
                    </h2>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-200
                         placeholder-gray-400 text-white"
                                placeholder={t('tournaments.enterName')}
                            />
                            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DateTimePicker
                                value={formData.startDate}
                                onChange={(value) => handleDateChange('startDate', value)}
                                label={t('tournaments.startDate')}
                                error={errors.startDate}
                                required
                                placeholder={t('tournaments.selectStartDate')}
                            />

                            <DateTimePicker
                                value={formData.endDate}
                                onChange={(value) => handleDateChange('endDate', value)}
                                label={t('tournaments.endDate')}
                                error={errors.endDate}
                                required
                                placeholder={t('tournaments.selectEndDate')}
                            />
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
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-800/30 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 
                     transition-all duration-200 font-medium"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-gradient-to-r from-gold to-gold/80 text-black rounded-lg 
                     hover:from-gold/90 hover:to-gold/70 transition-all duration-200 font-medium
                     shadow-lg hover:shadow-gold/20 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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
