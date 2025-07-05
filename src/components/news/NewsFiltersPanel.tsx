import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { NewsFilters, NewsCategory, NewsStatus } from '../../types/news';

interface NewsFiltersPanelProps {
    filters: NewsFilters;
    onApplyFilters: (filters: NewsFilters) => void;
    onClearFilters: () => void;
    onSearch: (keyword: string) => void;
}

const NEWS_CATEGORIES: NewsCategory[] = [
    'GENERAL_SPORTS',
    'FOOTBALL',
    'BASKETBALL',
    'TENNIS',
    'BASEBALL',
    'HOCKEY',
    'OLYMPICS',
    'LOCAL_SPORTS',
    'INTERNATIONAL',
    'TRANSFERS',
    'MATCH_RESULTS',
    'PLAYER_NEWS',
    'TEAM_NEWS',
    'TOURNAMENT_NEWS',
    'EQUIPMENT_REVIEW',
    'HEALTH_FITNESS',
    'COACHING_TIPS',
    'YOUTH_SPORTS',
    'WOMEN_SPORTS',
    'ESPORTS'
];

const NEWS_STATUSES: NewsStatus[] = [
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
];

export const NewsFiltersPanel: React.FC<NewsFiltersPanelProps> = ({
    filters,
    onApplyFilters,
    onClearFilters,
    onSearch
}) => {
    const { t } = useTranslation();
    const [localFilters, setLocalFilters] = useState<NewsFilters>(filters);
    const [searchKeyword, setSearchKeyword] = useState(filters.keyword || '');

    useEffect(() => {
        setLocalFilters(filters);
        setSearchKeyword(filters.keyword || '');
    }, [filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setLocalFilters(prev => ({
                ...prev,
                [name]: checked ? true : undefined
            }));
        } else if (type === 'number') {
            setLocalFilters(prev => ({
                ...prev,
                [name]: value ? parseInt(value) : undefined
            }));
        } else {
            setLocalFilters(prev => ({
                ...prev,
                [name]: value || undefined
            }));
        }
    };

    const handleDateChange = (field: string, value: string) => {
        setLocalFilters(prev => ({
            ...prev,
            [field]: value || undefined
        }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchKeyword);
    };

    const handleApplyFilters = () => {
        onApplyFilters(localFilters);
    };

    const handleClearFilters = () => {
        setLocalFilters({});
        setSearchKeyword('');
        onClearFilters();
    };

    return (
        <div className="space-y-6">
            {/* Search */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.search')}
                </label>
                <form onSubmit={handleSearch} className="flex space-x-2">
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder={t('news.searchPlaceholder')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        {t('common.search')}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('news.title')}
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={localFilters.title || ''}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('news.category')}
                    </label>
                    <select
                        name="category"
                        value={localFilters.category || ''}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">{t('common.all')}</option>
                        {NEWS_CATEGORIES.map(category => (
                            <option key={category} value={category}>
                                {t(`news.category.${category.toLowerCase()}`)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('news.status')}
                    </label>
                    <select
                        name="status"
                        value={localFilters.status || ''}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">{t('common.all')}</option>
                        {NEWS_STATUSES.map(status => (
                            <option key={status} value={status}>
                                {t(`news.status.${status.toLowerCase()}`)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Author Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('news.authorName')}
                    </label>
                    <input
                        type="text"
                        name="authorName"
                        value={localFilters.authorName || ''}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Min View Count */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('news.minViewCount')}
                    </label>
                    <input
                        type="number"
                        name="minViewCount"
                        value={localFilters.minViewCount || ''}
                        onChange={handleFilterChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Max View Count */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('news.maxViewCount')}
                    </label>
                    <input
                        type="number"
                        name="maxViewCount"
                        value={localFilters.maxViewCount || ''}
                        onChange={handleFilterChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Date Filters */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t('news.dateFilters')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('news.publishedAfter')}
                        </label>
                        <input
                            type="date"
                            value={localFilters.publishedAfter || ''}
                            onChange={(e) => handleDateChange('publishedAfter', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('news.publishedBefore')}
                        </label>
                        <input
                            type="date"
                            value={localFilters.publishedBefore || ''}
                            onChange={(e) => handleDateChange('publishedBefore', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('news.createdAfter')}
                        </label>
                        <input
                            type="date"
                            value={localFilters.createdAfter || ''}
                            onChange={(e) => handleDateChange('createdAfter', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('news.createdBefore')}
                        </label>
                        <input
                            type="date"
                            value={localFilters.createdBefore || ''}
                            onChange={(e) => handleDateChange('createdBefore', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Boolean Filters */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t('news.options')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isFeatured"
                            name="isFeatured"
                            checked={localFilters.isFeatured || false}
                            onChange={handleFilterChange}
                            className="mr-2"
                        />
                        <label htmlFor="isFeatured" className="text-sm text-gray-700">
                            {t('news.featured')}
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isBreaking"
                            name="isBreaking"
                            checked={localFilters.isBreaking || false}
                            onChange={handleFilterChange}
                            className="mr-2"
                        />
                        <label htmlFor="isBreaking" className="text-sm text-gray-700">
                            {t('news.breaking')}
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={localFilters.isActive || false}
                            onChange={handleFilterChange}
                            className="mr-2"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700">
                            {t('common.active')}
                        </label>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    {t('common.clear')}
                </button>
                <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                    {t('common.apply')}
                </button>
            </div>
        </div>
    );
};
