import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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
        <form onSubmit={handleSubmit} className="space-y-4">
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
