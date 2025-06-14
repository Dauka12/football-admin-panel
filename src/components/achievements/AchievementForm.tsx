
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlayerStore } from '../../store/playerStore';
import type { Achievement, CreateAchievementRequest, UpdateAchievementRequest } from '../../types/achievements';
import { ACHIEVEMENT_CATEGORIES } from '../../types/achievements';

interface AchievementFormProps {
    achievement?: Achievement;
    onSubmit: (data: CreateAchievementRequest | UpdateAchievementRequest) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export const AchievementForm: React.FC<AchievementFormProps> = ({
    achievement,
    onSubmit,
    onCancel,
    isLoading
}) => {
    const { t } = useTranslation();
    const { players, fetchPlayers } = usePlayerStore();

    const [formData, setFormData] = useState({
        playerId: achievement?.playerId || 0,
        title: achievement?.title || '',
        description: achievement?.description || '',
        achievementDate: achievement?.achievementDate || new Date().toISOString().split('T')[0],
        category: achievement?.category || '',
        points: achievement?.points || 0,
        featured: achievement?.featured || false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchPlayers(false, 0, 1000); // Load all players for dropdown
    }, [fetchPlayers]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!achievement && !formData.playerId) {
            newErrors.playerId = t('achievements.validation.playerRequired');
        }
        if (!formData.title.trim()) {
            newErrors.title = t('achievements.validation.titleRequired');
        }
        if (!formData.description.trim()) {
            newErrors.description = t('achievements.validation.descriptionRequired');
        }
        if (!formData.achievementDate) {
            newErrors.achievementDate = t('achievements.validation.dateRequired');
        }
        if (!formData.category) {
            newErrors.category = t('achievements.validation.categoryRequired');
        }
        if (formData.points < 0) {
            newErrors.points = t('achievements.validation.pointsPositive');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        if (achievement) {
            // Update existing achievement
            const updateData: UpdateAchievementRequest = {
                title: formData.title,
                description: formData.description,
                achievementDate: formData.achievementDate,
                category: formData.category,
                points: formData.points,
                featured: formData.featured
            };
            onSubmit(updateData);
        } else {
            // Create new achievement
            const createData: CreateAchievementRequest = {
                playerId: formData.playerId,
                title: formData.title,
                description: formData.description,
                achievementDate: formData.achievementDate,
                category: formData.category,
                points: formData.points,
                featured: formData.featured
            };
            onSubmit(createData);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Player Selection (only for new achievements) */}
                {!achievement && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('achievements.player')} *
                        </label>
                        <select
                            value={formData.playerId}
                            onChange={(e) => handleInputChange('playerId', parseInt(e.target.value))}
                            className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 text-white placeholder-gray-400 ${
                                errors.playerId 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-gray-700 focus:ring-gold'
                            }`}
                        >
                            <option value={0}>{t('achievements.selectPlayer')}</option>
                            {players.map((player) => (
                                <option key={player.id} value={player.id}>
                                    {player.fullName}
                                </option>
                            ))}
                        </select>
                        {errors.playerId && (
                            <p className="mt-1 text-sm text-red-500">{errors.playerId}</p>
                        )}
                    </div>
                )}

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('achievements.title')} *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder={t('achievements.titlePlaceholder')}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 text-white placeholder-gray-400 ${
                            errors.title 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('achievements.description')} *
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder={t('achievements.descriptionPlaceholder')}
                        rows={3}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 text-white placeholder-gray-400 resize-none ${
                            errors.description 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                </div>

                {/* Achievement Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('achievements.achievementDate')} *
                    </label>
                    <input
                        type="date"
                        value={formData.achievementDate}
                        onChange={(e) => handleInputChange('achievementDate', e.target.value)}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 text-white ${
                            errors.achievementDate 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                    />
                    {errors.achievementDate && (
                        <p className="mt-1 text-sm text-red-500">{errors.achievementDate}</p>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('achievements.category')} *
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 text-white placeholder-gray-400 ${
                            errors.category 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                    >
                        <option value="">{t('achievements.selectCategory')}</option>
                        {ACHIEVEMENT_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {t(`achievements.categories.${category}`)}
                            </option>
                        ))}
                    </select>
                    {errors.category && (
                        <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                    )}
                </div>

                {/* Points */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('achievements.points')}
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.points}
                        onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
                        placeholder={t('achievements.pointsPlaceholder')}
                        className={`w-full px-3 py-2 bg-darkest-bg border rounded-md focus:outline-none focus:ring-1 transition-colors duration-200 text-white placeholder-gray-400 ${
                            errors.points 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-700 focus:ring-gold'
                        }`}
                    />
                    {errors.points && (
                        <p className="mt-1 text-sm text-red-500">{errors.points}</p>
                    )}
                </div>

                {/* Featured */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => handleInputChange('featured', e.target.checked)}
                        className="h-4 w-4 text-gold bg-darkest-bg border-gray-700 rounded focus:ring-gold focus:ring-2"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                        {t('achievements.featured')}
                    </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                        disabled={isLoading}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gold text-darkest-bg px-6 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('common.saving') : achievement ? t('common.update') : t('common.create')}
                    </button>
                </div>
            </form>
        </div>
    );
};
