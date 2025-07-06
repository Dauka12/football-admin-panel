import { create } from 'zustand';
import { usersApi } from '../api/users';
import type {
    CreateUserRequest,
    UpdateUserRequest,
    User,
    UserFilterParams,
    UserRole
} from '../types/users';
import { apiService } from '../utils/apiService';
import { ErrorHandler } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

interface UserStore {
    users: User[];
    currentUser: User | null;
    roles: UserRole[];
    isLoading: boolean;
    error: string | null;
    
    // Pagination
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    
    // Filters
    filters: UserFilterParams;
    
    // Actions
    fetchUsers: (page?: number, size?: number) => Promise<void>;
    fetchUser: (id: number) => Promise<void>;
    fetchRoles: () => Promise<void>;
    createUser: (data: CreateUserRequest) => Promise<boolean>;
    updateUser: (id: number, data: UpdateUserRequest) => Promise<boolean>;
    updateUserRoles: (userId: number, roleIds: number[]) => Promise<boolean>;
    deleteUser: (id: number) => Promise<boolean>;
    setFilters: (filters: UserFilterParams) => void;
    clearError: () => void;
    setCurrentUser: (user: User | null) => void;
    reset: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
    users: [],
    currentUser: null,
    roles: [],
    isLoading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    filters: {},

    fetchUsers: async (page = 0, size = 10) => {
        set({ isLoading: true, error: null });
        try {
            const { filters } = get();
            
            // Clear cache for pagination to ensure fresh data
            apiService.clearCache(['fetchUsers']);
            
            const response = await apiService.execute(
                () => usersApi.getAll(page, size, filters),
                `fetchUsers_${page}_${size}`, // Use page and size in cache key
                { enableCache: false } // Disable cache for pagination
            );
            
            set({
                users: response.content,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
                currentPage: page,
                pageSize: response.size,
                isLoading: false
            });
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ 
                error: errorMessage.message,
                isLoading: false 
            });
        }
    },

    fetchUser: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const user = await apiService.execute(
                () => usersApi.getById(id),
                `fetchUser_${id}`,
                { enableCache: true, cacheTTL: 2 * 60 * 1000 }
            );
            set({ currentUser: user, isLoading: false });
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({ 
                error: errorMessage.message,
                isLoading: false 
            });
        }
    },

    fetchRoles: async () => {
        try {
            const roles = await apiService.execute(
                () => usersApi.getRoles(),
                'fetchRoles',
                { enableCache: true, cacheTTL: 10 * 60 * 1000 } // Cache for 10 minutes
            );
            set({ roles });
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            console.error('Failed to fetch roles:', errorMessage.message);
        }
    },

    createUser: async (data: CreateUserRequest) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => usersApi.create(data),
                'createUser'
            );
            
            // Clear cache and refresh users list
            apiService.clearCache(['fetchUsers']);
            await get().fetchUsers(get().currentPage, get().pageSize);
            
            set({ isLoading: false });
            showToast('User created successfully!', 'success');
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    updateUser: async (id: number, data: UpdateUserRequest) => {
        set({ isLoading: true, error: null });
        try {
            const updatedUser = await apiService.execute(
                () => usersApi.update(id, data),
                `updateUser_${id}`
            );
            
            // Clear relevant cache entries
            apiService.clearCache([`fetchUser_${id}`, 'fetchUsers']);
            
            // Update state with the correctly typed data from the API
            set(state => ({
                users: state.users.map(user => user.id === id ? updatedUser : user),
                currentUser: state.currentUser?.id === id ? updatedUser : state.currentUser,
                isLoading: false
            }));
            
            showToast('User updated successfully!', 'success');
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    updateUserRoles: async (userId: number, roleIds: number[]) => {
        set({ isLoading: true, error: null });
        try {
            const updatedUser = await apiService.execute(
                () => usersApi.updateRoles(userId, roleIds),
                `updateUserRoles_${userId}`
            );
            
            // Clear relevant cache entries
            apiService.clearCache([`fetchUser_${userId}`, 'fetchUsers']);
            
            // Update state
            set(state => ({
                users: state.users.map(user => user.id === userId ? updatedUser : user),
                currentUser: state.currentUser?.id === userId ? updatedUser : state.currentUser,
                isLoading: false
            }));
            
            showToast('User roles updated successfully!', 'success');
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    deleteUser: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => usersApi.delete(id),
                `deleteUser_${id}`
            );

            // Clear relevant cache entries
            apiService.clearCache([`fetchUser_${id}`, 'fetchUsers']);

            // Remove from current list without reloading
            set(state => ({
                users: state.users.filter(user => user.id !== id),
                currentUser: state.currentUser?.id === id ? null : state.currentUser,
                isLoading: false
            }));
            
            showToast('User deleted successfully!', 'success');
            return true;
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    setFilters: (filters: UserFilterParams) => {
        set({ filters });
    },

    clearError: () => set({ error: null }),

    setCurrentUser: (user: User | null) => set({ currentUser: user }),

    reset: () => {
        set({
            users: [],
            currentUser: null,
            roles: [],
            isLoading: false,
            error: null,
            totalElements: 0,
            totalPages: 0,
            currentPage: 0,
            pageSize: 10,
            filters: {}
        });
    }
}));
