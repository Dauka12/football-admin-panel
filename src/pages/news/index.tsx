import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NewsForm } from '../../components/news/NewsForm';
import Modal from '../../components/ui/Modal';
import { useNewsStore } from '../../store/newsStore';
import type { News, NewsListItem } from '../../types/news';

const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const { 
    news, 
    loading, 
    error, 
    fetchNews, 
    deleteNews,
    publishNews,
    archiveNews,
    pagination,
    filters,
    setFilters,
    setPagination 
  } = useNewsStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newsToDelete, setNewsToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ ...filters, keyword: query });
  };

  const applyFilters = () => {
    setFilters({
      ...filters,
      status: filterStatus ? filterStatus as any : undefined,
      category: filterCategory ? filterCategory as any : undefined
    });
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterCategory('');
    setFilters({});
    setIsFilterOpen(false);
  };

  const handleDelete = async () => {
    if (newsToDelete !== null) {
      await deleteNews(newsToDelete);
      setNewsToDelete(null);
      await fetchNews();
    }
  };

  const handlePublish = async (newsId: number) => {
    await publishNews(newsId);
    await fetchNews();
  };

  const handleArchive = async (newsId: number) => {
    await archiveNews(newsId);
    await fetchNews();
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ page: newPage });
    fetchNews();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isNewsItem = (item: NewsListItem | News): item is News => {
    return 'status' in item;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'text-green-400';
      case 'draft':
        return 'text-yellow-400';
      case 'archived':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (item: NewsListItem | News) => {
    if (isNewsItem(item)) {
      return t(`news.status.${item.status.toLowerCase()}`);
    }
    // For NewsListItem, we can infer status from publishedAt
    return item.publishedAt ? t('news.status.published') : t('news.status.draft');
  };

  const getStatusColorForItem = (item: NewsListItem | News) => {
    if (isNewsItem(item)) {
      return getStatusColor(item.status);
    }
    return item.publishedAt ? getStatusColor('published') : getStatusColor('draft');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold">{t('news.title')}</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gold text-darkest-bg px-4 py-2 rounded-md hover:bg-gold/90 transition-colors duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('news.createNews')}
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-6">
        {/* Search input */}
        <div className="relative flex-1 w-full lg:w-auto">
          <input
            type="text"
            placeholder={t('news.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-card-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filter button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="bg-card-bg border border-gray-700 px-4 py-3 rounded-md hover:bg-darkest-bg transition-colors duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
          </svg>
          {t('common.filter')}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
          <p className="text-gray-400 mt-2">{t('news.loadingNews')}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && news.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📰</div>
          <h3 className="text-xl font-semibold mb-2">{t('news.noNews')}</h3>
          <p className="text-gray-400 mb-6">{t('news.createFirst')}</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gold text-darkest-bg px-6 py-3 rounded-md hover:bg-gold/90 transition-colors duration-200"
          >
            {t('news.createNews')}
          </button>
        </div>
      )}

      {/* News Grid */}
      {!loading && news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div key={item.id} className="bg-card-bg rounded-lg p-6 hover:bg-darkest-bg transition-colors duration-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate" title={item.title}>
                    {item.title}
                  </h3>
                  <p className={`text-sm font-medium ${getStatusColorForItem(item)}`}>
                    {getStatusText(item)}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <button
                    onClick={() => {
                      if (isNewsItem(item)) {
                        setEditingNews(item);
                      }
                    }}
                    className="text-gold hover:text-gold/80 transition-colors p-1"
                    title={t('news.editNews')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setNewsToDelete(item.id)}
                    className="text-red-500 hover:text-red-400 transition-colors p-1"
                    title={t('news.deleteNews')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.summary}</p>
              
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <div className="flex items-center justify-between">
                  <span>{t('news.newsAuthor')}: {isNewsItem(item) ? `${item.author.firstName} ${item.author.lastName}` : item.authorName}</span>
                  <span>{formatDate(item.publishedAt || (isNewsItem(item) ? item.createdAt : ''))}</span>
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-darkest-bg rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 bg-darkest-bg rounded-full text-xs">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                {isNewsItem(item) && item.status === 'DRAFT' && (
                  <button
                    onClick={() => handlePublish(item.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-md transition-colors"
                  >
                    {t('news.publishNews')}
                  </button>
                )}
                {isNewsItem(item) && item.status === 'PUBLISHED' && (
                  <button
                    onClick={() => handleArchive(item.id)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded-md transition-colors"
                  >
                    {t('news.archiveNews')}
                  </button>
                )}
                {!isNewsItem(item) && item.publishedAt && (
                  <button
                    onClick={() => handleArchive(item.id)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded-md transition-colors"
                  >
                    {t('news.archiveNews')}
                  </button>
                )}
                {!isNewsItem(item) && !item.publishedAt && (
                  <button
                    onClick={() => handlePublish(item.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded-md transition-colors"
                  >
                    {t('news.publishNews')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 mt-6 border-t border-gray-700 bg-card-bg rounded-lg">
          <div className="text-sm text-gray-400 mb-2 sm:mb-0">
            {t('news.showing')} {pagination.page * pagination.size + 1} - {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} {t('news.of')} {pagination.totalElements} {t('news.results')}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(0, pagination.page - 1))}
              disabled={pagination.page === 0}
              className="px-3 py-1 text-sm bg-darkest-bg border border-gray-700 rounded-md hover:bg-card-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('news.prevPage')}
            </button>
            <span className="text-sm text-gray-400">
              {t('news.page')} {pagination.page + 1} {t('news.of')} {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="px-3 py-1 text-sm bg-darkest-bg border border-gray-700 rounded-md hover:bg-card-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('news.nextPage')}
            </button>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <Modal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        title={t('news.showFilters')}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-400">{t('news.filterByStatus')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
            >
              <option value="">{t('news.allStatuses')}</option>
              <option value="DRAFT">{t('news.status.draft')}</option>
              <option value="PUBLISHED">{t('news.status.published')}</option>
              <option value="ARCHIVED">{t('news.status.archived')}</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm text-gray-400">{t('news.filterByCategory')}</label>
            <input
              type="text"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              placeholder={t('news.filterByCategory')}
              className="w-full px-3 py-2 bg-darkest-bg border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold transition-colors duration-200"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
          >
            {t('news.clearFilters')}
          </button>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-gold text-darkest-bg hover:bg-gold/90 rounded-md transition-colors duration-200"
          >
            {t('common.apply')}
          </button>
        </div>
      </Modal>

      {/* Create News Modal */}
      <Modal 
        isOpen={showCreateForm} 
        onClose={() => setShowCreateForm(false)}
        title={t('news.createNews')}
      >
        <NewsForm 
          onSuccess={() => {
            setShowCreateForm(false);
            fetchNews();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      </Modal>

      {/* Edit News Modal */}
      <Modal 
        isOpen={!!editingNews} 
        onClose={() => setEditingNews(null)}
        title={t('news.editNews')}
      >
        {editingNews && (
          <NewsForm 
            newsId={editingNews.id}
            onSuccess={() => {
              setEditingNews(null);
              fetchNews();
            }}
            onCancel={() => setEditingNews(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!newsToDelete} 
        onClose={() => setNewsToDelete(null)}
        title={t('news.deleteNews')}
      >
        <div className="space-y-4">
          <p className="text-gray-300">{t('news.confirmDelete')}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setNewsToDelete(null)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
            >
              {t('news.deleteNews')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NewsPage;
