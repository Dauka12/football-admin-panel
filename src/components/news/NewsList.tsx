import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { News, NewsListItem } from '../../types/news';
import { useNewsStore } from '../../store/newsStore';
import { toast } from '../../utils/toast';
import { formatDate } from '../../utils/dateUtils';

interface NewsListProps {
    news: (NewsListItem | News)[];
    loading: boolean;
    pagination: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
    onEdit: (id: number) => void;
    onPageChange: (page: number) => void;
}

export const NewsList: React.FC<NewsListProps> = ({
    news,
    loading,
    pagination,
    onEdit,
    onPageChange
}) => {
    const { t } = useTranslation();
    const { deleteNews, publishNews, archiveNews, setNewsStatus } = useNewsStore();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [actioningId, setActioningId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        if (!window.confirm(t('news.confirmDelete'))) return;
        
        setDeletingId(id);
        try {
            await deleteNews(id);
            toast.success(t('news.success.deleted'));
        } catch (error) {
            toast.error(t('news.errors.deleteFailed'));
        } finally {
            setDeletingId(null);
        }
    };

    const handlePublish = async (id: number) => {
        setActioningId(id);
        try {
            await publishNews(id);
            toast.success(t('news.success.published'));
        } catch (error) {
            toast.error(t('news.errors.publishFailed'));
        } finally {
            setActioningId(null);
        }
    };

    const handleArchive = async (id: number) => {
        setActioningId(id);
        try {
            await archiveNews(id);
            toast.success(t('news.success.archived'));
        } catch (error) {
            toast.error(t('news.errors.archiveFailed'));
        } finally {
            setActioningId(null);
        }
    };

    const handleStatusChange = async (id: number, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
        setActioningId(id);
        try {
            await setNewsStatus(id, status);
            toast.success(t('news.success.statusUpdated'));
        } catch (error) {
            toast.error(t('news.errors.statusUpdateFailed'));
        } finally {
            setActioningId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            'DRAFT': 'bg-gray-100 text-gray-800',
            'PUBLISHED': 'bg-green-100 text-green-800',
            'ARCHIVED': 'bg-yellow-100 text-yellow-800',
            'DELETED': 'bg-red-100 text-red-800'
        };
        
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                {t(`news.status.${status.toLowerCase()}`)}
            </span>
        );
    };

    const getCategoryBadge = (category: string) => {
        return (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {t(`news.category.${category.toLowerCase()}`)}
            </span>
        );
    };

    const getNewsTitle = (newsItem: NewsListItem | News): string => {
        if ('title' in newsItem) {
            return newsItem.title;
        }
        return '';
    };

    const getNewsSummary = (newsItem: NewsListItem | News): string => {
        if ('summary' in newsItem) {
            return newsItem.summary;
        }
        return '';
    };

    const getNewsAuthor = (newsItem: NewsListItem | News): string => {
        if ('authorName' in newsItem) {
            return newsItem.authorName;
        }
        if ('author' in newsItem && newsItem.author) {
            return `${newsItem.author.firstName} ${newsItem.author.lastName}`;
        }
        return '';
    };

    const getNewsStatus = (newsItem: NewsListItem | News): string => {
        if ('status' in newsItem) {
            return newsItem.status;
        }
        return '';
    };

    const getNewsCategory = (newsItem: NewsListItem | News): string => {
        if ('category' in newsItem) {
            return newsItem.category;
        }
        return '';
    };

    const getNewsViewCount = (newsItem: NewsListItem | News): number => {
        if ('viewCount' in newsItem) {
            return newsItem.viewCount;
        }
        return 0;
    };

    const getNewsDate = (newsItem: NewsListItem | News): string => {
        if ('publishedAt' in newsItem) {
            return newsItem.publishedAt;
        }
        return '';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (news.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📰</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('news.noNews')}
                </h3>
                <p className="text-gray-500">
                    {t('news.noNewsDesc')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* News List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {news.map((newsItem) => (
                        <li key={newsItem.id} className="p-6 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-medium text-gray-900 truncate">
                                            {getNewsTitle(newsItem)}
                                        </h3>
                                        {getNewsStatus(newsItem) && getStatusBadge(getNewsStatus(newsItem))}
                                        {getNewsCategory(newsItem) && getCategoryBadge(getNewsCategory(newsItem))}
                                        {'isFeatured' in newsItem && newsItem.isFeatured && (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                                ⭐ {t('news.featured')}
                                            </span>
                                        )}
                                        {'isBreaking' in newsItem && newsItem.isBreaking && (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                🚨 {t('news.breaking')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                        {getNewsSummary(newsItem)}
                                    </p>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                                        <span>👤 {getNewsAuthor(newsItem)}</span>
                                        <span>📅 {formatDate(getNewsDate(newsItem))}</span>
                                        <span>👁️ {getNewsViewCount(newsItem)} {t('news.views')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => onEdit(newsItem.id)}
                                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        ✏️ {t('common.edit')}
                                    </button>
                                    
                                    {getNewsStatus(newsItem) === 'DRAFT' && (
                                        <button
                                            onClick={() => handlePublish(newsItem.id)}
                                            disabled={actioningId === newsItem.id}
                                            className="px-3 py-1 text-sm text-green-600 hover:text-green-800 disabled:opacity-50"
                                        >
                                            {actioningId === newsItem.id ? '...' : `📰 ${t('news.publish')}`}
                                        </button>
                                    )}
                                    
                                    {getNewsStatus(newsItem) === 'PUBLISHED' && (
                                        <button
                                            onClick={() => handleArchive(newsItem.id)}
                                            disabled={actioningId === newsItem.id}
                                            className="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-800 disabled:opacity-50"
                                        >
                                            {actioningId === newsItem.id ? '...' : `📦 ${t('news.archive')}`}
                                        </button>
                                    )}
                                    
                                    {getNewsStatus(newsItem) === 'ARCHIVED' && (
                                        <button
                                            onClick={() => handleStatusChange(newsItem.id, 'PUBLISHED')}
                                            disabled={actioningId === newsItem.id}
                                            className="px-3 py-1 text-sm text-green-600 hover:text-green-800 disabled:opacity-50"
                                        >
                                            {actioningId === newsItem.id ? '...' : `📤 ${t('news.restore')}`}
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={() => handleDelete(newsItem.id)}
                                        disabled={deletingId === newsItem.id}
                                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                                    >
                                        {deletingId === newsItem.id ? '...' : `🗑️ ${t('common.delete')}`}
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-700">
                        {t('common.showing')} {pagination.page * pagination.size + 1} {t('common.to')} {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} {t('common.of')} {pagination.totalElements} {t('common.results')}
                    </p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 0}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('common.previous')}
                        </button>
                        
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const pageNumber = Math.max(0, Math.min(pagination.totalPages - 5, pagination.page - 2)) + i;
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => onPageChange(pageNumber)}
                                    className={`px-3 py-1 text-sm border rounded ${
                                        pageNumber === pagination.page
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNumber + 1}
                                </button>
                            );
                        })}
                        
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages - 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('common.next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
