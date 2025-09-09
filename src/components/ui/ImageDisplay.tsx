import React, { useEffect, useState } from 'react';
import type { FileType } from '../../types/files';

interface ImageDisplayProps {
    objectId: number;
    type: FileType;
    alt: string;
    avatar: string;
    className?: string;
    showLoader?: boolean;
    fallbackSrc?: string;
    onClick?: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
    alt,
    avatar,
    className = '',
    fallbackSrc = '/default-placeholder.png',
    showLoader,
    onClick
}) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(showLoader);


    const handleImageError = () => {
        setHasError(true);
        setIsLoading(false);
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    return (
        <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
            {isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold"></div>
                </div>
            )}
            
            <img
                src={avatar || fallbackSrc}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-200 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                } ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
            />
            
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700 text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default ImageDisplay;
