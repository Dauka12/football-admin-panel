import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaygroundStore } from '../../store/playgroundStore';
import type { CreateReservationRequest } from '../../types/playgrounds';

interface ReservationFormProps {
    playgroundId: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
    playgroundId,
    onSuccess,
    onCancel
}) => {
    const { t } = useTranslation();
    const { createReservation, isReservationsLoading } = usePlaygroundStore();

    const [formData, setFormData] = useState<CreateReservationRequest>({
        playgroundId,
        startTime: '',
        endTime: ''
    });

    const [errors, setErrors] = useState<Partial<CreateReservationRequest>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateReservationRequest> = {};

        if (!formData.startTime) {
            newErrors.startTime = t('reservations.validation.startTimeRequired');
        }

        if (!formData.endTime) {
            newErrors.endTime = t('reservations.validation.endTimeRequired');
        }

        if (formData.startTime && formData.endTime) {
            const startDate = new Date(formData.startTime);
            const endDate = new Date(formData.endTime);
            
            if (startDate >= endDate) {
                newErrors.endTime = t('reservations.validation.endTimeAfterStart');
            }

            if (startDate < new Date()) {
                newErrors.startTime = t('reservations.validation.startTimeInFuture');
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const success = await createReservation(formData);
        if (success) {
            onSuccess?.();
        }
    };

    const handleInputChange = (field: keyof CreateReservationRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reservations.form.startTime')}
                </label>
                <input
                    type="datetime-local"
                    id="startTime"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.startTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isReservationsLoading}
                />
                {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                )}
            </div>

            <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reservations.form.endTime')}
                </label>
                <input
                    type="datetime-local"
                    id="endTime"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.endTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isReservationsLoading}
                />
                {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                )}
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isReservationsLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isReservationsLoading ? t('common.loading') : t('reservations.form.submit')}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isReservationsLoading}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('common.cancel')}
                    </button>
                )}
            </div>
        </form>
    );
};
