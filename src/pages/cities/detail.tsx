import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import CityForm from '../../components/cities/CityForm';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { LoadingSpinner } from '../../components/ui/LoadingIndicator';
import Modal from '../../components/ui/Modal';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useCityStore } from '../../store/cityStore';
import type { CityUpdateRequest } from '../../types/cities';

const CityDetailPage: React.FC = () => {

    usePerformanceMonitor('CityDetailPage');

    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        currentCity,
        isLoading,
        error,
        fetchCity,
        updateCity,
        deleteCity,
        clearError
    } = useCityStore();

    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCity(parseInt(id));
        }
        return () => {
            clearError();
        };
    }, [id, fetchCity, clearError]);

    const handleUpdateCity = async (data: CityUpdateRequest) => {
        if (!currentCity) return;
        
        const success = await updateCity(currentCity.id, data);
        if (success) {
            setShowEditForm(false);
        }
    };

    const handleDeleteCity = async () => {
        if (!currentCity) return;
        
        const success = await deleteCity(currentCity.id);
        if (success) {
            navigate('/dashboard/cities');
        }
    };

    const breadcrumbItems = [
        { label: t('cities.title'), to: '/dashboard/cities' },
        { label: currentCity?.name || t('cities.cityDetails') }
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !currentCity) {
        return (
            <div className="text-center py-12">
                <div className="text-red-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-1">
                    {t('cities.notFound')}
                </h3>
                <p className="text-gray-400 mb-4">
                    {error || 'The requested city could not be found.'}
                </p>
                <button
                    onClick={() => navigate('/dashboard/cities')}
                    className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
                >
                    {t('cities.backToList')}
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {currentCity.name}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            currentCity.active 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                            {currentCity.active ? t('common.active') : t('common.inactive')}
                        </span>
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {currentCity.region}, {currentCity.country}
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowEditForm(true)}
                        className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        {t('common.edit')}
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        {t('common.delete')}
                    </button>
                </div>
            </div>

            {/* City Details Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-card-bg rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        {t('cities.basicInfo')}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-400">{t('cities.name')}</dt>
                            <dd className="mt-1 text-sm text-white">{currentCity.name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-400">{t('cities.country')}</dt>
                            <dd className="mt-1 text-sm text-white">{currentCity.country}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-400">{t('cities.region')}</dt>
                            <dd className="mt-1 text-sm text-white">{currentCity.region}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-400">{t('common.status')}</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    currentCity.active 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                    {currentCity.active ? t('common.active') : t('common.inactive')}
                                </span>
                            </dd>
                        </div>
                        {currentCity.description && (
                            <div>
                                <dt className="text-sm font-medium text-gray-400">{t('common.description')}</dt>
                                <dd className="mt-1 text-sm text-white">{currentCity.description}</dd>
                            </div>
                        )}
                    </div>
                </div>

                {/* Geographic Information */}
                <div className="bg-card-bg rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {t('cities.geographicInfo')}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-400">{t('cities.latitude')}</dt>
                            <dd className="mt-1 text-sm text-white">{currentCity.latitude.toFixed(6)}°</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-400">{t('cities.longitude')}</dt>
                            <dd className="mt-1 text-sm text-white">{currentCity.longitude.toFixed(6)}°</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-400">{t('cities.coordinates')}</dt>
                            <dd className="mt-1 text-sm text-white font-mono">
                                {currentCity.latitude.toFixed(6)}, {currentCity.longitude.toFixed(6)}
                            </dd>
                        </div>
                    </div>
                </div>

                {/* Metadata */}
                <div className="bg-card-bg rounded-lg p-6 lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('common.metadata')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-400">{t('common.createdAt')}</dt>
                            <dd className="mt-1 text-sm text-white">
                                {new Date(currentCity.createdAt).toLocaleDateString()} {new Date(currentCity.createdAt).toLocaleTimeString()}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-400">{t('common.updatedAt')}</dt>
                            <dd className="mt-1 text-sm text-white">
                                {new Date(currentCity.updatedAt).toLocaleDateString()} {new Date(currentCity.updatedAt).toLocaleTimeString()}
                            </dd>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit City Modal */}
            <Modal
                isOpen={showEditForm}
                onClose={() => setShowEditForm(false)}
                title={t('cities.editCity')}
            >
                <CityForm
                    city={currentCity}
                    onSubmit={handleUpdateCity}
                    onCancel={() => setShowEditForm(false)}
                    isSubmitting={isLoading}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={t('cities.confirmDelete')}
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        {t('cities.deleteWarningDetail', { name: currentCity.name })}
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDeleteCity}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? t('common.loading') : t('common.delete')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CityDetailPage;
