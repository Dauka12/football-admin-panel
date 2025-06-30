import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaygroundStore } from '../../store/playgroundStore';
import type { PlaygroundReservation, UpdateReservationStatusRequest } from '../../types/playgrounds';

interface ReservationStatusControlProps {
    reservation: PlaygroundReservation;
    onStatusUpdate?: () => void;
}

const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    PAID: 'bg-purple-100 text-purple-800 border-purple-200'
};

const statusOptions: UpdateReservationStatusRequest['statusRequest'][] = [
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED',
    'PAID'
];

export const ReservationStatusControl: React.FC<ReservationStatusControlProps> = ({
    reservation,
    onStatusUpdate
}) => {
    const { t } = useTranslation();
    const { updateReservationStatus, isReservationsLoading } = usePlaygroundStore();
    const [isChangingStatus, setIsChangingStatus] = useState(false);

    const handleStatusChange = async (newStatus: UpdateReservationStatusRequest['statusRequest']) => {
        setIsChangingStatus(true);
        
        try {
            const success = await updateReservationStatus(reservation.id, newStatus);
            if (success) {
                onStatusUpdate?.();
            }
        } finally {
            setIsChangingStatus(false);
        }
    };

    const currentStatusColor = statusColors[reservation.status as keyof typeof statusColors] || statusColors.PENDING;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                    {t('reservations.status.current')}:
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${currentStatusColor}`}>
                    {t(`reservations.status.${reservation.status.toLowerCase()}`)}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                    {t('reservations.status.change')}:
                </span>
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            disabled={
                                status === reservation.status || 
                                isReservationsLoading || 
                                isChangingStatus
                            }
                            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                                status === reservation.status 
                                    ? `${statusColors[status]} opacity-50 cursor-not-allowed`
                                    : `${statusColors[status]} hover:opacity-80 cursor-pointer`
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {t(`reservations.status.${status.toLowerCase()}`)}
                        </button>
                    ))}
                </div>
            </div>

            {(isReservationsLoading || isChangingStatus) && (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    {t('reservations.status.updating')}
                </div>
            )}
        </div>
    );
};
