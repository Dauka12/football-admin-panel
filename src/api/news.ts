import axiosInstance from './axios';
import type { 
    News, 
    NewsListItem,
    CreateNewsRequest, 
    UpdateNewsRequest, 
    NewsFilters,
    NewsResponse,
    NewsListResponse,
    CreateNewsResponse,
    SlugValidationResponse,
    NewsStatistics,
    NewsStatus
} from '../types/news';

export const newsApi = {
    // Get filtered news with pagination
    getAll: async (filters?: NewsFilters): Promise<NewsResponse> => {
        const params = new URLSearchParams();
        
        if (filters?.title) params.append('filter.title', filters.title);
        if (filters?.content) params.append('filter.content', filters.content);
        if (filters?.summary) params.append('filter.summary', filters.summary);
        if (filters?.category) params.append('filter.category', filters.category);
        if (filters?.status) params.append('filter.status', filters.status);
        if (filters?.isFeatured !== undefined) params.append('filter.isFeatured', filters.isFeatured.toString());
        if (filters?.isBreaking !== undefined) params.append('filter.isBreaking', filters.isBreaking.toString());
        if (filters?.isActive !== undefined) params.append('filter.isActive', filters.isActive.toString());
        if (filters?.authorId) params.append('filter.authorId', filters.authorId.toString());
        if (filters?.authorName) params.append('filter.authorName', filters.authorName);
        if (filters?.tags && filters.tags.length > 0) {
            filters.tags.forEach(tag => params.append('filter.tags', tag));
        }
        if (filters?.publishedAfter) params.append('filter.publishedAfter', filters.publishedAfter);
        if (filters?.publishedBefore) params.append('filter.publishedBefore', filters.publishedBefore);
        if (filters?.createdAfter) params.append('filter.createdAfter', filters.createdAfter);
        if (filters?.createdBefore) params.append('filter.createdBefore', filters.createdBefore);
        if (filters?.minViewCount !== undefined) params.append('filter.minViewCount', filters.minViewCount.toString());
        if (filters?.maxViewCount !== undefined) params.append('filter.maxViewCount', filters.maxViewCount.toString());
        if (filters?.keyword) params.append('filter.keyword', filters.keyword);
        
        if (filters?.page !== undefined) params.append('pageable.page', filters.page.toString());
        if (filters?.size !== undefined) params.append('pageable.size', filters.size.toString());
        if (filters?.sort && filters.sort.length > 0) {
            filters.sort.forEach(sort => params.append('pageable.sort', sort));
        }
        
        const response = await axiosInstance.get(`/news?${params.toString()}`);
        return response.data;
    },

    // Get news by ID
    getById: async (id: number): Promise<News> => {
        const response = await axiosInstance.get(`/news/${id}`);
        return response.data;
    },

    // Get news by slug
    getBySlug: async (slug: string): Promise<News> => {
        const response = await axiosInstance.get(`/news/slug/${slug}`);
        return response.data;
    },

    // Create news
    create: async (data: CreateNewsRequest, authorId?: number): Promise<CreateNewsResponse> => {
        const params = new URLSearchParams();
        if (authorId) params.append('authorId', authorId.toString());
        
        const response = await axiosInstance.post(`/news${params.toString()}`, data);
        return response.data;
    },

    // Update news
    update: async (id: number, data: UpdateNewsRequest, authorId?: number): Promise<CreateNewsResponse> => {
        const params = new URLSearchParams();
        if (authorId) params.append('authorId', authorId.toString());
        
        const response = await axiosInstance.put(`/news/${id}?${params.toString()}`, data);
        return response.data;
    },

    // Delete news
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/news/${id}`);
    },

    // Increment view count
    incrementViewCount: async (id: number): Promise<void> => {
        await axiosInstance.post(`/news/${id}/view`);
    },

    // Set news status
    setStatus: async (id: number, status: NewsStatus): Promise<CreateNewsResponse> => {
        const response = await axiosInstance.patch(`/news/${id}/status?status=${status}`);
        return response.data;
    },

    // Publish news
    publish: async (id: number): Promise<CreateNewsResponse> => {
        const response = await axiosInstance.patch(`/news/${id}/publish`);
        return response.data;
    },

    // Archive news
    archive: async (id: number): Promise<CreateNewsResponse> => {
        const response = await axiosInstance.patch(`/news/${id}/archive`);
        return response.data;
    },

    // Get related news
    getRelated: async (id: number, limit: number = 5): Promise<NewsListItem[]> => {
        const response = await axiosInstance.get(`/news/${id}/related?limit=${limit}`);
        return response.data;
    },

    // Validate slug uniqueness
    validateSlug: async (slug: string, excludeId?: number): Promise<SlugValidationResponse> => {
        const params = new URLSearchParams();
        params.append('slug', slug);
        if (excludeId) params.append('excludeId', excludeId.toString());
        
        const response = await axiosInstance.get(`/news/validate-slug?${params.toString()}`);
        return response.data;
    },

    // Get news by tags
    getByTags: async (tags: string[], page: number = 0, size: number = 10): Promise<NewsListResponse> => {
        const params = new URLSearchParams();
        tags.forEach(tag => params.append('tags', tag));
        params.append('pageable.page', page.toString());
        params.append('pageable.size', size.toString());
        
        const response = await axiosInstance.get(`/news/tags?${params.toString()}`);
        return response.data;
    },

    // Get news statistics
    getStatistics: async (): Promise<NewsStatistics> => {
        const response = await axiosInstance.get('/news/statistics');
        return response.data;
    },

    // Search news
    search: async (keyword: string, page: number = 0, size: number = 10): Promise<NewsListResponse> => {
        const params = new URLSearchParams();
        params.append('keyword', keyword);
        params.append('pageable.page', page.toString());
        params.append('pageable.size', size.toString());
        
        const response = await axiosInstance.get(`/news/search?${params.toString()}`);
        return response.data;
    },

    // Get recent news
    getRecent: async (limit: number = 10): Promise<NewsListItem[]> => {
        const response = await axiosInstance.get(`/news/recent?limit=${limit}`);
        return response.data;
    },

    // Get published news
    getPublished: async (page: number = 0, size: number = 10): Promise<NewsListResponse> => {
        const params = new URLSearchParams();
        params.append('pageable.page', page.toString());
        params.append('pageable.size', size.toString());
        
        const response = await axiosInstance.get(`/news/published?${params.toString()}`);
        return response.data;
    },

    // Get popular news
    getPopular: async (page: number = 0, size: number = 10): Promise<NewsListResponse> => {
        const params = new URLSearchParams();
        params.append('pageable.page', page.toString());
        params.append('pageable.size', size.toString());
        
        const response = await axiosInstance.get(`/news/popular?${params.toString()}`);
        return response.data;
    },

    // Get featured news
    getFeatured: async (page: number = 0, size: number = 10): Promise<NewsListResponse> => {
        const params = new URLSearchParams();
        params.append('pageable.page', page.toString());
        params.append('pageable.size', size.toString());
        
        const response = await axiosInstance.get(`/news/featured?${params.toString()}`);
        return response.data;
    },

    // Get news by category
    getByCategory: async (category: string, page: number = 0, size: number = 10): Promise<NewsListResponse> => {
        const params = new URLSearchParams();
        params.append('pageable.page', page.toString());
        params.append('pageable.size', size.toString());
        
        const response = await axiosInstance.get(`/news/category/${category}?${params.toString()}`);
        return response.data;
    },

    // Get breaking news
    getBreaking: async (page: number = 0, size: number = 10): Promise<NewsListResponse> => {
        const params = new URLSearchParams();
        params.append('pageable.page', page.toString());
        params.append('pageable.size', size.toString());
        
        const response = await axiosInstance.get(`/news/breaking?${params.toString()}`);
        return response.data;
    },

    // Get news by author
    getByAuthor: async (authorId: number, page: number = 0, size: number = 10): Promise<NewsListResponse> => {
        const params = new URLSearchParams();
        params.append('pageable.page', page.toString());
        params.append('pageable.size', size.toString());
        
        const response = await axiosInstance.get(`/news/author/${authorId}?${params.toString()}`);
        return response.data;
    }
};
