import { type AppError, ErrorHandler } from './errorHandler';

interface RetryOptions {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    retryCondition?: (error: AppError) => boolean;
}

export class ApiService {
    private static defaultRetryOptions: RetryOptions = {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
        retryCondition: (error: AppError) => ErrorHandler.isRetryableError(error)
    };

    static async executeWithRetry<T>(
        operation: () => Promise<T>,
        context: string,
        options: RetryOptions = {}
    ): Promise<T> {
        const finalOptions = { ...this.defaultRetryOptions, ...options };
        let lastError: AppError = ErrorHandler.handle(new Error('Operation failed for unknown reasons'), context);

        for (let attempt = 1; attempt <= finalOptions.maxAttempts!; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = ErrorHandler.handle(error, context);

                // Don't retry if it's the last attempt or error is not retryable
                if (attempt === finalOptions.maxAttempts || !finalOptions.retryCondition!(lastError)) {
                    break;
                }

                // Calculate delay with exponential backoff
                const delay = Math.min(
                    finalOptions.baseDelay! * Math.pow(finalOptions.backoffFactor!, attempt - 1),
                    finalOptions.maxDelay!
                );

                console.log(`Retrying ${context} in ${delay}ms (attempt ${attempt}/${finalOptions.maxAttempts})`);
                await this.delay(delay);
            }
        }

        throw lastError;
    }

    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async withErrorHandling<T>(
        operation: () => Promise<T>,
        context: string,
        showToast: boolean = true
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            const appError = ErrorHandler.handle(error, context);
            
            if (showToast) {
                ErrorHandler.showError(appError, context);
            }
            
            throw appError;
        }
    }
}

// Cache management utility
export class CacheManager {
    private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

    static set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlMs
        });
    }

    static get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        
        if (!entry) return null;

        const isExpired = Date.now() - entry.timestamp > entry.ttl;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    static invalidate(pattern: string): void {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    static clear(): void {
        this.cache.clear();
    }
}

// Loading state manager
export class LoadingManager {
    private static loadingStates = new Map<string, boolean>();
    private static listeners = new Map<string, Set<(isLoading: boolean) => void>>();

    static setLoading(key: string, isLoading: boolean): void {
        this.loadingStates.set(key, isLoading);
        
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(callback => callback(isLoading));
        }
    }

    static isLoading(key: string): boolean {
        return this.loadingStates.get(key) || false;
    }

    static subscribe(key: string, callback: (isLoading: boolean) => void): () => void {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        
        this.listeners.get(key)!.add(callback);
        
        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(key);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.listeners.delete(key);
                }
            }
        };
    }

    static getGlobalLoadingState(): boolean {
        return Array.from(this.loadingStates.values()).some(state => state);
    }
}

// Unified API service that combines retry, cache, and loading management
interface ExecuteOptions {
    enableCache?: boolean;
    cacheTTL?: number;
    forceRefresh?: boolean;
    showToast?: boolean;
    maxRetries?: number;
}

class UnifiedApiService {
    async execute<T>(
        operation: () => Promise<T>,
        cacheKey: string,
        options: ExecuteOptions = {}
    ): Promise<T> {
        const {
            enableCache = false,
            cacheTTL = 5 * 60 * 1000, // 5 minutes default
            forceRefresh = false,
            showToast = true,
            maxRetries = 3
        } = options;

        // Check cache first (if enabled and not forcing refresh)
        if (enableCache && !forceRefresh) {
            const cached = CacheManager.get<T>(cacheKey);
            if (cached !== null) {
                return cached;
            }
        }

        // Set loading state
        LoadingManager.setLoading(cacheKey, true);

        try {
            // Execute with retry logic
            const result = await ApiService.executeWithRetry(
                operation,
                cacheKey,
                { maxAttempts: maxRetries }
            );

            // Cache the result if caching is enabled
            if (enableCache) {
                CacheManager.set(cacheKey, result, cacheTTL);
            }

            return result;
        } catch (error) {
            // Handle error with toast notification
            if (showToast) {
                const appError = error as AppError;
                ErrorHandler.showError(appError, cacheKey);
            }
            throw error;
        } finally {
            // Clear loading state
            LoadingManager.setLoading(cacheKey, false);
        }
    }

    clearCache(keys?: string[]): void {
        if (keys) {
            keys.forEach(key => CacheManager.invalidate(key));
        } else {
            CacheManager.clear();
        }
    }

    isLoading(key: string): boolean {
        return LoadingManager.isLoading(key);
    }

    getGlobalLoadingState(): boolean {
        return LoadingManager.getGlobalLoadingState();
    }
}

export const apiService = new UnifiedApiService();
