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
    // Data
    users: User[];
    currentUser: User | null;
    roles: UserRole[];
    
    // UI State
    isLoading: boolean;
    error: string | null;
    lastRequestId: string;
    
    // Pagination
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    
    // Filter State - moved from component to store
    filters: UserFilterParams;
    filterFirstName: string;
    filterLastName: string;
    filterPhone: string;
    filterRoleIds: number[];
    sortField: string;
    sortDirection: 'asc' | 'desc';
    
    // Actions
    fetchUsers: (page?: number, size?: number) => Promise<void>;
    fetchUser: (id: number) => Promise<void>;
    fetchRoles: () => Promise<void>;
    createUser: (data: CreateUserRequest) => Promise<boolean>;
    updateUser: (id: number, data: UpdateUserRequest) => Promise<boolean>;
    updateUserRoles: (userId: number, roleIds: number[]) => Promise<boolean>;
    deleteUser: (id: number) => Promise<boolean>;
    
    // Filter actions
    setFilterFirstName: (value: string) => void;
    setFilterLastName: (value: string) => void;
    setFilterPhone: (value: string) => void;
    toggleFilterRole: (roleId: number) => void;
    setSortField: (field: string) => void;
    setSortDirection: (direction: 'asc' | 'desc') => void;
    
    // Filter operations
    applyFilters: () => Promise<void>;
    resetFilters: () => Promise<void>;
    
    // Other actions
    clearError: () => void;
    setCurrentUser: (user: User | null) => void;
    reset: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
    // Initial data
    users: [],
    currentUser: null,
    roles: [],
    
    // Initial UI state
    isLoading: false,
    error: null,
    lastRequestId: '',
    
    // Initial pagination
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    
    // Initial filter state
    filters: {},
    filterFirstName: '',
    filterLastName: '',
    filterPhone: '',
    filterRoleIds: [],
    sortField: '',
    sortDirection: 'asc',
    
    // Fetch users with debounce and request ID
    fetchUsers: async (page = 0, size = 10) => {
        // Generate unique request ID
        const requestId = Date.now().toString();
        
        // Set loading and request ID
        set(state => ({
            isLoading: true, 
            error: null,
            lastRequestId: requestId
        }));
        
        try {
            const { filters } = get();
            const response = await usersApi.getAll(page, size, filters);
            
            // Check if this response is for the most recent request
            if (get().lastRequestId !== requestId) {
                console.log('Ignoring stale response for request:', requestId);
                return;
            }
            
            set({
                users: response.content,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
                currentPage: page,
                pageSize: response.size,
                isLoading: false
            });
        } catch (error) {
            // Only update error if this is still the most recent request
            if (get().lastRequestId === requestId) {
                const errorMessage = ErrorHandler.handle(error);
                set({ 
                    error: errorMessage.message,
                    isLoading: false 
                });
            }
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
                { enableCache: true, cacheTTL: 10 * 60 * 1000 }
            );
            set({ roles });
        } catch (error) {
            const errorMessage = ErrorHandler.handle(error);
            console.error('Failed to fetch roles:', errorMessage.message);
        }
    },

    // Filter state actions
    setFilterFirstName: (value: string) => set({ filterFirstName: value }),
    setFilterLastName: (value: string) => set({ filterLastName: value }),
    setFilterPhone: (value: string) => set({ filterPhone: value }),
    toggleFilterRole: (roleId: number) => set(state => ({
        filterRoleIds: state.filterRoleIds.includes(roleId)
            ? state.filterRoleIds.filter(id => id !== roleId)
            : [...state.filterRoleIds, roleId]
    })),
    setSortField: (field: string) => set({ sortField: field }),
    setSortDirection: (direction: 'asc' | 'desc') => set({ sortDirection: direction }),
    
    // Apply filters
    applyFilters: async () => {
        const {
            filterFirstName,
            filterLastName,
            filterPhone,
            filterRoleIds,
            sortField,
            sortDirection,
            pageSize
        } = get();
        
        // Build filters object
        const filters: UserFilterParams = {
            firstName: filterFirstName || undefined,
            lastName: filterLastName || undefined,
            phone: filterPhone || undefined,
            roleIds: filterRoleIds.length > 0 ? filterRoleIds : undefined,
            sortField: sortField || undefined,
            sortDirection: sortDirection || undefined
        };
        
        // Update filters in store and fetch
        set({ filters });
        await get().fetchUsers(0, pageSize);
    },
    
    // Reset filters with a clean approach
    resetFilters: async () => {
        // Reset all filter state in one operation
        set({
            filterFirstName: '',
            filterLastName: '',
            filterPhone: '',
            filterRoleIds: [],
            sortField: '',
            sortDirection: 'asc',
            filters: {}
        });
        
        // After state is reset, fetch data
        const { pageSize } = get();
        await get().fetchUsers(0, pageSize);
    },
    
    createUser: async (data: CreateUserRequest) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.execute(
                () => usersApi.create(data),
                'createUser'
            );
            
            // Refresh users list with current page
            await get().fetchUsers(get().currentPage, get().pageSize);
            
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
            
            // Update state
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

            // Update state
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

    clearError: () => set({ error: null }),

    setCurrentUser: (user: User | null) => set({ currentUser: user }),

    reset: () => {
        set({
            users: [],
            currentUser: null,
            isLoading: false,
            error: null,
            totalElements: 0,
            totalPages: 0,
            currentPage: 0,
            pageSize: 10,
            filters: {},
            filterFirstName: '',
            filterLastName: '',
            filterPhone: '',
            filterRoleIds: [],
            sortField: '',
            sortDirection: 'asc'
        });
    }
}));
