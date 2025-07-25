// Types for file/image management
export interface FileUploadResponse {
    id: number;
    filename: string;
    url: string;
    size: number;
    mimeType: string;
}

export interface MultipleFileUploadResponse {
    fileIds: FileUploadResponse[];
}

export interface FileUploadRequest {
    file: File;
    type: string;
    objectId: number;
}

export interface MultipleFileUploadRequest {
    files: File[];
    type: string;
    objectId: number;
}

export interface FileInfo {
    id: number;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    type: string;
    objectId: number;
    createdAt: string;
    updatedAt: string;
}

// File types as string literal union (according to database and usage)
export type FileType = 
    | 'user-avatar'
    | 'team-logo'
    | 'player-image'
    | 'tournament-banner'
    | 'document'
    | 'image';

// Upload progress tracking
export interface UploadProgress {
    fileId: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}
