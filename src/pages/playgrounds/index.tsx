import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PlaygroundForm from '../../components/playgrounds/PlaygroundForm';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ImageCarousel from '../../components/ui/ImageCarousel';
import Modal from '../../components/ui/Modal';
import { useCityStore } from '../../store/cityStore';
import { usePlaygroundStore } from '../../store/playgroundStore';
import type { CreatePlaygroundRequest, PlaygroundFilters } from '../../types/playgrounds';

const PlaygroundsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { cities, fetchCities } = useCityStore();
    const {
        playgrounds,
        isLoading,
        error,
        fetchPlaygrounds,
        createPlayground,
        deletePlayground,
        clearError
    } = usePlaygroundStore();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [cityFilter, setCityFilter] = useState<number | undefined>(undefined); // Изменено с locationFilter на cityFilter
    const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    const isRussian = i18n.language === 'ru';

    // Load playgrounds with filters
    const loadPlaygrounds = useCallback(() => {
        const filters: PlaygroundFilters = {
            page: currentPage,
            size: 12
        };

        if (searchTerm.trim()) {
            filters.name = searchTerm.trim();
        }

        if (cityFilter) {
            filters.playgroundCityId = cityFilter; // Изменено согласно Swagger API
        }

        if (priceFilter.min) {
            filters.minPrice = parseFloat(priceFilter.min);
        }

        if (priceFilter.max) {
            filters.maxPrice = parseFloat(priceFilter.max);
        }

        fetchPlaygrounds(filters);
    }, [fetchPlaygrounds, currentPage, searchTerm, cityFilter, priceFilter]);

    useEffect(() => {
        loadPlaygrounds();
        fetchCities(); // Загружаем города для фильтра
    }, [loadPlaygrounds, fetchCities]);

    useEffect(() => {
        // Reset to first page when filters change
        if (currentPage !== 0) {
            setCurrentPage(0);
        }
    }, [searchTerm, cityFilter, priceFilter]);

    const handleCreatePlayground = async (data: CreatePlaygroundRequest) => {
        const success = await createPlayground(data);
        if (success) {
            setIsCreateModalOpen(false);
            loadPlaygrounds();
        }
    };

    const handleDeletePlayground = async () => {
        if (!deleteConfirm) return;
        
        const success = await deletePlayground(deleteConfirm.id);
        if (success) {
            setDeleteConfirm(null);
            loadPlaygrounds();
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
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

    // Breadcrumb items
    const breadcrumbItems = [
        { label: t('sidebar.home'), path: '/dashboard' },
        { label: t('sidebar.playgrounds') }
    ];

    if (error) {
        return (
            <div>
                <Breadcrumb items={breadcrumbItems} />
                <div className="bg-red-500/20 border border-red-500 p-4 rounded-md text-red-500">
                    <p>{error}</p>
                    <button 
                        onClick={() => {
                            clearError();
                            loadPlaygrounds();
                        }}
                        className="mt-2 text-gold hover:underline"
                    >
                        {t('common.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <h1 className={`font-bold ${isRussian ? 'text-xl' : 'text-2xl'}`}>
                    {t('playgrounds.title')}
                </h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {t('playgrounds.createPlayground')}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-card-bg rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder={t('playgrounds.searchByName')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-600 rounded-md bg-darkest-bg text-white focus:border-gold focus:outline-none"
                        />
                    </div>
                    <div>
                        <select
                            value={cityFilter || ''}
                            onChange={(e) => setCityFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full p-2 border border-gray-600 rounded-md bg-darkest-bg text-white focus:border-gold focus:outline-none"
                        >
                            <option value="">{t('cities.allCities')}</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder={t('playgrounds.minPrice')}
                            value={priceFilter.min}
                            onChange={(e) => setPriceFilter(prev => ({ ...prev, min: e.target.value }))}
                            className="w-full p-2 border border-gray-600 rounded-md bg-darkest-bg text-white focus:border-gold focus:outline-none"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder={t('playgrounds.maxPrice')}
                            value={priceFilter.max}
                            onChange={(e) => setPriceFilter(prev => ({ ...prev, max: e.target.value }))}
                            className="w-full p-2 border border-gray-600 rounded-md bg-darkest-bg text-white focus:border-gold focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <svg className="animate-spin h-8 w-8 text-gold mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-400">{t('common.loading')}</p>
                    </div>
                </div>
            ) : !playgrounds || playgrounds.content.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">{t('playgrounds.noPlaygrounds')}</h3>
                    <p className="text-gray-400 mb-4">{t('playgrounds.createFirst')}</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200"
                    >
                        {t('playgrounds.createPlayground')}
                    </button>
                </div>
            ) : (
                <>
                    {/* Playgrounds Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {playgrounds.content.map((playground) => (
                            <div key={playground.id} className="bg-card-bg rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                {/* Playground Image/Icon */}
                                <div className="h-48">
                                    {playground.images && playground.images.length > 0 ? (
                                        <ImageCarousel
                                            images={playground.images}
                                            alt={playground.name}
                                            className="h-full"
                                            showThumbnails={false}
                                            autoPlay={false}
                                        />
                                    ) : (
                                        <div className="h-full bg-gradient-to-br from-gold/20 to-accent-pink/20 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-lg truncate mr-2">{playground.name}</h3>
                                        <div className="flex items-center space-x-2">
                                            {playground.active ? (
                                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                                                    {t('playgrounds.active')}
                                                </span>
                                            ) : (
                                                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                                                    {t('playgrounds.inactive')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Location and Price */}
                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center text-gray-400 text-sm">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="truncate">
                                                {cities.find(city => city.id === playground.cityId)?.name || t('cities.unknownCity')}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gold text-sm font-medium">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            {formatPrice(playground.pricePerHour)}/ч
                                        </div>
                                    </div>

                                    {/* Capacity and Hours */}
                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">{t('playgrounds.capacity')}:</span>
                                            <div className="font-medium">
                                                {playground.currentCapacity}/{playground.maxCapacity}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">{t('playgrounds.hours')}:</span>
                                            <div className="font-medium">
                                                {formatTime(playground.availableFrom)} - {formatTime(playground.availableTo)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                                        {playground.description}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex justify-between items-center">
                                        <Link
                                            to={`/dashboard/playgrounds/${playground.id}`}
                                            className="text-gold hover:underline text-sm transition-colors duration-200"
                                        >
                                            {t('common.viewDetails')}
                                        </Link>
                                        <button
                                            onClick={() => setDeleteConfirm({ id: playground.id, name: playground.name })}
                                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {playgrounds.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-3 py-1 bg-card-bg rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-darkest-bg transition-colors duration-200"
                            >
                                {t('common.previous')}
                            </button>
                            
                            <span className="text-gray-400">
                                {t('common.page')} {currentPage + 1} {t('common.of')} {playgrounds.totalPages}
                            </span>
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= playgrounds.totalPages - 1}
                                className="px-3 py-1 bg-card-bg rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-darkest-bg transition-colors duration-200"
                            >
                                {t('common.next')}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create Playground Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={t('playgrounds.createPlayground')}
            >
                <PlaygroundForm
                    onSubmit={handleCreatePlayground}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title={t('playgrounds.confirmDelete')}
            >
                {deleteConfirm && (
                    <div>
                        <p className="text-gray-300 mb-6">
                            {t('playgrounds.deleteWarning', { name: deleteConfirm.name })}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:space-x-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleDeletePlayground}
                                className="w-full sm:w-auto px-4 py-2 bg-accent-pink text-white rounded-md hover:bg-accent-pink/90 transition-colors duration-200"
                            >
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PlaygroundsPage;
