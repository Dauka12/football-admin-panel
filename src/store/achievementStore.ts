
import { create } from 'zustand';
import { achievementApi } from '../api/achievements';
import type { Achievement, AchievementsFilter, CreateAchievementRequest, UpdateAchievementRequest } from '../types/achievements';
import { showToast } from '../utils/toast';

interface AchievementStore {
    achievements: Achievement[];
    currentAchievement: Achievement | null;
    isLoading: boolean;
    error: string | null;
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    filters: AchievementsFilter;

    // Actions
    fetchAchievements: (page?: number, size?: number) => Promise<void>;
    fetchAchievementById: (id: number) => Promise<void>;
    createAchievement: (achievement: CreateAchievementRequest) => Promise<number | null>;
    updateAchievement: (id: number, achievement: UpdateAchievementRequest) => Promise<void>;
    deleteAchievement: (id: number) => Promise<void>;
    setFilters: (filters: Partial<AchievementsFilter>) => void;
    clearFilters: () => void;
    setCurrentAchievement: (achievement: Achievement | null) => void;
    clearError: () => void;
}

const initialFilters: AchievementsFilter = {
    page: 0,
    size: 10
};

export const useAchievementStore = create<AchievementStore>((set, get) => ({
    achievements: [],
    currentAchievement: null,
    isLoading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    filters: initialFilters,

    fetchAchievements: async (page = 0, size = 10) => {
        set({ isLoading: true, error: null });
        try {
            const filters = { ...get().filters, page, size };
            const response = await achievementApi.getAchievements(filters);
            
            set({
                achievements: response.content,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
                currentPage: response.number,
                pageSize: response.size,
                isLoading: false
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch achievements';
            set({ error: errorMessage, isLoading: false });
            showToast(errorMessage, 'error');
        }
    },

    fetchAchievementById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const achievement = await achievementApi.getAchievementById(id);
            set({ currentAchievement: achievement, isLoading: false });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch achievement';
            set({ error: errorMessage, isLoading: false, currentAchievement: null });
            showToast(errorMessage, 'error');
        }
    },

    createAchievement: async (achievement: CreateAchievementRequest) => {
        set({ isLoading: true, error: null });
        try {
            const response = await achievementApi.createAchievement(achievement);
            
            // Refresh achievements list
            await get().fetchAchievements(get().currentPage, get().pageSize);
            
            showToast('Achievement created successfully', 'success');
            set({ isLoading: false });
            return response.id;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create achievement';
            set({ error: errorMessage, isLoading: false });
            showToast(errorMessage, 'error');
            return null;
        }
    },

    updateAchievement: async (id: number, achievement: UpdateAchievementRequest) => {
        set({ isLoading: true, error: null });
        try {
            const updatedAchievement = await achievementApi.updateAchievement(id, achievement);
            
            // Update achievements list
            set(state => ({
                achievements: state.achievements.map(a => 
                    a.id === id ? updatedAchievement : a
                ),
                currentAchievement: state.currentAchievement?.id === id ? updatedAchievement : state.currentAchievement,
                isLoading: false
            }));
            
            showToast('Achievement updated successfully', 'success');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update achievement';
            set({ error: errorMessage, isLoading: false });
            showToast(errorMessage, 'error');
        }
    },

    deleteAchievement: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await achievementApi.deleteAchievement(id);
            
            // Remove from achievements list
            set(state => ({
                achievements: state.achievements.filter(a => a.id !== id),
                currentAchievement: state.currentAchievement?.id === id ? null : state.currentAchievement,
                isLoading: false
            }));
            
            showToast('Achievement deleted successfully', 'success');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete achievement';
            set({ error: errorMessage, isLoading: false });
            showToast(errorMessage, 'error');
        }
    },

    setFilters: (newFilters: Partial<AchievementsFilter>) => {
        set(state => ({
            filters: { ...state.filters, ...newFilters }
        }));
    },

    clearFilters: () => {
        set({ filters: initialFilters });
    },

    setCurrentAchievement: (achievement: Achievement | null) => {
        set({ currentAchievement: achievement });
    },

    clearError: () => {
        set({ error: null });
    }
}));
