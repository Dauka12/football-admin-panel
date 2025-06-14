import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { TournamentCategoryForm } from '../../components/tournamentCategories/TournamentCategoryForm';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { LoadingSpinner } from '../../components/ui/LoadingIndicator';
import Modal from '../../components/ui/Modal';
import { useTournamentCategoryStore } from '../../store/tournamentCategoryStore';

const TournamentCategoryDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const {
        currentCategory,
        isLoading,
        error,
        fetchCategoryById,
        updateCategory,
        deleteCategory,
        clearError
    } = useTournamentCategoryStore();

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCategoryById(parseInt(id));
        }
    }, [id, fetchCategoryById]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    const handleEdit = async (data: any) => {
        if (!currentCategory) return;
        
        setIsSubmitting(true);
        try {
            await updateCategory(currentCategory.id, data);
            setShowEditModal(false);
        } catch (error) {
            // Error is handled by the store
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!currentCategory) return;
        
        setIsSubmitting(true);
        try {
            await deleteCategory(currentCategory.id);
            navigate('/tournament-categories');
        } catch (error) {
            // Error is handled by the store
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <LoadingSpinner />
            </div>
        );
    }

    if (!currentCategory) {
        return (
            <div className="space-y-6">            <Breadcrumb 
                items={[
                    { label: t('common.dashboard'), path: '/' },
                    { label: t('sidebar.tournamentCategories'), path: '/tournament-categories' },
                    { label: t('common.notFound') }
                ]} 
            />
                
                <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-300 mb-2">{t('tournamentCategories.notFound')}</h2>
                    <p className="text-gray-400 mb-4">{t('tournamentCategories.notFoundDescription')}</p>
                    <button
                        onClick={() => navigate('/tournament-categories')}
                        className="bg-gold text-darkest-bg px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors duration-200 font-medium"
                    >
                        {t('tournamentCategories.backToList')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb 
                items={[
                    { label: t('common.dashboard'), path: '/' },
                    { label: t('sidebar.tournamentCategories'), path: '/tournament-categories' },
                    { label: currentCategory.name }
                ]} 
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-3">
                        <h1 className="text-2xl font-bold text-white">{currentCategory.name}</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            currentCategory.active 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-red-500/20 text-red-500'
                        }`}>
                            {currentCategory.active ? t('common.active') : t('common.inactive')}
                        </span>
                    </div>
                    <p className="text-gray-400 mt-1">{t('tournamentCategories.categoryDetails')}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t('common.edit')}
                    </button>
                    
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {t('common.delete')}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-500">{error}</span>
                    </div>
                </div>
            )}

            {/* Category Details */}
            <div className="space-y-6">
                {/* Main Info Card */}
                <div className="bg-gradient-to-r from-card-bg to-darkest-bg rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gold to-yellow-500 p-4">
                        <h3 className="text-darkest-bg font-bold text-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {t('tournamentCategories.categoryInformation')}
                        </h3>
                    </div>
                    
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-400 mb-1">{t('tournamentCategories.name')}</h4>
                                    <p className="text-white text-lg font-semibold">{currentCategory.name}</p>
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-medium text-gray-400 mb-1">{t('common.status')}</h4>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        currentCategory.active 
                                            ? 'bg-green-500/20 text-green-500' 
                                            : 'bg-red-500/20 text-red-500'
                                    }`}>
                                        {currentCategory.active ? t('common.active') : t('common.inactive')}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-1">{t('tournamentCategories.description')}</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {currentCategory.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Information Card */}
                <div className="bg-card-bg rounded-lg border border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-700">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('common.additionalInformation')}
                        </h3>
                    </div>
                    
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-2">{t('tournamentCategories.categoryId')}</h4>
                                <p className="text-white font-mono text-sm bg-darkest-bg px-3 py-1 rounded border border-gray-700">
                                    #{currentCategory.id}
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-2">{t('common.actions')}</h4>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="text-blue-500 hover:text-blue-400 transition-colors text-sm font-medium"
                                    >
                                        {t('common.edit')}
                                    </button>
                                    <span className="text-gray-600">•</span>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="text-red-500 hover:text-red-400 transition-colors text-sm font-medium"
                                    >
                                        {t('common.delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={t('tournamentCategories.edit')}
            >
                <TournamentCategoryForm
                    category={currentCategory}
                    onSubmit={handleEdit}
                    onCancel={() => setShowEditModal(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={t('common.confirmDelete')}
            >
                <div className="space-y-4">
                    <p className="text-gray-300">
                        {t('tournamentCategories.deleteConfirmation', { name: currentCategory.name })}
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                            disabled={isSubmitting}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('common.deleting')}
                                </>
                            ) : (
                                t('common.delete')
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TournamentCategoryDetailPage;
