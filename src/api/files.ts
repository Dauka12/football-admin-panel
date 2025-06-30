import type {
    FileUploadRequest,
    FileUploadResponse,
    MultipleFileUploadRequest,
    MultipleFileUploadResponse
} from '../types/files';
import axiosInstance from './axios';

// Add request interceptor for auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        if (response.data === null || response.data === undefined) {
            response.data = [];
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
        }
        console.error('Files API Error:', error);
        return Promise.reject(error);
    }
);

// Custom error handling for file operations
const handleFileApiError = (error: any): never => {
    if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.message;

        switch (status) {
            case 400:
                throw new Error(`Invalid file or request data: ${message}`);
            case 403:
                throw new Error('Not authorized to upload files');
            case 413:
                throw new Error('File size too large');
            case 415:
                throw new Error('Unsupported file type');
            default:
                throw new Error(`File operation failed: ${message}`);
        }
    }
    throw new Error(error.message || 'File operation failed');
};

export const fileApi = {
    // Upload single file
    uploadFile: async (request: FileUploadRequest): Promise<FileUploadResponse> => {
        try {
            const formData = new FormData();
            formData.append('file', request.file);

            const response = await axiosInstance.post<FileUploadResponse>(
                `/images/upload?type=${encodeURIComponent(request.type)}&objectId=${request.objectId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            return handleFileApiError(error);
        }
    },

    // Upload multiple files
    uploadMultipleFiles: async (request: MultipleFileUploadRequest): Promise<MultipleFileUploadResponse> => {
        try {
            const formData = new FormData();
            request.files.forEach((file) => {
                formData.append('files', file);
            });

            const response = await axiosInstance.post<MultipleFileUploadResponse>(
                `/images/upload-multiple?type=${encodeURIComponent(request.type)}&objectId=${request.objectId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            return handleFileApiError(error);
        }
    },

    // Get file by ID
    getFile: async (fileId: number): Promise<string> => {
        try {
            const response = await axiosInstance.get(`/images/${fileId}`, {
                responseType: 'blob',
            });

            // Convert blob to URL
            if (response.data instanceof Blob) {
                return URL.createObjectURL(response.data);
            }
            return response.data as string;
        } catch (error) {
            return handleFileApiError(error);
        }
    },

    // Get files by object ID and type
    getFilesByObject: async (objectId: number, type: string): Promise<string> => {
        try {
            const response = await axiosInstance.get(
                `/images/object/${objectId}?type=${encodeURIComponent(type)}`,
                {
                    responseType: 'blob',
                }
            );

            // Convert blob to URL
            if (response.data instanceof Blob) {
                return URL.createObjectURL(response.data);
            }
            return response.data as string;
        } catch (error) {
            return handleFileApiError(error);
        }
    },

    // Helper method to get image URL for display
    getImageUrl: (fileId: number): string => {
        return `${axiosInstance.defaults.baseURL}/images/${fileId}`;
    },

    // Helper method to get object images URL
    getObjectImageUrl: (objectId: number, type: string): string => {
        return `${axiosInstance.defaults.baseURL}/images/object/${objectId}?type=${encodeURIComponent(type)}`;
    }
};
