import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileStore } from '../../store/fileStore';
import { type FileType } from '../../types/files';

interface FileUploadProps {
    type: FileType | string;
    objectId: number;
    multiple?: boolean;
    accept?: string;
    maxSize?: number; // in MB
    onUploadComplete?: (fileIds: number[]) => void;
    onUploadError?: (error: string) => void;
    className?: string;
    children?: React.ReactNode;
}

const FileUpload: React.FC<FileUploadProps> = ({
    type,
    objectId,
    multiple = false,
    accept = 'image/*',
    maxSize = 5, // 5MB default
    onUploadComplete,
    onUploadError,
    className = '',
    children
}) => {
    const { t } = useTranslation();
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const {
        uploadFile,
        uploadMultipleFiles,
        isUploading,
        error
    } = useFileStore();

    // File validation
    const validateFile = useCallback((file: File): string | null => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            return t('files.error.fileTooBig', { maxSize });
        }

        // Check file type
        if (accept !== '*/*' && !file.type.match(accept.replace('*', '.*'))) {
            return t('files.error.invalidFileType', { accept });
        }

        return null;
    }, [maxSize, accept, t]);

    // Handle file upload
    const handleUpload = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files);

        // Validate all files
        for (const file of fileArray) {
            const error = validateFile(file);
            if (error) {
                onUploadError?.(error);
                return;
            }
        }

        try {
            setUploadProgress(0);

            if (fileArray.length === 1) {
                // Single file upload
                const response = await uploadFile(
                    {
                        file: fileArray[0],
                        type,
                        objectId
                    },
                    setUploadProgress
                );
                onUploadComplete?.([response.id]);
            } else {
                // Multiple files upload
                const response = await uploadMultipleFiles(
                    {
                        files: fileArray,
                        type,
                        objectId
                    },
                    setUploadProgress
                );
                onUploadComplete?.(response.fileIds.map(f => f.id));
            }

            setUploadProgress(0);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : t('files.error.uploadFailed');
            onUploadError?.(errorMessage);
            setUploadProgress(0);
        }
    }, [type, objectId, validateFile, uploadFile, uploadMultipleFiles, onUploadComplete, onUploadError, t]);

    // Handle file input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleUpload(files);
        }
    }, [handleUpload]);

    // Handle drag events
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragActive(true);
        }
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files);
        }
    }, [handleUpload]);

    return (
        <div className={`file-upload-container ${className}`}>
            <div
                className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isUploading ? 'pointer-events-none opacity-50' : 'hover:border-blue-400 hover:bg-gray-50'}
        `}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleInputChange}
                    disabled={isUploading}
                    className="hidden"
                    id={`file-upload-${type}-${objectId}`}
                />

                <label
                    htmlFor={`file-upload-${type}-${objectId}`}
                    className="cursor-pointer flex flex-col items-center space-y-2"
                >
                    {children || (
                        <>
                            <svg
                                className="w-12 h-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <div className="text-sm text-gray-600">
                                <span className="font-medium text-blue-600 hover:text-blue-500">
                                    {t('files.clickToUpload')}
                                </span>
                                {' '}
                                {t('files.orDragAndDrop')}
                            </div>
                            <p className="text-xs text-gray-500">
                                {accept} {t('files.upTo')} {maxSize}MB
                            </p>
                        </>
                    )}
                </label>

                {/* Upload Progress */}
                {isUploading && uploadProgress > 0 && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {t('files.uploading')} {Math.round(uploadProgress)}%
                        </p>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
