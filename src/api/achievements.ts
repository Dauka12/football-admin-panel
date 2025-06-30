
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
        try {
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
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
            throw error;
        }
    },

    // Get achievement by ID
    getAchievementById: async (id: number): Promise<Achievement> => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/public/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch achievement:', error);
            throw error;
        }
    },

    // Create new achievement
    createAchievement: async (achievement: CreateAchievementRequest): Promise<CreateAchievementResponse> => {
        try {
            const response = await axiosInstance.post(BASE_URL, achievement);
            return response.data;
        } catch (error) {
            console.error('Failed to create achievement:', error);
            throw error;
        }
    },

    // Update achievement
    updateAchievement: async (id: number, achievement: UpdateAchievementRequest): Promise<Achievement> => {
        try {
            const response = await axiosInstance.put(`${BASE_URL}/${id}`, achievement);
            return response.data;
        } catch (error) {
            console.error('Failed to update achievement:', error);
            throw error;
        }
    },

    // Delete achievement
    deleteAchievement: async (id: number): Promise<void> => {
        try {
            await axiosInstance.delete(`${BASE_URL}/${id}`);
        } catch (error) {
            console.error('Failed to delete achievement:', error);
            throw error;
        }
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
