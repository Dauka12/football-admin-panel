import { create } from 'zustand';
import type { 
    News, 
    NewsListItem,
    NewsFilters, 
    NewsFormData, 
    NewsStatistics,
    NewsStatus,
    NewsCategory,
    CreateNewsResponse
} from '../types/news';
import { newsApi } from '../api/news';

interface NewsState {
    news: (NewsListItem | News)[];
    selectedNews: News | null;
    relatedNews: NewsListItem[];
    statistics: NewsStatistics | null;
    loading: boolean;
    error: string | null;
    filters: NewsFilters;
    pagination: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
    
    // Actions
    fetchNews: () => Promise<void>;
    fetchNewsById: (id: number) => Promise<void>;
    createNews: (data: NewsFormData, authorId?: number) => Promise<CreateNewsResponse>;
    updateNews: (id: number, data: NewsFormData, authorId?: number) => Promise<void>;
    deleteNews: (id: number) => Promise<void>;
    publishNews: (id: number) => Promise<void>;
    archiveNews: (id: number) => Promise<void>;
    setNewsStatus: (id: number, status: NewsStatus) => Promise<void>;
    incrementViewCount: (id: number) => Promise<void>;
    
    // Specialized fetches
    fetchNewsByCategory: (category: NewsCategory) => Promise<void>;
    fetchNewsStatistics: () => Promise<void>;
    searchNews: (keyword: string) => Promise<void>;
    fetchRecentNews: (limit?: number) => Promise<void>;
    fetchFeaturedNews: () => Promise<void>;
    fetchPopularNews: () => Promise<void>;
    fetchPublishedNews: () => Promise<void>;
    fetchBreakingNews: () => Promise<void>;
    fetchNewsByAuthor: (authorId: number) => Promise<void>;
    fetchNewsByTags: (tags: string[]) => Promise<void>;
    fetchRelatedNews: (id: number, limit?: number) => Promise<void>;
    validateSlug: (slug: string, excludeId?: number) => Promise<boolean>;
    
    // Utility actions
    setFilters: (filters: Partial<NewsFilters>) => void;
    setPagination: (pagination: Partial<NewsState['pagination']>) => void;
    clearError: () => void;
    clearSelectedNews: () => void;
    resetFilters: () => void;
}

const initialFilters: NewsFilters = {
    title: '',
    content: '',
    summary: '',
    category: undefined,
    status: undefined,
    isFeatured: undefined,
    isBreaking: undefined,
    isActive: undefined,
    authorId: undefined,
    authorName: '',
    tags: [],
    publishedAfter: undefined,
    publishedBefore: undefined,
    createdAfter: undefined,
    createdBefore: undefined,
    minViewCount: undefined,
    maxViewCount: undefined,
    keyword: ''
};

export const useNewsStore = create<NewsState>((set, get) => ({
    news: [],
    selectedNews: null,
    relatedNews: [],
    statistics: null,
    loading: false,
    error: null,
    filters: initialFilters,
    pagination: {
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    },

    fetchNews: async () => {
        set({ loading: true, error: null });
        try {
            const { filters, pagination } = get();
            const response = await newsApi.getAll({
                ...filters,
                page: pagination.page,
                size: pagination.size,
                sort: ['createdAt,desc']
            });
            
            set({
                news: response.content,
                pagination: {
                    ...pagination,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages
                },
                loading: false
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch news',
                loading: false 
            });
        }
    },

    fetchNewsById: async (id: number) => {
        set({ loading: true, error: null });
        try {
            const newsItem = await newsApi.getById(id);
            set({ selectedNews: newsItem, loading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch news',
                loading: false 
            });
        }
    },

    createNews: async (data: NewsFormData, authorId?: number) => {
        set({ loading: true, error: null });
        try {
            const response = await newsApi.create(data, authorId);
            await get().fetchNews();
            set({ loading: false });
            return response;
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to create news',
                loading: false 
            });
            throw error;
        }
    },

    updateNews: async (id: number, data: NewsFormData, authorId?: number) => {
        set({ loading: true, error: null });
        try {
            await newsApi.update(id, data, authorId);
            await get().fetchNews();
            
            // Update selected news if it's the one being updated
            if (get().selectedNews?.id === id) {
                await get().fetchNewsById(id);
            }
            
            set({ loading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to update news',
                loading: false 
            });
            throw error;
        }
    },

    deleteNews: async (id: number) => {
        set({ loading: true, error: null });
        try {
            await newsApi.delete(id);
            await get().fetchNews();
            
            // Clear selected news if it was deleted
            if (get().selectedNews?.id === id) {
                set({ selectedNews: null });
            }
            
            set({ loading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to delete news',
                loading: false 
            });
            throw error;
        }
    },

    publishNews: async (id: number) => {
        set({ loading: true, error: null });
        try {
            await newsApi.publish(id);
            await get().fetchNews();
            
            // Update selected news if it's the one being published
            if (get().selectedNews?.id === id) {
                await get().fetchNewsById(id);
            }
            
            set({ loading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to publish news',
                loading: false 
            });
            throw error;
        }
    },

    archiveNews: async (id: number) => {
        set({ loading: true, error: null });
        try {
            await newsApi.archive(id);
            await get().fetchNews();
            
            // Update selected news if it's the one being archived
            if (get().selectedNews?.id === id) {
                await get().fetchNewsById(id);
            }
            
            set({ loading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to archive news',
                loading: false 
            });
            throw error;
        }
    },

    setNewsStatus: async (id: number, status: NewsStatus) => {
        set({ loading: true, error: null });
        try {
            await newsApi.setStatus(id, status);
            await get().fetchNews();
            
            // Update selected news if it's the one being updated
            if (get().selectedNews?.id === id) {
                await get().fetchNewsById(id);
            }
            
            set({ loading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to update news status',
                loading: false 
            });
            throw error;
        }
    },

    incrementViewCount: async (id: number) => {
        try {
            await newsApi.incrementViewCount(id);
            // Don't refresh the entire list for view count increment
            // Just update the selected news if it's the one being viewed
            if (get().selectedNews?.id === id) {
                await get().fetchNewsById(id);
            }
        } catch (error) {
            // Silent fail for view count increment
            console.error('Failed to increment view count:', error);
        }
    },

    fetchNewsByCategory: async (category: NewsCategory) => {
        set({ loading: true, error: null });
        try {
            const { pagination } = get();
            const response = await newsApi.getByCategory(category, pagination.page, pagination.size);
            
            set({
                news: response.content,
                pagination: {
                    ...pagination,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages
                },
                loading: false
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch news by category',
                loading: false 
            });
        }
    },

    fetchNewsStatistics: async () => {
        set({ loading: true, error: null });
        try {
            const statistics = await newsApi.getStatistics();
            set({ statistics, loading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch news statistics',
                loading: false 
            });
        }
    },

    searchNews: async (keyword: string) => {
        set({ loading: true, error: null });
        try {
            const { pagination } = get();
            const response = await newsApi.search(keyword, pagination.page, pagination.size);
            
            set({
                news: response.content,
                pagination: {
                    ...pagination,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages
                },
                loading: false
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to search news',
                loading: false 
            });
        }
    },

    fetchRecentNews: async (limit = 10) => {
        set({ loading: true, error: null });
        try {
            const recentNews = await newsApi.getRecent(limit);
            set({ news: recentNews, loading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch recent news',
                loading: false 
            });
        }
    },

    fetchFeaturedNews: async () => {
        set({ loading: true, error: null });
        try {
            const { pagination } = get();
            const response = await newsApi.getFeatured(pagination.page, pagination.size);
            
            set({
                news: response.content,
                pagination: {
                    ...pagination,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages
                },
                loading: false
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch featured news',
                loading: false 
            });
        }
    },

    fetchPopularNews: async () => {
        set({ loading: true, error: null });
        try {
            const { pagination } = get();
            const response = await newsApi.getPopular(pagination.page, pagination.size);
            
            set({
                news: response.content,
                pagination: {
                    ...pagination,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages
                },
                loading: false
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch popular news',
                loading: false 
            });
        }
    },

    fetchPublishedNews: async () => {
        set({ loading: true, error: null });
        try {
            const { pagination } = get();
            const response = await newsApi.getPublished(pagination.page, pagination.size);
            
            set({
                news: response.content,
                pagination: {
                    ...pagination,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages
                },
                loading: false
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch published news',
                loading: false 
            });
        }
    },

    fetchBreakingNews: async () => {
        set({ loading: true, error: null });
        try {
            const { pagination } = get();
            const response = await newsApi.getBreaking(pagination.page, pagination.size);
            
            set({
                news: response.content,
                pagination: {
                    ...pagination,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages
                },
                loading: false
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch breaking news',
                loading: false 
            });
        }
    },

    fetchNewsByAuthor: async (authorId: number) => {
        set({ loading: true, error: null });
        try {
            const { pagination } = get();
            const response = await newsApi.getByAuthor(authorId, pagination.page, pagination.size);
            
            set({
                news: response.content,
                pagination: {
                    ...pagination,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages
                },
                loading: false
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch news by author',
                loading: false 
            });
        }
    },

    fetchNewsByTags: async (tags: string[]) => {
        set({ loading: true, error: null });
        try {
            const { pagination } = get();
            const response = await newsApi.getByTags(tags, pagination.page, pagination.size);
            
            set({
                news: response.content,
                pagination: {
                    ...pagination,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages
                },
                loading: false
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch news by tags',
                loading: false 
            });
        }
    },

    fetchRelatedNews: async (id: number, limit = 5) => {
        set({ loading: true, error: null });
        try {
            const related = await newsApi.getRelated(id, limit);
            set({ relatedNews: related, loading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch related news',
                loading: false 
            });
        }
    },

    validateSlug: async (slug: string, excludeId?: number) => {
        try {
            const result = await newsApi.validateSlug(slug, excludeId);
            return result.unique || false;
        } catch (error) {
            console.error('Failed to validate slug:', error);
            return false;
        }
    },

    setFilters: (newFilters: Partial<NewsFilters>) => {
        set(state => ({
            filters: { ...state.filters, ...newFilters },
            pagination: { ...state.pagination, page: 0 }
        }));
    },

    setPagination: (newPagination: Partial<NewsState['pagination']>) => {
        set(state => ({
            pagination: { ...state.pagination, ...newPagination }
        }));
    },

    clearError: () => {
        set({ error: null });
    },

    clearSelectedNews: () => {
        set({ selectedNews: null, relatedNews: [] });
    },

    resetFilters: () => {
        set({ 
            filters: initialFilters,
            pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 }
        });
    }
}));
