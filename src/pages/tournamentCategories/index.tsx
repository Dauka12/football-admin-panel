import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TournamentCategoryForm } from '../../components/tournamentCategories/TournamentCategoryForm';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { LoadingSpinner } from '../../components/ui/LoadingIndicator';
import Modal from '../../components/ui/Modal';
import { useTournamentCategoryStore } from '../../store/tournamentCategoryStore';
import type { TournamentCategory } from '../../types/tournamentCategories';

const TournamentCategoriesPage: React.FC = () => {
    const { t } = useTranslation();
    const {
        categories,
        isLoading,
        error,
        totalElements,
        totalPages,
        currentPage,
        pageSize,
        filters,
        statistics,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        setFilters,
        clearFilters,
        clearError
    } = useTournamentCategoryStore();

    // Local state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<TournamentCategory | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<TournamentCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter states
    const [filterName, setFilterName] = useState(filters.name || '');
    const [filterActive, setFilterActive] = useState(filters.active?.toString() || '');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    // Handlers
    const handleCreate = async (data: any) => {
        setIsSubmitting(true);
        try {
            await createCategory(data);
            setShowCreateModal(false);
        } catch (error) {
            // Error is handled by the store
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (data: any) => {
        if (!editingCategory) return;
        
        setIsSubmitting(true);
        try {
            await updateCategory(editingCategory.id, data);
            setEditingCategory(null);
        } catch (error) {
            // Error is handled by the store
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingCategory) return;
        
        setIsSubmitting(true);
        try {
            await deleteCategory(deletingCategory.id);
            setDeletingCategory(null);
        } catch (error) {
            // Error is handled by the store
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePageChange = (page: number) => {
        setFilters({ page });
        fetchCategories(true, page);
    };

    const applyFilters = () => {
        const newFilters = {
            name: filterName || undefined,
            active: filterActive ? filterActive === 'true' : undefined,
            page: 0
        };
        setFilters(newFilters);
        fetchCategories(true, 0);
        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterName('');
        setFilterActive('');
        clearFilters();
        fetchCategories(false, 0);
        setShowFilters(false);
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb 
                items={[
                    { label: t('common.dashboard'), path: '/' },
                    { label: t('navigation.tournamentCategories') }
                ]} 
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{t('navigation.tournamentCategories')}</h1>
                    <p className="text-gray-400 mt-1">{t('tournamentCategories.description')}</p>
                </div>
                
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gold text-darkest-bg px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors duration-200 font-medium flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('tournamentCategories.create')}
                </button>
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

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">{t('tournamentCategories.total')}</p>
                            <p className="text-2xl font-bold text-white">{statistics.total}</p>
                        </div>
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">{t('common.active')}</p>
                            <p className="text-2xl font-bold text-green-500">{statistics.active}</p>
                        </div>
                        <div className="bg-green-500/20 p-3 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">{t('common.inactive')}</p>
                            <p className="text-2xl font-bold text-red-500">{statistics.inactive}</p>
                        </div>
                        <div className="bg-red-500/20 p-3 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-card-bg rounded-lg p-6 border border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <h2 className="text-lg font-semibold text-white">{t('tournamentCategories.list')}</h2>
                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                            Object.keys(filters).length > 2 
                            ? 'bg-gold text-darkest-bg' 
                            : 'bg-card-bg border border-gray-700 text-white hover:bg-gray-700'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                        </svg>
                        {t('common.filters')}
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-darkest-bg rounded-lg p-4 mb-6 border border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400">{t('tournamentCategories.name')}</label>
                                <input
                                    type="text"
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    placeholder={t('tournamentCategories.searchName')}
                                    className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white placeholder-gray-400"
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400">{t('common.status')}</label>
                                <select
                                    value={filterActive}
                                    onChange={(e) => setFilterActive(e.target.value)}
                                    className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200 text-white"
                                >
                                    <option value="">{t('common.all')}</option>
                                    <option value="true">{t('common.active')}</option>
                                    <option value="false">{t('common.inactive')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4">
                            <button
                                onClick={resetFilters}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                            >
                                {t('common.reset')}
                            </button>
                            <button
                                onClick={applyFilters}
                                className="px-6 py-2 bg-gold text-darkest-bg rounded-lg hover:bg-gold/90 transition-colors duration-200 font-medium"
                            >
                                {t('common.apply')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Categories Table */}
                {isLoading ? (
                    <LoadingSpinner />
                ) : categories.length === 0 ? (
                    <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-gray-500 text-lg">{t('tournamentCategories.noCategories')}</p>
                        <p className="text-gray-400 mt-2">{t('tournamentCategories.createFirst')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-300">{t('tournamentCategories.name')}</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-300">{t('tournamentCategories.description')}</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-300">{t('common.status')}</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-300">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                                        <td className="py-3 px-4">
                                            <Link 
                                                to={`/tournament-categories/${category.id}`}
                                                className="text-gold hover:text-gold/80 font-medium transition-colors"
                                            >
                                                {category.name}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-gray-300 truncate max-w-xs">{category.description}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                category.active 
                                                    ? 'bg-green-500/20 text-green-500' 
                                                    : 'bg-red-500/20 text-red-500'
                                            }`}>
                                                {category.active ? t('common.active') : t('common.inactive')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => setEditingCategory(category)}
                                                    className="text-blue-500 hover:text-blue-400 transition-colors p-1"
                                                    title={t('common.edit')}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setDeletingCategory(category)}
                                                    className="text-red-500 hover:text-red-400 transition-colors p-1"
                                                    title={t('common.delete')}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                        <div className="text-sm text-gray-400">
                            {t('common.showing')} {(currentPage * pageSize) + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} {t('common.of')} {totalElements}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-3 py-1 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {t('common.previous')}
                            </button>
                            
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePageChange(index)}
                                    className={`px-3 py-1 rounded-md border transition-colors ${
                                        currentPage === index
                                            ? 'bg-gold text-darkest-bg border-gold'
                                            : 'border-gray-700 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages - 1}
                                className="px-3 py-1 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {t('common.next')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={t('tournamentCategories.create')}
            >
                <TournamentCategoryForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowCreateModal(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingCategory}
                onClose={() => setEditingCategory(null)}
                title={t('tournamentCategories.edit')}
            >
                {editingCategory && (
                    <TournamentCategoryForm
                        category={editingCategory}
                        onSubmit={handleEdit}
                        onCancel={() => setEditingCategory(null)}
                        isLoading={isSubmitting}
                    />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingCategory}
                onClose={() => setDeletingCategory(null)}
                title={t('common.confirmDelete')}
            >
                {deletingCategory && (
                    <div className="space-y-4">
                        <p className="text-gray-300">
                            {t('tournamentCategories.deleteConfirmation', { name: deletingCategory.name })}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeletingCategory(null)}
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
                )}
            </Modal>
        </div>
    );
};

export default TournamentCategoriesPage;
