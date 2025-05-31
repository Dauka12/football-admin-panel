import { AxiosError } from 'axios';
import { toast } from './toast';

export interface AppError {
    message: string;
    code?: string;
    statusCode?: number;
    field?: string;
    details?: any;
}

export class ErrorHandler {
    static handle(error: any, context?: string): AppError {
        console.error(`Error in ${context || 'unknown context'}:`, error);

        // Handle Axios errors
        if (error.isAxiosError || error.response) {
            return this.handleApiError(error as AxiosError);
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return this.handleValidationError(error);
        }

        // Handle network errors
        if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
            return this.handleNetworkError();
        }

        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            return this.handleTimeoutError();
        }

        // Generic error
        return {
            message: error.message || 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR'
        };
    }

    private static handleApiError(error: AxiosError): AppError {
        const status = error.response?.status;
        const data = error.response?.data as any;

        switch (status) {
            case 400:
                return {
                    message: data?.message || 'Invalid request data',
                    code: 'VALIDATION_ERROR',
                    statusCode: 400,
                    field: data?.field,
                    details: data?.errors
                };
            case 401:
                return {
                    message: 'Authentication required',
                    code: 'UNAUTHORIZED',
                    statusCode: 401
                };
            case 403:
                return {
                    message: 'You do not have permission to perform this action',
                    code: 'FORBIDDEN',
                    statusCode: 403
                };
            case 404:
                return {
                    message: data?.message || 'Resource not found',
                    code: 'NOT_FOUND',
                    statusCode: 404
                };
            case 409:
                return {
                    message: data?.message || 'Conflict: Resource already exists',
                    code: 'CONFLICT',
                    statusCode: 409
                };
            case 422:
                return {
                    message: data?.message || 'Validation failed',
                    code: 'UNPROCESSABLE_ENTITY',
                    statusCode: 422,
                    details: data?.errors
                };
            case 500:
                return {
                    message: 'Internal server error. Please try again later.',
                    code: 'SERVER_ERROR',
                    statusCode: 500
                };
            default:
                return {
                    message: data?.message || `Request failed with status ${status}`,
                    code: 'API_ERROR',
                    statusCode: status
                };
        }
    }

    private static handleValidationError(error: any): AppError {
        return {
            message: error.message || 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.details
        };
    }

    private static handleNetworkError(): AppError {
        return {
            message: 'Network connection failed. Please check your internet connection.',
            code: 'NETWORK_ERROR'
        };
    }

    private static handleTimeoutError(): AppError {
        return {
            message: 'Request timed out. Please try again.',
            code: 'TIMEOUT_ERROR'
        };
    }

    static showError(error: AppError, context?: string): void {
        const errorMessage = this.getDisplayMessage(error, context);
        toast.error(errorMessage);
    }

    private static getDisplayMessage(error: AppError, context?: string): string {
        const contextPrefix = context ? `${context}: ` : '';
        
        switch (error.code) {
            case 'NETWORK_ERROR':
                return 'Check your internet connection and try again.';
            case 'TIMEOUT_ERROR':
                return 'Request timed out. Please try again.';
            case 'UNAUTHORIZED':
                return 'Please log in to continue.';
            case 'FORBIDDEN':
                return 'You do not have permission for this action.';
            case 'NOT_FOUND':
                return contextPrefix + 'Resource not found.';
            case 'VALIDATION_ERROR':
                return error.details ? 
                    Object.values(error.details).flat().join(', ') : 
                    error.message;
            default:
                return contextPrefix + error.message;
        }
    }

    static isRetryableError(error: AppError): boolean {
        return ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'].includes(error.code || '');
    }
}
