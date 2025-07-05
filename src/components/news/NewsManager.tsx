import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNewsStore } from '../../store/newsStore';
import type { NewsFilters } from '../../types/news';
import { toast } from '../../utils/toast';
import { NewsList } from './NewsList.tsx';
import { NewsForm } from './NewsForm.tsx';
import { NewsFiltersPanel } from './NewsFiltersPanel.tsx';

const NewsManager: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingNews, setEditingNews] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState<NewsFilters>({});

    const {
        news,
        statistics,
        loading,
        error,
        pagination,
        fetchNews,
        fetchFeaturedNews,
        fetchPopularNews,
        fetchPublishedNews,
        fetchBreakingNews,
        fetchRecentNews,
        fetchNewsStatistics,
        searchNews,
        setFilters,
        setPagination,
        clearError,
        resetFilters
    } = useNewsStore();

    const stableFetchNews = useMemo(() => fetchNews, []);
    const stableFetchFeaturedNews = useMemo(() => fetchFeaturedNews, []);
    const stableFetchPopularNews = useMemo(() => fetchPopularNews, []);
    const stableFetchPublishedNews = useMemo(() => fetchPublishedNews, []);
    const stableFetchBreakingNews = useMemo(() => fetchBreakingNews, []);
    const stableFetchRecentNews = useMemo(() => fetchRecentNews, []);
    const stableFetchNewsStatistics = useMemo(() => fetchNewsStatistics, []);
    const stableSearchNews = useMemo(() => searchNews, []);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await stableFetchNewsStatistics();
                
                switch (activeTab) {
                    case 'all':
                        await stableFetchNews();
                        break;
                    case 'featured':
                        await stableFetchFeaturedNews();
                        break;
                    case 'popular':
                        await stableFetchPopularNews();
                        break;
                    case 'published':
                        await stableFetchPublishedNews();
                        break;
                    case 'breaking':
                        await stableFetchBreakingNews();
                        break;
                    case 'recent':
                        await stableFetchRecentNews();
                        break;
                    default:
                        await stableFetchNews();
                }
            } catch (error) {
                console.error('Failed to load initial data:', error);
                toast.error(t('news.errors.loadFailed'));
            }
        };

        loadInitialData();
    }, [activeTab, stableFetchNews, stableFetchFeaturedNews, stableFetchPopularNews, stableFetchPublishedNews, stableFetchBreakingNews, stableFetchRecentNews, stableFetchNewsStatistics, t]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        resetFilters();
    };

    const handleSearch = (keyword: string) => {
        if (keyword.trim()) {
            setLocalFilters({ keyword });
            stableSearchNews(keyword);
        } else {
            setLocalFilters({});
            stableFetchNews();
        }
    };

    const handleApplyFilters = (newFilters: NewsFilters) => {
        setFilters(newFilters);
        setLocalFilters(newFilters);
        setShowFilters(false);
        
        // Apply filters based on current tab
        switch (activeTab) {
            case 'all':
                stableFetchNews();
                break;
            case 'featured':
                stableFetchFeaturedNews();
                break;
            case 'popular':
                stableFetchPopularNews();
                break;
            case 'published':
                stableFetchPublishedNews();
                break;
            case 'breaking':
                stableFetchBreakingNews();
                break;
            case 'recent':
                stableFetchRecentNews();
                break;
            default:
                stableFetchNews();
        }
    };

    const handleClearFilters = () => {
        resetFilters();
        setLocalFilters({});
        setShowFilters(false);
        
        // Reload data for current tab
        switch (activeTab) {
            case 'all':
                stableFetchNews();
                break;
            case 'featured':
                stableFetchFeaturedNews();
                break;
            case 'popular':
                stableFetchPopularNews();
                break;
            case 'published':
                stableFetchPublishedNews();
                break;
            case 'breaking':
                stableFetchBreakingNews();
                break;
            case 'recent':
                stableFetchRecentNews();
                break;
            default:
                stableFetchNews();
        }
    };

    const handleEditNews = (id: number) => {
        setEditingNews(id);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingNews(null);
        
        // Reload current tab data
        switch (activeTab) {
            case 'all':
                stableFetchNews();
                break;
            case 'featured':
                stableFetchFeaturedNews();
                break;
            case 'popular':
                stableFetchPopularNews();
                break;
            case 'published':
                stableFetchPublishedNews();
                break;
            case 'breaking':
                stableFetchBreakingNews();
                break;
            case 'recent':
                stableFetchRecentNews();
                break;
            default:
                stableFetchNews();
        }
        
        toast.success(editingNews ? t('news.success.updated') : t('news.success.created'));
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingNews(null);
    };

    const handlePageChange = (page: number) => {
        setPagination({ page });
        
        // Reload current tab data
        switch (activeTab) {
            case 'all':
                stableFetchNews();
                break;
            case 'featured':
                stableFetchFeaturedNews();
                break;
            case 'popular':
                stableFetchPopularNews();
                break;
            case 'published':
                stableFetchPublishedNews();
                break;
            case 'breaking':
                stableFetchBreakingNews();
                break;
            case 'recent':
                stableFetchRecentNews();
                break;
            default:
                stableFetchNews();
        }
    };

    const getStatisticValue = (key: string): string => {
        if (!statistics || !statistics[key]) return '0';
        return statistics[key].toString();
    };

    if (showForm) {
        return (
            <NewsForm
                newsId={editingNews}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('news.title')}</h1>
                    <p className="text-gray-600 mt-1">{t('news.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        🔍 {t('common.filters')}
                    </button>
                    <button
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={() => setShowForm(true)}
                    >
                        ➕ {t('news.addNews')}
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{t('news.stats.total')}</p>
                            <p className="text-2xl font-bold text-gray-900">{getStatisticValue('totalNews')}</p>
                        </div>
                        <div className="text-gray-400">📄</div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{t('news.stats.published')}</p>
                            <p className="text-2xl font-bold text-gray-900">{getStatisticValue('publishedNews')}</p>
                        </div>
                        <div className="text-gray-400">📰</div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{t('news.stats.featured')}</p>
                            <p className="text-2xl font-bold text-gray-900">{getStatisticValue('featuredNews')}</p>
                        </div>
                        <div className="text-gray-400">⭐</div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{t('news.stats.breaking')}</p>
                            <p className="text-2xl font-bold text-gray-900">{getStatisticValue('breakingNews')}</p>
                        </div>
                        <div className="text-gray-400">🚨</div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{t('news.stats.totalViews')}</p>
                            <p className="text-2xl font-bold text-gray-900">{getStatisticValue('totalViews')}</p>
                        </div>
                        <div className="text-gray-400">👁️</div>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-4">{t('common.filters')}</h3>
                    <NewsFiltersPanel
                        filters={localFilters}
                        onApplyFilters={handleApplyFilters}
                        onClearFilters={handleClearFilters}
                        onSearch={handleSearch}
                    />
                </div>
            )}

            {/* News Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { key: 'all', label: t('news.tabs.all'), icon: '📄' },
                            { key: 'featured', label: t('news.tabs.featured'), icon: '⭐' },
                            { key: 'popular', label: t('news.tabs.popular'), icon: '🔥' },
                            { key: 'published', label: t('news.tabs.published'), icon: '📰' },
                            { key: 'breaking', label: t('news.tabs.breaking'), icon: '🚨' },
                            { key: 'recent', label: t('news.tabs.recent'), icon: '🕐' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                onClick={() => handleTabChange(tab.key)}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="p-6">
                    <NewsList
                        news={news}
                        loading={loading}
                        pagination={pagination}
                        onEdit={handleEditNews}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default NewsManager;
