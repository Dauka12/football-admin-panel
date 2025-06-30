import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaygroundStore } from '../../store/playgroundStore';
import { ReservationStatusControl } from './ReservationStatusControl';
import { PaymentForm } from './PaymentForm';
import type { ReservationFilters } from '../../types/playgrounds';

interface ReservationsListProps {
    playgroundId?: number;
    userId?: number;
}

export const ReservationsList: React.FC<ReservationsListProps> = ({
    playgroundId,
    userId
}) => {
    const { t } = useTranslation();
    const {
        reservations,
        isReservationsLoading,
        reservationsError,
        fetchReservations,
        deleteReservation
    } = usePlaygroundStore();

    const [filters, setFilters] = useState<ReservationFilters>({
        playgroundId,
        userId,
        page: 0,
        size: 10
    });

    const [showPaymentForm, setShowPaymentForm] = useState<number | null>(null);

    useEffect(() => {
        fetchReservations(filters);
    }, [fetchReservations, filters]);

    const handleDeleteReservation = async (reservationId: number) => {
        if (window.confirm(t('reservations.confirmDelete'))) {
            const success = await deleteReservation(reservationId);
            if (success) {
                // Refresh the list
                fetchReservations(filters);
            }
        }
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const formatDateTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleString();
    };

    if (isReservationsLoading && !reservations) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">{t('common.loading')}</span>
            </div>
        );
    }

    if (reservationsError) {
        return (
            <div className="text-red-600 p-4 bg-red-50 rounded-md">
                {reservationsError}
            </div>
        );
    }

    if (!reservations || reservations.content.length === 0) {
        return (
            <div className="text-gray-600 p-4 text-center">
                {t('reservations.noReservations')}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                {reservations.content.map((reservation) => (
                    <div key={reservation.id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">
                                    {reservation.playground.name}
                                </h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>
                                        <span className="font-medium">{t('reservations.details.id')}:</span> #{reservation.id}
                                    </p>
                                    <p>
                                        <span className="font-medium">{t('reservations.details.startTime')}:</span> {formatDateTime(reservation.startTime)}
                                    </p>
                                    <p>
                                        <span className="font-medium">{t('reservations.details.endTime')}:</span> {formatDateTime(reservation.endTime)}
                                    </p>
                                    <p>
                                        <span className="font-medium">{t('reservations.details.userId')}:</span> {reservation.userId}
                                    </p>
                                    <p>
                                        <span className="font-medium">{t('reservations.details.price')}:</span> ${reservation.playground.pricePerHour}/hour
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <ReservationStatusControl
                                    reservation={reservation}
                                    onStatusUpdate={() => fetchReservations(filters)}
                                />

                                <div className="flex flex-wrap gap-2">
                                    {reservation.status !== 'PAID' && reservation.status !== 'CANCELLED' && (
                                        <button
                                            onClick={() => setShowPaymentForm(reservation.id)}
                                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                        >
                                            {t('reservations.actions.pay')}
                                        </button>
                                    )}

                                    {reservation.status !== 'COMPLETED' && reservation.status !== 'PAID' && (
                                        <button
                                            onClick={() => handleDeleteReservation(reservation.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                                            disabled={isReservationsLoading}
                                        >
                                            {t('reservations.actions.delete')}
                                        </button>
                                    )}
                                </div>

                                {showPaymentForm === reservation.id && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-medium mb-3">{t('reservations.payment.title')}</h4>
                                        <PaymentForm
                                            reservationId={reservation.id}
                                            onSuccess={() => {
                                                setShowPaymentForm(null);
                                                fetchReservations(filters);
                                            }}
                                            onCancel={() => setShowPaymentForm(null)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {reservations.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(Math.max(0, (filters.page || 0) - 1))}
                        disabled={!reservations.number || reservations.number === 0}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                    >
                        {t('common.previous')}
                    </button>
                    
                    <span className="text-sm text-gray-600">
                        {t('common.page')} {(filters.page || 0) + 1} {t('common.of')} {reservations.totalPages}
                    </span>
                    
                    <button
                        onClick={() => handlePageChange((filters.page || 0) + 1)}
                        disabled={reservations.last}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}
        </div>
    );
};
