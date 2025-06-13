import { create } from 'zustand';
import { fileApi } from '../api/files';
import type {
    FileUploadRequest,
    FileUploadResponse,
    MultipleFileUploadRequest,
    MultipleFileUploadResponse,
    UploadProgress
} from '../types/files';

interface FileStore {
  // State
  uploadProgress: Record<string, UploadProgress>;
  isUploading: boolean;
  error: string | null;
  
  // Actions
  uploadFile: (request: FileUploadRequest, onProgress?: (progress: number) => void) => Promise<FileUploadResponse>;
  uploadMultipleFiles: (request: MultipleFileUploadRequest, onProgress?: (progress: number) => void) => Promise<MultipleFileUploadResponse>;
  getFile: (fileId: number) => Promise<string>;
  getFilesByObject: (objectId: number, type: string) => Promise<string>;
  getImageUrl: (fileId: number) => string;
  getObjectImageUrl: (objectId: number, type: string) => string;
  
  // Progress tracking
  setUploadProgress: (fileId: string, progress: UploadProgress) => void;
  clearUploadProgress: (fileId?: string) => void;
  setError: (error: string | null) => void;
  setIsUploading: (isUploading: boolean) => void;
}

export const useFileStore = create<FileStore>((set, get) => ({
  // Initial state
  uploadProgress: {},
  isUploading: false,
  error: null,

  // Upload single file
  uploadFile: async (request: FileUploadRequest, onProgress?: (progress: number) => void) => {
    const fileId = `${request.type}_${request.objectId}_${Date.now()}`;
    
    try {
      set({ isUploading: true, error: null });
      
      // Set initial progress
      get().setUploadProgress(fileId, {
        fileId,
        progress: 0,
        status: 'pending'
      });

      // Simulate progress updates during upload
      if (onProgress) {
        const progressInterval = setInterval(() => {
          const currentProgress = get().uploadProgress[fileId]?.progress || 0;
          if (currentProgress < 90) {
            const newProgress = Math.min(currentProgress + 10, 90);
            get().setUploadProgress(fileId, {
              fileId,
              progress: newProgress,
              status: 'uploading'
            });
            onProgress(newProgress);
          }
        }, 200);

        // Clear interval after upload
        setTimeout(() => clearInterval(progressInterval), 2000);
      }

      const response = await fileApi.uploadFile(request);
      
      // Set completion progress
      get().setUploadProgress(fileId, {
        fileId,
        progress: 100,
        status: 'completed'
      });
      
      if (onProgress) {
        onProgress(100);
      }

      set({ isUploading: false });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      get().setUploadProgress(fileId, {
        fileId,
        progress: 0,
        status: 'error',
        error: errorMessage
      });
      
      set({ 
        isUploading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  // Upload multiple files
  uploadMultipleFiles: async (request: MultipleFileUploadRequest, onProgress?: (progress: number) => void) => {
    const batchId = `batch_${request.type}_${request.objectId}_${Date.now()}`;
    
    try {
      set({ isUploading: true, error: null });
      
      // Set initial progress for batch
      get().setUploadProgress(batchId, {
        fileId: batchId,
        progress: 0,
        status: 'pending'
      });

      // Simulate progress updates
      if (onProgress) {
        const progressInterval = setInterval(() => {
          const currentProgress = get().uploadProgress[batchId]?.progress || 0;
          if (currentProgress < 90) {
            const newProgress = Math.min(currentProgress + 15, 90);
            get().setUploadProgress(batchId, {
              fileId: batchId,
              progress: newProgress,
              status: 'uploading'
            });
            onProgress(newProgress);
          }
        }, 300);

        setTimeout(() => clearInterval(progressInterval), 3000);
      }

      const response = await fileApi.uploadMultipleFiles(request);
      
      // Set completion progress
      get().setUploadProgress(batchId, {
        fileId: batchId,
        progress: 100,
        status: 'completed'
      });
      
      if (onProgress) {
        onProgress(100);
      }

      set({ isUploading: false });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch upload failed';
      
      get().setUploadProgress(batchId, {
        fileId: batchId,
        progress: 0,
        status: 'error',
        error: errorMessage
      });
      
      set({ 
        isUploading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  // Get file
  getFile: async (fileId: number) => {
    try {
      set({ error: null });
      return await fileApi.getFile(fileId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get file';
      set({ error: errorMessage });
      throw error;
    }
  },

  // Get files by object
  getFilesByObject: async (objectId: number, type: string) => {
    try {
      set({ error: null });
      return await fileApi.getFilesByObject(objectId, type);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get files';
      set({ error: errorMessage });
      throw error;
    }
  },

  // Get image URL helpers
  getImageUrl: (fileId: number) => fileApi.getImageUrl(fileId),
  getObjectImageUrl: (objectId: number, type: string) => fileApi.getObjectImageUrl(objectId, type),

  // Progress management
  setUploadProgress: (fileId: string, progress: UploadProgress) => {
    set(state => ({
      uploadProgress: {
        ...state.uploadProgress,
        [fileId]: progress
      }
    }));
  },

  clearUploadProgress: (fileId?: string) => {
    if (fileId) {
      set(state => {
        const newProgress = { ...state.uploadProgress };
        delete newProgress[fileId];
        return { uploadProgress: newProgress };
      });
    } else {
      set({ uploadProgress: {} });
    }
  },

  setError: (error: string | null) => set({ error }),
  setIsUploading: (isUploading: boolean) => set({ isUploading })
}));
