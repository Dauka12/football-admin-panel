import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';
import type { LoginResponse } from '../types/auth';
import { apiService } from '../utils/apiService';
import { ErrorHandler } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

interface AuthState {
    user: LoginResponse | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (phone: string, password: string) => Promise<boolean>;
    register: (firstname: string, lastname: string, phone: string, password: string) => Promise<boolean>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,

            login: async (phone, password) => {
                set({ isLoading: true, error: null });
                
                try {
                    const response = await apiService.execute(
                        () => authApi.login({ phone, password }),
                        'login'
                    );
                    
                    set({
                        user: response,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    
                    localStorage.setItem('auth_token', response.token);
                    showToast('Login successful!', 'success');
                    return true;
                } 
                catch (error: any) {
                    const errorMessage = ErrorHandler.handle(error);
                    set({
                        error: errorMessage.message,
                        isLoading: false
                    });
                    
                    return false;
                }
            },

            register: async (firstname, lastname, phone, password) => {
                set({ isLoading: true, error: null });
                
                try {
                    await apiService.execute(
                        () => authApi.register({ firstname, lastname, phone, password }),
                        'register'
                    );
                    set({ isLoading: false });
                    
                    showToast('Registration successful! Please login.', 'success');
                    return true;
                } 
                catch (error: any) {
                    const errorMessage = ErrorHandler.handle(error);
                    set({
                        error: errorMessage.message,
                        isLoading: false
                    });
                    
                    return false;
                }
            },

            logout: () => {
                localStorage.removeItem('auth_token');
                apiService.clearCache(); // Clear API cache on logout
                set({ user: null, isAuthenticated: false });
                showToast('Logged out successfully', 'info');
                // Note: Navigation should be handled by React Router in the component
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);
