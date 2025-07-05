import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PlaygroundForm from '../../components/playgrounds/PlaygroundForm';
import { ReservationForm } from '../../components/playgrounds/ReservationForm';
import { ReservationsList } from '../../components/playgrounds/ReservationsList';
import PlaygroundFacilitiesManager from '../../components/playgroundFacilities/PlaygroundFacilitiesManager';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FileUpload from '../../components/ui/FileUpload';
import ImageDisplay from '../../components/ui/ImageDisplay';
import Modal from '../../components/ui/Modal';
import { YandexMapDisplay } from '../../components/maps/YandexMapDisplay';
import { useCityStore } from '../../store/cityStore';
import { usePlaygroundStore } from '../../store/playgroundStore';
import { type FileType } from '../../types/files';
import type { UpdatePlaygroundRequest } from '../../types/playgrounds';

const PlaygroundDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const playgroundId = id ? parseInt(id) : -1;
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { cities, fetchCities } = useCityStore();
    
    const {
        currentPlayground,
        isLoading,
        error,
        fetchPlayground,
        updatePlayground,
        deletePlayground,
        clearCurrentPlayground
    } = usePlaygroundStore();

    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAvatarUpload, setShowAvatarUpload] = useState(false);
    const [showReservationForm, setShowReservationForm] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'details' | 'reservations' | 'facilities'>('details');    const isRussian = i18n.language === 'ru';

    // Load playground data
    const loadPlayground = useCallback(() => {
        if (playgroundId > 0) {
            fetchPlayground(playgroundId);
        }
    }, [playgroundId, fetchPlayground]);

    useEffect(() => {
        loadPlayground();
        fetchCities(); // Загружаем города для отображения названия
        return () => {
            clearCurrentPlayground();
        };
    }, [loadPlayground, clearCurrentPlayground, fetchCities]);

    const handleUpdate = async (data: UpdatePlaygroundRequest) => {
        if (playgroundId > 0) {
            const success = await updatePlayground(playgroundId, data);
            if (success) {
                setIsEditing(false);
                loadPlayground();
            }
        }
    };

    const handleDelete = async () => {
        if (playgroundId > 0) {
            const success = await deletePlayground(playgroundId);
            if (success) {
                navigate('/dashboard/playgrounds');
            }
        }
    };

    const handleAvatarUpload = (fileIds: number[]) => {
        if (fileIds.length > 0) {
            // Here you could update the playground with the new avatar ID
            // For now, we'll just close the upload modal and refresh the playground data
            setShowAvatarUpload(false);
            loadPlayground(); // Refresh playground data to show new avatar
        }
    };

    const handleAvatarError = (error: string) => {
        console.error('Playground avatar upload error:', error);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(isRussian ? 'ru-RU' : 'en-US', {
            style: 'currency',
            currency: 'KZT',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatTime = (time: string) => {
        return time.slice(0, 5); // Format HH:MM
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-gold mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-400">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (error || !currentPlayground) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">{t('playgrounds.notFound')}</h2>
                <Link 
                    to="/dashboard/playgrounds" 
                    className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
                >
                    {t('common.backToList')}
                </Link>
            </div>
        );
    }

    const breadcrumbItems = [
        { label: t('sidebar.home'), path: '/dashboard' },
        { label: t('sidebar.playgrounds'), path: '/dashboard/playgrounds' },
        { label: currentPlayground.name }
    ];

    return (
        <div className="space-y-6">
            <Breadcrumb items={breadcrumbItems} />
            
            {/* Playground Header */}
            <div className="bg-card-bg rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <div className="flex items-center space-x-4">
                        {/* Playground Avatar */}
                        <div className="relative">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                                <ImageDisplay
                                    objectId={playgroundId}
                                    type={'playground-avatar' as FileType}
                                    alt={`${currentPlayground.name} image`}
                                    className="w-full h-full object-cover"
                                    fallbackSrc=""
                                    showLoader={false}
                                />
                                {/* Fallback icon if no image */}
                                <svg className="w-8 h-8 text-gray-400 absolute inset-0 m-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <button
                                onClick={() => setShowAvatarUpload(true)}
                                className="absolute bottom-0 right-0 bg-gold text-darkest-bg rounded-full p-1 hover:bg-gold/90 transition-colors"
                                title={t('playgrounds.changeImage')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                </svg>
                            </button>
                        </div>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{currentPlayground.name}</h1>
                            <div className="flex items-center space-x-4">
                            <div className="flex items-center text-gray-400">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {cities.find(city => city.id === currentPlayground.cityId)?.name || t('cities.unknownCity')}
                            </div>
                            {currentPlayground.active ? (
                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm">
                                    {t('playgrounds.active')}
                                </span>
                            ) : (
                                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-sm">
                                    {t('playgrounds.inactive')}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-gold text-darkest-bg px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            {t('common.edit')}
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-accent-pink text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-accent-pink/90 transition-colors duration-200 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-card-bg rounded-lg">
                <div className="border-b border-gray-700">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setSelectedTab('details')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                selectedTab === 'details'
                                    ? 'border-gold text-gold'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            {t('playgrounds.details')}
                        </button>
                        <button
                            onClick={() => setSelectedTab('reservations')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                selectedTab === 'reservations'
                                    ? 'border-gold text-gold'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            {t('playgrounds.reservations')}
                        </button>
                        <button
                            onClick={() => setSelectedTab('facilities')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                selectedTab === 'facilities'
                                    ? 'border-gold text-gold'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            {t('playgrounds.facilities')}
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {selectedTab === 'details' ? (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-darkest-bg rounded-lg p-4">
                                    <h3 className="font-semibold mb-2 text-gold">{t('playgrounds.pricing')}</h3>
                                    <p className="text-2xl font-bold">{formatPrice(currentPlayground.pricePerHour)}/ч</p>
                                </div>
                                
                                <div className="bg-darkest-bg rounded-lg p-4">
                                    <h3 className="font-semibold mb-2 text-gold">{t('playgrounds.capacity')}</h3>
                                    <p className="text-2xl font-bold">
                                        {currentPlayground.currentCapacity}/{currentPlayground.maxCapacity}
                                    </p>
                                    <p className="text-sm text-gray-400">{t('playgrounds.currentMax')}</p>
                                </div>
                                
                                <div className="bg-darkest-bg rounded-lg p-4">
                                    <h3 className="font-semibold mb-2 text-gold">{t('playgrounds.workingHours')}</h3>
                                    <p className="text-lg font-medium">
                                        {formatTime(currentPlayground.availableFrom)} - {formatTime(currentPlayground.availableTo)}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-darkest-bg rounded-lg p-4">
                                <h3 className="font-semibold mb-3 text-gold">{t('playgrounds.description')}</h3>
                                <p className="text-gray-300 leading-relaxed">{currentPlayground.description}</p>
                            </div>

                            {/* Address */}
                            {currentPlayground.address && (
                                <div className="bg-darkest-bg rounded-lg p-4">
                                    <h3 className="font-semibold mb-3 text-gold">{t('playgrounds.address')}</h3>
                                    <p className="text-gray-300 leading-relaxed">{currentPlayground.address}</p>
                                </div>
                            )}

                            {/* Map Display */}
                            <div className="bg-darkest-bg rounded-lg p-4">
                                <h3 className="font-semibold mb-3 text-gold">{t('playgrounds.location')}</h3>
                                <div className="h-64 rounded-lg overflow-hidden">
                                    <YandexMapDisplay
                                        latitude={currentPlayground.latitude}
                                        longitude={currentPlayground.longitude}
                                        address={currentPlayground.address}
                                        name={currentPlayground.name}
                                        className="w-full h-full"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : selectedTab === 'reservations' ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gold">{t('reservations.title')}</h3>
                                <button
                                    onClick={() => setShowReservationForm(true)}
                                    className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {t('reservations.form.submit')}
                                </button>
                            </div>
                            
                            <ReservationsList playgroundId={playgroundId} />
                        </div>
                    ) : selectedTab === 'facilities' ? (
                        <PlaygroundFacilitiesManager playgroundId={playgroundId} />
                    ) : null}
                </div>
            </div>

            {/* Edit Playground Modal */}
            <Modal 
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                title={t('playgrounds.editPlayground')}
            >
                <PlaygroundForm 
                    initialData={{
                        name: currentPlayground.name,
                        cityId: currentPlayground.cityId,
                        pricePerHour: currentPlayground.pricePerHour,
                        description: currentPlayground.description,
                        maxCapacity: currentPlayground.maxCapacity,
                        currentCapacity: currentPlayground.currentCapacity,
                        availableFrom: currentPlayground.availableFrom,
                        availableTo: currentPlayground.availableTo,
                        fieldSize: currentPlayground.fieldSize || '',
                        fieldCoverType: currentPlayground.fieldCoverType || '',
                        fieldSurfaceType: currentPlayground.fieldSurfaceType || '',
                        address: currentPlayground.address || '',
                        latitude: currentPlayground.latitude || 0,
                        longitude: currentPlayground.longitude || 0
                    }}
                    onSubmit={handleUpdate} 
                    onCancel={() => setIsEditing(false)}
                    isEditing={true}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title={t('playgrounds.confirmDelete')}
            >
                <div>
                    <p className="text-gray-300 mb-6">
                        {t('playgrounds.deleteWarning', { name: currentPlayground.name })}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:space-x-3">
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="w-full sm:w-auto px-4 py-2 bg-accent-pink text-white rounded-md hover:bg-accent-pink/90 transition-colors duration-200"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Avatar Upload Modal */}
            <Modal
                isOpen={showAvatarUpload}
                onClose={() => setShowAvatarUpload(false)}
                title={t('playgrounds.changeImage')}
            >
                <div className="space-y-4">
                    <FileUpload
                        type={'playground-avatar' as FileType}
                        objectId={playgroundId}
                        accept="image/*"
                        maxSize={5}
                        onUploadComplete={handleAvatarUpload}
                        onUploadError={handleAvatarError}
                        className="h-40"
                    >
                        <div className="text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-gray-600">
                                {t('playgrounds.uploadImageHint')}
                            </p>
                        </div>
                    </FileUpload>

                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setShowAvatarUpload(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Create Reservation Modal */}
            <Modal
                isOpen={showReservationForm}
                onClose={() => setShowReservationForm(false)}
                title={t('reservations.form.submit')}
            >
                <ReservationForm
                    playgroundId={playgroundId}
                    onSuccess={() => {
                        setShowReservationForm(false);
                        // The ReservationsList component will auto-refresh via its own state management
                    }}
                    onCancel={() => setShowReservationForm(false)}
                />
            </Modal>
        </div>
    );
};

export default PlaygroundDetailPage;
