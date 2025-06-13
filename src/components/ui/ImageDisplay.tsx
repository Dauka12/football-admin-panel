import React, { useEffect, useState } from 'react';
import { useFileStore } from '../../store/fileStore';
import { type FileType } from '../../types/files';

interface ImageDisplayProps {
    fileId?: number;
    objectId?: number;
    type?: FileType | string;
    alt?: string;
    className?: string;
    fallbackSrc?: string;
    showLoader?: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
    fileId,
    objectId,
    type,
    alt = 'Image',
    className = 'w-full h-auto',
    fallbackSrc = '/placeholder-image.jpg',
    showLoader = true
}) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const { getFile, getFilesByObject, getImageUrl, getObjectImageUrl } = useFileStore();

    useEffect(() => {
        const loadImage = async () => {
            if (!fileId && (!objectId || !type)) {
                setHasError(true);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setHasError(false);

                let imageUrl: string;

                if (fileId) {
                    // Option 1: Direct file access with blob conversion
                    imageUrl = await getFile(fileId);
                } else if (objectId && type) {
                    // Option 2: Direct URL for image tag (better for performance)
                    imageUrl = getObjectImageUrl(objectId, type);
                } else {
                    throw new Error('Invalid props: either fileId or (objectId and type) must be provided');
                }

                setImageSrc(imageUrl);
            } catch (error) {
                console.error('Failed to load image:', error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadImage();
    }, [fileId, objectId, type, getFile, getFilesByObject, getImageUrl, getObjectImageUrl]);

    // Handle image load error
    const handleImageError = () => {
        setHasError(true);
        setIsLoading(false);
    };

    // Handle successful image load
    const handleImageLoad = () => {
        setIsLoading(false);
    };

    if (isLoading && showLoader) {
        return (
            <div className={`${className} flex items-center justify-center bg-gray-100 animate-pulse`}>
                <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </div>
        );
    }

    if (hasError || !imageSrc) {
        return (
            <div className={`${className} flex items-center justify-center bg-gray-100`}>
                {fallbackSrc ? (
                    <img
                        src={fallbackSrc}
                        alt={alt}
                        className={className}
                        onError={() => {
                            // If even fallback fails, show placeholder
                            setHasError(true);
                        }}
                    />
                ) : (
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                )}
            </div>
        );
    }

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            onLoad={handleImageLoad}
            onError={handleImageError}
        />
    );
};

export default ImageDisplay;
