
import type {
    Achievement,
    AchievementsFilter,
    AchievementsResponse,
    CreateAchievementRequest,
    CreateAchievementResponse,
    UpdateAchievementRequest
} from '../types/achievements';
import axiosInstance from './axios';

const BASE_URL = '/achievements';

export const achievementApi = {
    // Get all achievements with filtering
    getAchievements: async (filters?: AchievementsFilter): Promise<AchievementsResponse> => {
        const params = new URLSearchParams();
        
        if (filters?.playerId !== undefined) params.append('playerId', filters.playerId.toString());
        if (filters?.title) params.append('title', filters.title);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
        if (filters?.fromDate) params.append('fromDate', filters.fromDate);
        if (filters?.toDate) params.append('toDate', filters.toDate);
        if (filters?.page !== undefined) params.append('page', filters.page.toString());
        if (filters?.size !== undefined) params.append('size', filters.size.toString());

        const queryString = params.toString();
        
        const response = await axiosInstance.get(`${BASE_URL}/public${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },

    // Get achievement by ID
    getAchievementById: async (id: number): Promise<Achievement> => {
        const response = await axiosInstance.get(`${BASE_URL}/public/${id}`);
        return response.data;
    },

    // Create new achievement
    createAchievement: async (achievement: CreateAchievementRequest): Promise<CreateAchievementResponse> => {
        const response = await axiosInstance.post(BASE_URL, achievement);
        return response.data;
    },

    // Update achievement
    updateAchievement: async (id: number, achievement: UpdateAchievementRequest): Promise<Achievement> => {
        const response = await axiosInstance.put(`${BASE_URL}/${id}`, achievement);
        return response.data;
    },

    // Delete achievement
    deleteAchievement: async (id: number): Promise<void> => {
        await axiosInstance.delete(`${BASE_URL}/${id}`);
    },

    // Get achievements by player ID
    getAchievementsByPlayerId: async (playerId: number, page = 0, size = 10): Promise<AchievementsResponse> => {
        return await achievementApi.getAchievements({
            playerId,
            page,
            size
        });
    },

    // Get featured achievements
    getFeaturedAchievements: async (page = 0, size = 10): Promise<AchievementsResponse> => {
        return await achievementApi.getAchievements({
            featured: true,
            page,
            size
        });
    },

    // Get achievements by category
    getAchievementsByCategory: async (category: string, page = 0, size = 10): Promise<AchievementsResponse> => {
        return await achievementApi.getAchievements({
            category,
            page,
            size
        });
    }
};
