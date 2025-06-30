import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaygroundStore } from '../../store/playgroundStore';
import type { PayReservationRequest } from '../../types/playgrounds';

interface PaymentFormProps {
    reservationId: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const paymentMethods = [
    'CASH',
    'CARD',
    'BANK_TRANSFER',
    'ONLINE'
];

export const PaymentForm: React.FC<PaymentFormProps> = ({
    reservationId,
    onSuccess,
    onCancel
}) => {
    const { t } = useTranslation();
    const { payForReservation, isReservationsLoading } = usePlaygroundStore();

    const [formData, setFormData] = useState<PayReservationRequest>({
        reservationId,
        paymentMethod: 'CARD',
        amountPaid: 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.paymentMethod) {
            newErrors.paymentMethod = t('reservations.payment.validation.methodRequired');
        }

        if (!formData.amountPaid || formData.amountPaid <= 0) {
            newErrors.amountPaid = t('reservations.payment.validation.amountRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const success = await payForReservation(formData);
        if (success) {
            onSuccess?.();
        }
    };

    const handleInputChange = (field: keyof PayReservationRequest, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reservations.payment.form.method')}
                </label>
                <select
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isReservationsLoading}
                >
                    {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                            {t(`reservations.payment.methods.${method.toLowerCase()}`)}
                        </option>
                    ))}
                </select>
                {errors.paymentMethod && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
                )}
            </div>

            <div>
                <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('reservations.payment.form.amount')}
                </label>
                <input
                    type="number"
                    id="amountPaid"
                    step="0.01"
                    min="0"
                    value={formData.amountPaid}
                    onChange={(e) => handleInputChange('amountPaid', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.amountPaid ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isReservationsLoading}
                    placeholder="0.00"
                />
                {errors.amountPaid && (
                    <p className="mt-1 text-sm text-red-600">{errors.amountPaid}</p>
                )}
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isReservationsLoading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isReservationsLoading ? t('common.loading') : t('reservations.payment.form.submit')}
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
