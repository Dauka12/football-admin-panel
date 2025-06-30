import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReservationForm } from '../../components/playgrounds/ReservationForm';
import { ReservationsList } from '../../components/playgrounds/ReservationsList';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Modal from '../../components/ui/Modal';
import { useCityStore } from '../../store/cityStore';
import { usePlaygroundStore } from '../../store/playgroundStore';
import type { ReservationFilters } from '../../types/playgrounds';

const ReservationsPage: React.FC = () => {
    const { t } = useTranslation();
    const { cities, fetchCities } = useCityStore();
    const { playgrounds, fetchPlaygrounds } = usePlaygroundStore();
    
    const [showReservationForm, setShowReservationForm] = useState(false);
    const [selectedPlaygroundId, setSelectedPlaygroundId] = useState<number | undefined>();
    
    const [filters, setFilters] = useState<ReservationFilters>({
        page: 0,
        size: 10
    });

    useEffect(() => {
        fetchCities();
        fetchPlaygrounds(); // Load playgrounds for filter dropdown
    }, [fetchCities, fetchPlaygrounds]);

    const handleFilterChange = (field: keyof ReservationFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            page: 0 // Reset to first page when filter changes
        }));
    };

    const handleCreateReservation = (playgroundId?: number) => {
        setSelectedPlaygroundId(playgroundId);
        setShowReservationForm(true);
    };

    const breadcrumbItems = [
        { label: t('sidebar.home'), path: '/dashboard' },
        { label: t('reservations.title') }
    ];

    return (
        <div className="space-y-6">
            <Breadcrumb items={breadcrumbItems} />
            
            {/* Header */}
            <div className="bg-card-bg rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('reservations.title')}</h1>
                        <p className="text-gray-400">{t('reservations.subtitle', { defaultValue: 'Manage playground reservations' })}</p>
                    </div>
                    <button
                        onClick={() => handleCreateReservation()}
                        className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center w-full sm:w-auto justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('reservations.form.submit')}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card-bg rounded-lg p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4 text-gold">{t('common.filters')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Playground Filter */}
                    <div>
                        <label htmlFor="playgroundFilter" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('sidebar.playgrounds')}
                        </label>
                        <select
                            id="playgroundFilter"
                            value={filters.playgroundId || ''}
                            onChange={(e) => handleFilterChange('playgroundId', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-white"
                        >
                            <option value="">{t('common.all')}</option>
                            {playgrounds?.content?.map((playground) => (
                                <option key={playground.id} value={playground.id}>
                                    {playground.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* User ID Filter */}
                    <div>
                        <label htmlFor="userFilter" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('reservations.details.userId')}
                        </label>
                        <input
                            type="number"
                            id="userFilter"
                            value={filters.userId || ''}
                            onChange={(e) => handleFilterChange('userId', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-white"
                            placeholder={t('reservations.filters.userIdPlaceholder', { defaultValue: 'Enter user ID' })}
                        />
                    </div>

                    {/* Start Date Filter */}
                    <div>
                        <label htmlFor="startDateFilter" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('reservations.filters.startDate', { defaultValue: 'Start Date' })}
                        </label>
                        <input
                            type="datetime-local"
                            id="startDateFilter"
                            value={filters.startDate || ''}
                            onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-white"
                        />
                    </div>

                    {/* End Date Filter */}
                    <div>
                        <label htmlFor="endDateFilter" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('reservations.filters.endDate', { defaultValue: 'End Date' })}
                        </label>
                        <input
                            type="datetime-local"
                            id="endDateFilter"
                            value={filters.endDate || ''}
                            onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                            className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Reservations List */}
            <div className="bg-card-bg rounded-lg p-4 sm:p-6">
                <ReservationsList {...filters} />
            </div>

            {/* Create Reservation Modal */}
            <Modal
                isOpen={showReservationForm}
                onClose={() => setShowReservationForm(false)}
                title={t('reservations.form.submit')}
            >
                <div className="space-y-4">
                    {!selectedPlaygroundId && (
                        <div>
                            <label htmlFor="playgroundSelect" className="block text-sm font-medium text-gray-300 mb-2">
                                {t('sidebar.playgrounds')} *
                            </label>
                            <select
                                id="playgroundSelect"
                                value={selectedPlaygroundId || ''}
                                onChange={(e) => setSelectedPlaygroundId(e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full px-3 py-2 bg-darkest-bg border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold text-white"
                                required
                            >
                                <option value="">{t('common.select')}</option>
                                {playgrounds?.content?.map((playground) => (
                                    <option key={playground.id} value={playground.id}>
                                        {playground.name} - {cities.find(c => c.id === playground.cityId)?.name || t('cities.unknownCity')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    {selectedPlaygroundId && (
                        <ReservationForm
                            playgroundId={selectedPlaygroundId}
                            onSuccess={() => {
                                setShowReservationForm(false);
                                setSelectedPlaygroundId(undefined);
                            }}
                            onCancel={() => {
                                setShowReservationForm(false);
                                setSelectedPlaygroundId(undefined);
                            }}
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default ReservationsPage;
