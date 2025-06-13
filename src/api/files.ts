import type {
    FileUploadRequest,
    FileUploadResponse,
    MultipleFileUploadRequest,
    MultipleFileUploadResponse
} from '../types/files';
import axiosInstance from './axios';


export const fileApi = {
    // Upload single file
    uploadFile: async (request: FileUploadRequest): Promise<FileUploadResponse> => {
        const formData = new FormData();
        formData.append('file', request.file);

        const response = await axiosInstance.post<FileUploadResponse>(
            `/images/upload?type=${request.type}&objectId=${request.objectId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // Upload multiple files
    uploadMultipleFiles: async (request: MultipleFileUploadRequest): Promise<MultipleFileUploadResponse> => {
        const formData = new FormData();
        request.files.forEach((file) => {
            formData.append(`files`, file);
        });

        const response = await axiosInstance.post<MultipleFileUploadResponse>(
            `/images/upload-multiple?type=${request.type}&objectId=${request.objectId}&files=${request.files.map(f => f.name).join(',')}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // Get file by ID
    getFile: async (fileId: number): Promise<string> => {
        const response = await axiosInstance.get(`/images/${fileId}`, {
            responseType: 'blob',
        });

        // Convert blob to URL
        if (response.data instanceof Blob) {
            return URL.createObjectURL(response.data);
        }
        return response.data as string;
    },

    // Get files by object ID and type
    getFilesByObject: async (objectId: number, type: string): Promise<string> => {
        const response = await axiosInstance.get(
            `/images/object/${objectId}?type=${type}`,
            {
                responseType: 'blob',
            }
        );

        // Convert blob to URL
        if (response.data instanceof Blob) {
            return URL.createObjectURL(response.data);
        }
        return response.data as string;
    },

    // Helper method to get image URL for display
    getImageUrl: (fileId: number): string => {
        return `${axiosInstance.defaults.baseURL}/images/${fileId}`;
    },

    // Helper method to get object images URL
    getObjectImageUrl: (objectId: number, type: string): string => {
        return `${axiosInstance.defaults.baseURL}/images/object/${objectId}?type=${type}`;
    }
};
