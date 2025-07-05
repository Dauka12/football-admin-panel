import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Country } from '../../types/countries';

interface CountriesListProps {
    countries: Country[];
    onEdit: (country: Country) => void;
    onDelete: (country: Country) => void;
    onView: (country: Country) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

const CountriesList: React.FC<CountriesListProps> = ({
    countries,
    onEdit,
    onDelete,
    onView,
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false
}) => {
    const { t } = useTranslation();

    const renderStatusBadge = (active: boolean) => {
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                active 
                    ? 'bg-green-900/20 text-green-400 border border-green-500/50' 
                    : 'bg-red-900/20 text-red-400 border border-red-500/50'
            }`}>
                {active ? t('common.active') : t('common.inactive')}
            </span>
        );
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        const startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t('common.previous')}
            </button>
        );

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-3 py-1 rounded ${
                        i === currentPage 
                            ? 'bg-gold text-darkest-bg' 
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                >
                    {i + 1}
                </button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t('common.next')}
            </button>
        );

        return (
            <div className="flex items-center justify-center space-x-2 mt-6">
                {pages}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
                    <p className="text-gray-400">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (countries.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-gray-400 text-lg">{t('countries.noCountries')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Countries Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                {t('countries.fields.name')}
                            </th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                {t('countries.fields.code')}
                            </th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                {t('countries.fields.isoCode2')}
                            </th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                {t('countries.fields.cities')}
                            </th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                {t('common.status')}
                            </th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                {t('common.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {countries.map((country) => (
                            <tr key={country.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="py-3 px-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                                            <span className="text-gold text-sm font-medium">
                                                {country.isoCode2}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{country.name}</p>
                                            <p className="text-gray-400 text-sm">
                                                {t('common.createdAt')}: {new Date(country.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-gray-300 font-mono">{country.code}</span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-gray-300 font-mono">{country.isoCode2}</span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-gray-300">
                                        {country.cities?.length || 0} {t('countries.fields.cities')}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    {renderStatusBadge(country.active)}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onView(country)}
                                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                                            title={t('common.view')}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onEdit(country)}
                                            className="p-2 text-gold hover:text-gold/80 hover:bg-gold/20 rounded transition-colors"
                                            title={t('common.edit')}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(country)}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                                            title={t('common.delete')}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Pagination */}
            {renderPagination()}
        </div>
    );
};

export default CountriesList;
